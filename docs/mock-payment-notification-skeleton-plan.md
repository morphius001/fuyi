# Mock Payment Notification Skeleton 计划

## 目标

本文档规划后续 Mock China Payment notification skeleton 的最小可实现范围。当前仍是 docs-only，不写运行时代码。

Mock skeleton 的目的不是接入真实支付，而是在真实支付宝、微信支付和退款/对账/结算前，先验证以下基础边界：

- fake signature verifier 是否能表达验签成功和失败。
- fake payload normalizer 是否能输出统一 `ChinaPaymentNotificationEnvelope`。
- fake idempotency key 是否稳定可重复。
- skeleton 默认不注册、不影响 checkout、不改变 payment/order/refund 状态。

## 文件边界建议

后续真正实现时建议把代码限制在未注册的 mock/provider 边界，例如：

```text
packages/api/src/modules/china-payment-notification/
  contracts/
  mock/
  __tests__/
```

实现 PR 必须保持：

- 不修改 Medusa/Mercur core。
- 不修改现有真实 payment provider。
- 不注册到 `medusa-config.ts`。
- 不新增 Admin UI。
- 不新增 Storefront 支付入口。
- 不新增真实数据库 migration。

## Mock Adapter 组成

后续 skeleton 最多包含：

| 组件 | 作用 | 当前限制 |
| --- | --- | --- |
| `mock-signature-verifier` | 校验 fake header 和 fake secret marker | 不读取真实密钥 |
| `mock-payload-normalizer` | 把 fake payload 转成 normalized envelope | 不查询真实 order |
| `mock-idempotency-key` | 生成稳定 key | 不写数据库 |
| `mock-fixtures` | 提供 fake success/fail/invalid payload | 不含真实用户数据 |
| `unit tests` | 验证 normalize 和失败边界 | 不启动真实服务 |

## Fake Signature

建议 fake 请求头：

```text
x-fuyi-mock-pay-signature: sha256=<digest>
x-fuyi-mock-pay-event-id: evt_mock_...
x-fuyi-mock-pay-timestamp: 2026-05-07T00:00:00.000Z
```

规则：

- fake verifier 只用于本地测试。
- fake secret 只能是测试常量，例如 `mock_test_secret`，不能使用真实密钥格式。
- 验签失败时只返回 `signature.status = "invalid"`，不得抛出会中断审计记录的未捕获异常。

## Fake Payload

最小 fake payload：

```json
{
  "event_id": "evt_mock_payment_succeeded_001",
  "event_type": "payment.succeeded",
  "merchant_order_ref": "pay_mock_001",
  "provider_transaction_id": "mock_txn_001",
  "amount": 128560,
  "currency": "CNY",
  "occurred_at": "2026-05-07T00:00:00.000Z"
}
```

说明：

- 金额用最小货币单位，避免浮点误差。
- `merchant_order_ref` 只作为 fake 引用，不查询真实订单。
- payload 不包含手机号、真实姓名、地址、卡号、openid、unionid 或卡密。

## 单元测试清单

后续实现 PR 必须覆盖：

- valid fake signature -> `signature.status = "verified"`。
- invalid fake signature -> `signature.status = "invalid"`，不进入 handler。
- same event id -> same idempotency key。
- same provider transaction but different event type -> different idempotency key。
- amount mismatch fixture -> normalizer 保留异常 flag，不修改状态。
- unknown merchant order ref -> normalizer 输出 envelope，但 handler 层应后续标为 unknown reference。

## 出口条件

只有满足以下条件后，才允许进入下一步 inbox/model dry-run：

- Mock skeleton 未注册 runtime。
- 所有测试都不访问真实数据库。
- 测试不依赖真实支付密钥。
- 文档明确前端 return URL 不参与支付成功判定。
- staged 文件仍不包含真实 provider 或交易状态修改。

## 后续拆分

1. `mock-payment-notification-skeleton`
   - 写未注册 mock adapter 和单元测试。
   - 不接真实 checkout。

2. `payment-notification-inbox-model-design`
   - 设计 inbox/event log migration。
   - 先做本地 disposable DB dry-run。

3. `payment-notification-idempotency-test-harness`
   - 用 fake signed payload 验证重复通知、验签失败、金额不一致、unknown reference。

4. `mock-payment-notification-runtime`
   - 默认 disabled。
   - 需要 feature flag 和 rollback。

真实支付宝、微信支付、退款、对账、商家结算和佣金继续独立串行。
