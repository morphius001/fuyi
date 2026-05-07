# 支付通知合同

## 目标

本文档定义中国本地支付 Provider 后续实现时共同遵守的通知合同。它是 `docs/payment-notification-idempotency-plan.md` 的第一层落地文档，仍然不实现任何运行时代码。

支付通知合同的作用是把不同 Provider 的原始通知先归一化，再交给后续验签、幂等、状态机和审计流程处理。

## 基本原则

- 后端 notify URL 是支付结果的唯一可信入口。
- 前端 return URL 只能用于展示 pending、success-like 或 failed-like 的查询结果，不能写支付成功状态。
- 每个 Provider Adapter 必须输出同一类 normalized envelope。
- 验签失败的通知不能进入支付状态变更入口。
- 重复通知必须能被幂等识别。
- 退款、对账、商家结算、佣金和权限仍然是独立高风险串行任务。

## Normalized Envelope

后续 Provider Adapter 应输出如下结构：

```ts
type ChinaPaymentNotificationEnvelope = {
  provider: "mock_china_pay" | "alipay" | "wechat_pay" | string
  event_id: string
  event_type: ChinaPaymentNotificationEventType
  provider_transaction_id?: string
  provider_refund_id?: string
  merchant_order_ref: string
  payment_session_id?: string
  amount: {
    value: number
    currency: "CNY"
  }
  occurred_at?: string
  received_at: string
  idempotency_key: string
  signature: ChinaPaymentNotificationSignatureResult
  raw_payload_ref?: string
  raw_payload_digest: string
  risk_flags?: string[]
}
```

说明：

- `merchant_order_ref` 是平台可定位 payment session 或 order 的引用，但不能单独作为支付成功依据。
- `payment_session_id` 如果 Provider 通知无法直接提供，可由后续安全查询补齐。
- `raw_payload_ref` 只能指向受控存储，不应在普通日志里写完整 payload。
- `raw_payload_digest` 用于排查和去重，可使用 hash 摘要。

## Event Type

建议先定义最小事件集合：

| Event type | 含义 | 当前阶段 |
| --- | --- | --- |
| `payment.succeeded` | Provider 确认支付成功 | 后续 mock skeleton 可覆盖 |
| `payment.closed` | Provider 确认交易关闭 | 后续 mock skeleton 可覆盖 |
| `payment.failed` | Provider 明确失败 | 后续 mock skeleton 可覆盖 |
| `refund.succeeded` | Provider 确认退款成功 | 暂只定义，不实现 |
| `refund.failed` | Provider 确认退款失败 | 暂只定义，不实现 |
| `reconciliation.adjusted` | 对账差异调整 | 暂只定义，不实现 |

当前只允许围绕 `payment.*` 做 mock-only skeleton。`refund.*`、`reconciliation.*`、结算和佣金必须后续单独串行。

## Signature Result

验签结果统一成：

```ts
type ChinaPaymentNotificationSignatureResult = {
  status: "verified" | "invalid" | "missing" | "unsupported"
  algorithm?: string
  key_id?: string
  verified_at?: string
  failure_code?: string
  failure_message?: string
}
```

规则：

- 只有 `status = "verified"` 的 envelope 可以进入后续 handler。
- `missing`、`invalid` 和 `unsupported` 都必须记录审计事件。
- `failure_message` 不能包含密钥、证书、完整签名串或敏感 payload。
- `key_id` 只能是配置引用或密钥版本号，不能是明文密钥。

## Idempotency Key

标准格式：

```text
payment_notify:{provider}:{event_id}
```

如果 Provider 没有稳定 `event_id`：

```text
payment_notify:{provider}:{provider_transaction_id}:{event_type}:{amount.value}:{occurred_at}
```

约束：

- key 必须可重复计算。
- key 不能包含真实密钥、手机号、完整身份证、银行卡号或卡密。
- key 应作为 inbox/event log 的唯一约束候选。

## Raw Payload

Provider 原始 payload 的处理规则：

- 运行日志只记录摘要，不记录完整 payload。
- 如果需要保存完整 payload，应进入受控存储，并设置访问权限和保留周期。
- 手机号、证件号、银行卡号、卡密、openid、unionid 等敏感信息要脱敏或加密。
- Admin UI 只能展示 provider、event id、交易号摘要、状态、错误码和时间，不展示完整 payload。

## Return URL 与 Notify URL

| 入口 | 允许做什么 | 禁止做什么 |
| --- | --- | --- |
| Return URL | 展示支付结果查询页、pending 状态、订单详情入口 | 直接标记支付成功、直接创建订单完成状态 |
| Notify URL | 验签、幂等、记录 inbox、触发受控支付状态推进 | 未验签处理、重复扣款、直接信任前端参数 |

如果 return URL 先于 notify URL 到达，页面应展示“支付结果确认中”。只有后端通知或安全查询确认后，页面才能显示最终状态。

## Provider Adapter 要求

后续三个 Provider 阶段都必须先满足同一合同：

| Provider | 当前允许范围 | 不允许范围 |
| --- | --- | --- |
| Mock China Pay | fake payload、fake signature、normalize、单测 | 改真实 payment/order 状态 |
| Alipay | 计划、配置模板、验签接口设计 | 写真实密钥、上线真实通知 |
| WeChat Pay | 计划、配置模板、验签接口设计 | 写真实证书、上线真实通知 |

真实 Provider 接入前，需要先完成：

1. Mock skeleton 的 envelope normalize 单测。
2. 本地 fake signed payload 验签测试。
3. inbox/model 的 disposable DB dry-run。
4. 明确 rollback 和 feature flag。

## 验收

当前文档任务只算通过当：

- 只修改 docs、task 和 ledger。
- `git diff --check` 通过。
- staged 文件不包含 `apps/**`、`packages/**`、`bun.lock`、`package.json` 或 `.env`。
- 明确后端 notify URL 是支付结果可信入口。
- 明确验签、幂等和 raw payload 安全边界。
