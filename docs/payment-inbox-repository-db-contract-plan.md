# 支付通知 Inbox DB Repository Contract 计划

## 目标

为未来 DB-backed payment notification inbox repository 定义合同。本轮只写计划，不实现 repository，不连接数据库，不注册 migration。

## Repository 方法草案

```ts
type ReceiveResult =
  | { status: "received"; record: PaymentNotificationInboxRecord }
  | { status: "duplicate"; record: PaymentNotificationInboxRecord };

interface PaymentNotificationInboxRepository {
  receive(envelope: ChinaPaymentNotificationEnvelope): Promise<ReceiveResult>;
  appendEvent(input: AppendPaymentNotificationEventInput): Promise<void>;
  markProcessing(idempotencyKey: string): Promise<PaymentNotificationInboxRecord>;
  markProcessed(idempotencyKey: string): Promise<PaymentNotificationInboxRecord>;
  markRetryableFailed(input: MarkPaymentNotificationFailedInput): Promise<PaymentNotificationInboxRecord>;
  markTerminalFailed(input: MarkPaymentNotificationFailedInput): Promise<PaymentNotificationInboxRecord>;
  getByIdempotencyKey(idempotencyKey: string): Promise<PaymentNotificationInboxRecord | null>;
}
```

第一版真实实现只能服务 mock inbox-only route。它不能推进 payment/order 状态。

## Transaction 边界

必须同一事务：

- insert inbox row
- insert `received` event log
- insert `verified` / `failed` event log

重复通知：

- 由 `(provider, idempotency_key)` 唯一约束兜底。
- 捕获 duplicate key 后读取已有 inbox。
- 追加 `dedupe_hit` event log。
- 返回 duplicate 响应。

## 状态流转

允许流转：

```text
received -> verified -> processing -> processed
received -> terminal_failed
verified -> retryable_failed -> processing
verified -> ignored_duplicate
```

禁止：

- `processed -> processing`
- `terminal_failed -> processed`
- `ignored_duplicate -> processed`
- 未验签直接进入 `processed`

## Event Log 一致性

所有状态变更必须有 event log：

| 状态/动作 | event log action |
| --- | --- |
| 接收通知 | `received` |
| 验签通过 | `verified` |
| 重复通知 | `dedupe_hit` |
| handler 开始 | `handler_started` |
| command 生成 | `command_prepared` |
| command 跳过 | `command_skipped` |
| command 阻断 | `command_blocked` |
| 需要人工复核 | `manual_review_required` |
| 处理完成 | `processed` |
| 可重试失败 | `retry_scheduled` |
| 终态失败 | `failed` |

## Error Mapping

| Code | 类型 | 说明 |
| --- | --- | --- |
| `SIGNATURE_MISSING` | terminal | 缺少签名 |
| `SIGNATURE_INVALID` | terminal | 验签失败 |
| `PAYLOAD_INVALID` | terminal | schema 错误 |
| `CURRENCY_UNSUPPORTED` | terminal | 非 CNY |
| `EVENT_TYPE_UNSUPPORTED` | terminal | 未知 event type |
| `DB_UNIQUE_CONFLICT` | duplicate | 幂等冲突 |
| `DB_LOCK_TIMEOUT` | retryable | 锁等待超时 |
| `DB_CONNECTION_INTERRUPTED` | retryable | 临时连接错误 |

## Metadata 安全

允许：

- provider
- event id
- idempotency key
- command type
- block type
- retryable
- sanitized reason
- error code

禁止：

- raw provider payload
- 完整签名串
- 私钥、证书、app secret
- 手机号明文
- openid / unionid 明文
- 身份证、银行卡、卡密

## 后续 PR 拆分

1. `payment-inbox-repository-interface`
   - 只加 interface / types / tests。
   - 不写 DB adapter。

2. `payment-inbox-repository-db-adapter-skeleton`
   - DB adapter skeleton + mocked ORM tests。
   - 不接 route。

3. `payment-inbox-repository-disposable-db-test`
   - 在 disposable DB 跑 repository integration test。
   - 不连接预发或生产。

4. `mock-webhook-inbox-only-route`
   - 只接 mock provider。
   - 只写 inbox/event log。
   - 不调用 payment workflow。

## 验收

任何 repository 实现 PR 都必须验证：

- duplicate idempotency race。
- event log 和 inbox 同事务。
- retryable / terminal error mapping。
- metadata 脱敏。
- runtime grep 不调用 payment workflow。
- 不触碰 refund、settlement、commission、permission。
