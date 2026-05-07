# Mock Payment Webhook Inbox-only Route 计划

## 目标

设计未来 mock payment webhook route 的 inbox-only 阶段。本轮只写计划，不新增 route，不注册 migration，不接 runtime。

## Route 草案

```text
POST /hooks/china-payments/mock/notifications
```

命名原则：

- 放在明确的 China payment mock 命名空间。
- 不复用支付宝或微信支付真实路径。
- 不暴露为生产 Provider 回调入口。

## Feature Flag

默认关闭：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=false
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=disabled
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
```

允许模式：

- `disabled`: 不处理通知。
- `mock_inbox_only`: 只允许 mock provider normalize、验签、写 inbox/event log。
- `mock_prepare_command`: 允许 mock provider 走 state guard + command/audit mapper，但仍不执行 workflow。

禁止模式：

- `alipay_live`
- `wechat_pay_live`
- `workflow_execute`

这些必须后续单独 PR 和人工审批。

## 请求输入

Headers：

| Header | 说明 |
| --- | --- |
| `x-mock-payment-signature` | fake signature |
| `x-mock-payment-event-id` | mock event id，可选 |
| `x-mock-payment-timestamp` | mock timestamp，可选 |
| `x-mock-payment-key-id` | mock key id，可选 |

Body：

```json
{
  "event_id": "evt_mock_payment_succeeded_001",
  "event_type": "payment.succeeded",
  "merchant_order_ref": "pay_mock_001",
  "payment_session_id": "payses_mock_001",
  "provider_transaction_id": "mock_txn_001",
  "amount": 128560,
  "currency": "CNY",
  "occurred_at": "2026-05-07T00:00:00.000Z"
}
```

## Inbox-only 行为

允许：

- 读取 raw body。
- 计算 raw payload digest。
- fake signature verify。
- normalize envelope。
- 生成 idempotency key。
- 写 inbox row。
- 写 event log：`received`、`verified`、`failed`、`dedupe_hit`。
- 对重复通知返回安全响应。

禁止：

- 不调用 payment workflow。
- 不修改 payment session。
- 不修改 order。
- 不创建 refund。
- 不触发 settlement、commission、payout。
- 不写真实 provider payload。

## 响应语义

| 场景 | HTTP | Body |
| --- | --- | --- |
| runtime disabled | 404 或 503 | `{"status":"disabled"}` |
| 验签通过，首次接收 | 202 | `{"status":"accepted","mode":"mock_inbox_only"}` |
| 重复通知 | 200 | `{"status":"duplicate","mode":"mock_inbox_only"}` |
| 验签失败 | 400 | `{"status":"rejected","code":"SIGNATURE_INVALID"}` |
| 缺签 | 400 | `{"status":"rejected","code":"SIGNATURE_MISSING"}` |
| schema 错误 | 400 | `{"status":"rejected","code":"PAYLOAD_INVALID"}` |
| 非 CNY | 400 | `{"status":"rejected","code":"CURRENCY_UNSUPPORTED"}` |
| 未知 event type | 400 | `{"status":"rejected","code":"EVENT_TYPE_UNSUPPORTED"}` |

真实 Provider 的重试语义未来要单独设计；mock route 不能替代支付宝/微信支付响应合同。

## 测试计划

未来 route PR 必须覆盖：

- runtime disabled 不处理通知。
- mock flag 打开后 accepted。
- duplicate 返回 duplicate 且不新增 inbox。
- missing signature。
- invalid signature。
- malformed JSON。
- non-CNY。
- unsupported event type。
- amount mismatch 只进入 guard/audit，不改交易状态。
- runtime grep 确认没有 workflow execution。

## 验收边界

第一版 route 即使实现，也只能是 mock inbox-only：

- 不注册真实支付 Provider。
- 不接支付宝 / 微信支付。
- 不执行 payment workflow。
- 不改变 checkout、cart、order、payment、refund、settlement、commission 或 permission。
- 仍需 `payment-runtime-disabled-plan` 中的 disposable DB 和 preprod dry-run 门禁。
