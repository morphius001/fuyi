# Refund Notification Contract Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

规划退款通知 verifier / normalizer 合同，不实现 runtime。

结论：下一步可以做 fake-only refund notification fixture / verifier / normalizer 小 PR，但仍不能新增 refund route、写 DB、调用 workflow、接支付宝 / 微信支付 refund API 或修改 order / payment / refund 状态。

## 基本原则

- 退款成功必须以后端 provider 异步通知验签通过或后端安全查询确认为准。
- Admin 操作成功、前端 return page、provider request HTTP 200 都不能表示退款成功。
- `refund.succeeded` 和 `refund.failed` 必须进入独立 notification contract，不与 payment success runtime 混在同一 PR。
- 退款通知只生成标准 envelope / decision，不直接执行 state mutation。

## Envelope 字段

退款通知 normalized envelope 必须包含：

```text
provider
eventId
eventType: refund.succeeded | refund.failed
providerTransactionId
providerRefundId
merchantOrderRef
paymentSessionId
amount.value
amount.currency: CNY
occurredAt
receivedAt
idempotencyKey
signature
rawPayloadDigest
riskFlags
```

必填要求：

- `providerRefundId` 必须存在。
- `merchantOrderRef` 必须存在。
- `amount.currency` 必须是 CNY。
- `idempotencyKey` 必须稳定可重复计算。
- `signature.status` 必须是 verified 才能进入后续 guard。

## Verifier Contract

后续 verifier 输入：

- raw body / raw form。
- provider headers。
- expected fake public key / cert metadata。
- receivedAt。
- expected provider。
- expected merchant id / app id / mch id。

输出：

```text
RefundNotificationVerifierResult
- verified: boolean
- fixtureOnly: true
- executable: false
- provider
- eventId
- providerRefundId
- signatureStatus
- failureCode
- rawPayloadDigest
```

必须失败：

- missing signature。
- invalid signature。
- unsupported algorithm。
- app / mch / seller id mismatch。
- timestamp outside tolerance。
- missing provider refund id。
- unsupported event type。

禁止：

- 输出 private key。
- 输出 canonical payload 明文。
- 解密真实 payload。
- 调 provider SDK。
- 改退款状态。

## Normalizer Contract

后续 normalizer 输入：

- verifier result。
- fake refund notification body。
- expected request context。

expected request context：

```text
provider
providerRefundRequestKey
merchantOrderRef
paymentSessionId
requestedAmountMinor
currency
providerTransactionId
providerRefundId
```

normalizer 必须校验：

- verifier result verified。
- event type 是 `refund.succeeded` 或 `refund.failed`。
- provider refund id matches request。
- merchant order ref matches request。
- payment session id matches request when present。
- provider transaction id matches request when present。
- amount / currency matches request。

输出：

- `ChinaPaymentNotificationEnvelope` with `eventType` refund.*。
- `fixtureOnly: true`。
- `executable: false`。

禁止：

- 输出 refund success mutation。
- 输出 provider refund request result。
- 写 inbox。
- 调 workflow。

## Notification Idempotency Key

建议格式：

```text
refund_notify:{provider}:{eventId}
```

fallback：

```text
refund_notify:{provider}:{providerRefundId}:{eventType}:{amountMinor}:{occurredAt}
```

要求：

- 不复用 provider request key。
- 不复用 payment notification key。
- 不包含 raw payload、secret、手机号、证件号、银行卡号或完整用户敏感信息。

## Failure Matrix

必须覆盖：

- missing signature -> rejected。
- invalid signature -> rejected。
- missing provider refund id -> rejected。
- non-CNY -> rejected。
- amount mismatch -> manual review。
- provider refund id mismatch -> manual review。
- merchant order mismatch -> manual review。
- duplicate same payload -> duplicate-safe。
- duplicate same id but different digest -> manual review。

## 后续 PR 顺序

推荐：

1. `refund-notification-fake-fixtures`
   - fake-only refund.succeeded / refund.failed vectors。
   - 不实现 verifier / normalizer。

2. `refund-notification-verifier-contract`
   - fake-only verifier pure function + tests。
   - 不接 SDK，不解密真实 payload。

3. `refund-notification-normalizer-contract`
   - fake-only normalizer pure function + tests。
   - 输出 envelope，`executable: false`。

4. `refund-manual-review-audit-plan`
   - manual review and audit allowlist docs。

## Go / No-Go

Go：

- fake-only fixtures / pure functions。
- no route。
- no DB。
- no provider SDK。
- no workflow。
- no state mutation。

No-Go：

- checkout runtime 变更。
- provider refund API 调用。
- Admin 点击即退款成功。
- request accepted 即退款成功。
- notification 未验签即处理。
- 写 order / payment / refund / settlement / commission / payout 状态。

## 验证记录

本轮为 docs-only notification contract plan；验证：

- `git diff --check`。
- `git status --short`、`git diff --name-only` 和 `git ls-files --others --exclude-standard` 确认只改 task / docs / ledger / queue。
