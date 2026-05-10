# WeChat Pay Provider Fake Notify Test Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

本计划定义微信支付 Provider 从 disabled adapter 进入 fake notify / test vector 阶段的测试边界。

它仍不是可用支付 runtime，不接微信支付 SDK，不接 checkout，不读取真实密钥，不执行 payment workflow。

## 当前基线

已具备：

- `docs/wechat-pay-provider-sandbox-contract.md`。
- `docs/provider-secret-config-template.md`。
- `createDisabledWechatPayProviderAdapter()`。
- `docs/wechat-pay-provider-disabled-adapter-validation.md`。

仍未具备：

- 真实微信支付 SDK。
- 官方或 sandbox test vector。
- fake platform key / fake APIv3 key fixture。
- verify/decrypt helper。
- normalize helper。
- provider route。
- workflow execution adapter。

## Test Vector 文件边界

建议后续新增：

```text
packages/api/src/modules/china-payment-notification/wechat-pay-test-vectors.ts
packages/api/src/modules/china-payment-notification/wechat-pay-notification-verifier.ts
packages/api/src/modules/china-payment-notification/wechat-pay-notification-normalizer.ts
packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-notification-verifier.unit.spec.ts
packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-notification-normalizer.unit.spec.ts
```

要求：

- test vector 只能使用 fake key / fake certificate / fake ciphertext。
- fake private key 必须带明显测试标记，并仅用于本地 unit test。
- 不写真实 app id、mch id、merchant private key、APIv3 key、平台证书、公钥或 token。
- 不修改 `.env` / `.env.template`。
- 不新增 route。

## Fake Raw Notification Shape

测试输入建议：

```ts
type WechatPayFakeRawNotification = {
  headers: {
    "wechatpay-timestamp": string
    "wechatpay-nonce": string
    "wechatpay-signature": string
    "wechatpay-serial": string
  }
  rawBody: string
  receivedAt: string
}
```

`rawBody` 必须保留原始字符串用于验签，不能从 parsed JSON 重新序列化。

fake body 结构建议：

```json
{
  "id": "evt_wechat_fake_001",
  "create_time": "2026-05-10T12:00:00+08:00",
  "event_type": "TRANSACTION.SUCCESS",
  "resource_type": "encrypt-resource",
  "resource": {
    "algorithm": "AEAD_AES_256_GCM",
    "ciphertext": "<fake-ciphertext>",
    "associated_data": "transaction",
    "nonce": "<fake-nonce>"
  }
}
```

fake decrypted resource 建议：

```json
{
  "appid": "wx_fake_test_app",
  "mchid": "mch_fake_test_001",
  "out_trade_no": "pay_wechat_fake_001",
  "transaction_id": "4200000000000000000000000001",
  "trade_state": "SUCCESS",
  "success_time": "2026-05-10T12:00:00+08:00",
  "amount": {
    "total": 128560,
    "payer_total": 128560,
    "currency": "CNY",
    "payer_currency": "CNY"
  }
}
```

这些值只能用于 test fixture，不代表真实商户配置。

## Verification Helper Contract

建议输出：

```ts
type WechatPayNotificationVerificationResult = {
  signatureStatus: "verified" | "failed"
  decryptStatus: "decrypted" | "failed"
  serial: string
  rawPayloadDigest: string
  decryptedPayloadDigest?: string
  failureCode?: string
}
```

必须检查：

- `Wechatpay-Timestamp` 存在且在允许时间窗口内。
- `Wechatpay-Nonce` 存在。
- `Wechatpay-Signature` 存在。
- `Wechatpay-Serial` 对应 fake platform key。
- signature 使用原始 body。
- resource algorithm 是 `AEAD_AES_256_GCM`。
- fake APIv3 key 能解出 resource。

失败时：

- 不输出 decrypted payload 明文。
- 不写 payment success。
- 不调用 workflow。
- 只返回受控 failure code。

## Normalize Helper Contract

建议输出：

```ts
type NormalizedWechatPayFakeNotification = {
  provider: "wechat_pay"
  eventType: "payment.succeeded" | "payment.failed" | "payment.closed" | "unknown"
  merchantOrderRef: string
  providerTransactionId?: string
  providerEventId: string
  amountValue: number
  currency: "CNY"
  signatureStatus: "verified" | "failed"
  decryptStatus: "decrypted" | "failed"
  idempotencyKey: string
  rawPayloadDigest: string
  receivedAt: string
}
```

幂等 key：

```text
payment_notify:wechat_pay:<event_id>
```

fallback：

```text
payment_notify:wechat_pay:<out_trade_no>:<transaction_id>
```

## Test Matrix

第一批测试：

- verified payment succeeded。
- invalid signature。
- missing signature。
- wrong serial。
- missing platform key。
- timestamp outside tolerance。
- decrypt failure。
- unsupported algorithm。
- wrong appid。
- wrong mchid。
- amount mismatch。
- currency mismatch。
- provider mismatch。
- duplicate event id idempotency key。
- missing transaction_id。
- missing out_trade_no。
- unknown trade_state。
- closed / failed trade state maps to non-success。

## Go / No-Go

Go 条件：

- fake key / fake cert fixture 明确不可生产使用。
- verifier 和 normalizer 是纯函数。
- focused tests 覆盖成功、失败、重复和金额/币种/provider mismatch。
- 不新增 route。
- 不执行 workflow。
- payment harness 纳入 tests。

No-Go：

- 需要真实微信支付 app id、mch id、private key、APIv3 key、平台证书、公钥或 token。
- 需要接微信支付 SDK。
- 需要接 checkout 或 return_url。
- 需要把 fake notify 结果推进 payment/order。
- 需要连接 DB 或执行 workflow。
- 需要同 PR 做退款、对账、结算、佣金、打款、分账、履约或物流。

## 后续 PR 拆分

推荐：

1. `wechat-pay-fake-notify-fixtures`
   - 只新增 fake vectors。
   - 不新增 verifier runtime。

2. `wechat-pay-notification-verifier-contract`
   - 纯函数验签 / 解密 contract。
   - 只用 fake key。

3. `wechat-pay-notification-normalizer-contract`
   - 纯函数归一化。
   - 不写 inbox / event log。

4. `wechat-pay-fake-notify-harness`
   - 将 WeChat fake notify tests 纳入 payment harness。

## 本 PR 验证

```bash
git diff --check
```

预期：无输出。
