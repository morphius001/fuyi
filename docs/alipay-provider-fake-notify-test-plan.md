# Alipay Provider Fake Notify Test Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

本计划定义支付宝 Provider 从 disabled adapter 进入 fake notify / test vector 阶段的测试边界。

它仍不是可用支付 runtime，不接支付宝 SDK，不接 checkout，不读取真实密钥，不执行 payment workflow。

## 当前基线

已具备：

- `docs/alipay-provider-sandbox-contract.md`。
- `docs/provider-secret-config-template.md`。
- `createDisabledAlipayProviderAdapter()`。
- `docs/alipay-provider-disabled-adapter-validation.md`。

仍未具备：

- 真实支付宝 SDK。
- 官方或 sandbox test vector。
- fake RSA private key / fake Alipay public key fixture。
- notify param canonicalization helper。
- verify helper。
- normalize helper。
- provider route。
- workflow execution adapter。

## Test Vector 文件边界

建议后续新增：

```text
packages/api/src/modules/china-payment-notification/alipay-test-vectors.ts
packages/api/src/modules/china-payment-notification/alipay-notification-verifier.ts
packages/api/src/modules/china-payment-notification/alipay-notification-normalizer.ts
packages/api/src/modules/china-payment-notification/__tests__/alipay-notification-verifier.unit.spec.ts
packages/api/src/modules/china-payment-notification/__tests__/alipay-notification-normalizer.unit.spec.ts
```

要求：

- test vector 只能使用 fake RSA key / fake public key / fake certificate metadata。
- fake private key 必须带明显测试标记，并仅用于本地 unit test。
- 不写真实 app id、merchant id、private key、公钥、证书或 token。
- 不修改 `.env` / `.env.template`。
- 不新增 route。

## Fake Raw Notification Shape

测试输入建议：

```ts
type AlipayFakeRawNotification = {
  form: Record<string, string>
  headers?: Record<string, string | string[] | undefined>
  receivedAt: string
}
```

fake form 建议：

```json
{
  "notify_id": "notify_alipay_fake_001",
  "notify_type": "trade_status_sync",
  "notify_time": "2026-05-10 12:00:00",
  "app_id": "app_fake_test_001",
  "seller_id": "merchant_fake_test_001",
  "out_trade_no": "pay_alipay_fake_001",
  "trade_no": "trade_alipay_fake_001",
  "trade_status": "TRADE_SUCCESS",
  "total_amount": "1285.60",
  "currency": "CNY",
  "sign_type": "RSA2",
  "sign": "<fake-signature>"
}
```

这些值只能用于 test fixture，不代表真实商户配置。

## Canonicalization Contract

验签前必须构造 canonical string：

- 排除 `sign`。
- 排除空值。
- 按参数名 ASCII 升序。
- 使用原始 form values，不做浮点重算。
- 保留 `total_amount` 的原始字符串用于验签，金额校验另行转换为分。

禁止：

- 用 JSON stringify 直接验签。
- 用前端 return_url 参数代替 notify form。
- 忽略 `sign_type`。

## Verification Helper Contract

建议输出：

```ts
type AlipayNotificationVerificationResult = {
  signatureStatus: "verified" | "failed"
  signType: "RSA2" | "unsupported"
  rawPayloadDigest: string
  canonicalPayloadDigest: string
  failureCode?: string
}
```

必须检查：

- `sign_type` 是 `RSA2`。
- `sign` 存在。
- fake public key / fake certificate metadata 可用。
- canonical string 构造稳定。
- signature 使用 fake public key 验证。
- `app_id` / `seller_id` 与 expected fake refs 匹配。

失败时：

- 不写 payment success。
- 不调用 workflow。
- 不输出 private key、public key、raw signature 或完整 canonical string 到日志。
- 只返回受控 failure code。

## Normalize Helper Contract

建议输出：

```ts
type NormalizedAlipayFakeNotification = {
  provider: "alipay"
  eventType: "payment.succeeded" | "payment.failed" | "payment.closed" | "unknown"
  merchantOrderRef: string
  providerTransactionId?: string
  providerEventId: string
  amountValue: number
  currency: "CNY"
  signatureStatus: "verified" | "failed"
  idempotencyKey: string
  rawPayloadDigest: string
  receivedAt: string
}
```

幂等 key：

```text
payment_notify:alipay:<notify_id>
```

fallback：

```text
payment_notify:alipay:<out_trade_no>:<trade_no>
```

## Test Matrix

第一批测试：

- verified TRADE_SUCCESS。
- invalid signature。
- missing signature。
- unsupported sign_type。
- canonicalization excludes sign。
- wrong app id。
- wrong seller id。
- amount mismatch。
- non-CNY currency。
- provider mismatch。
- duplicate notify id idempotency key。
- missing trade_no。
- missing out_trade_no。
- unknown trade_status。
- TRADE_CLOSED maps to closed。
- TRADE_FINISHED maps to succeeded only when policy allows it。
- WAIT_BUYER_PAY maps to unknown / non-success。

## Go / No-Go

Go 条件：

- fake RSA key / fake public key fixture 明确不可生产使用。
- verifier 和 normalizer 是纯函数。
- focused tests 覆盖成功、失败、重复、金额/币种/provider mismatch 和 canonicalization。
- 不新增 route。
- 不执行 workflow。
- payment harness 纳入 tests。

No-Go：

- 需要真实支付宝 app id、merchant id、private key、公钥、证书或 token。
- 需要接支付宝 SDK。
- 需要接 checkout 或 return_url。
- 需要把 fake notify 结果推进 payment/order。
- 需要连接 DB 或执行 workflow。
- 需要同 PR 做退款、对账、结算、佣金、打款、分账、履约或物流。

## 后续 PR 拆分

推荐：

1. `alipay-fake-notify-fixtures`
   - 只新增 fake vectors。
   - 不新增 verifier runtime。

2. `alipay-notification-verifier-contract`
   - 纯函数 canonicalization / 验签 contract。
   - 只用 fake key。

3. `alipay-notification-normalizer-contract`
   - 纯函数归一化。
   - 不写 inbox / event log。

4. `alipay-fake-notify-harness`
   - 将 Alipay fake notify tests 纳入 payment harness。

## 本 PR 验证

```bash
git diff --check
```

预期：无输出。
