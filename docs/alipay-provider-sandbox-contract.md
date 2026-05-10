# Alipay Provider Sandbox Contract

更新时间：2026-05-10 Asia/Shanghai

## 资料来源

本合同只做 sandbox / contract 设计，不实现支付宝 Provider：

- 支付宝开放平台网页/移动应用接入入口，要求创建应用、完成开发配置并提交审核上线。  
  https://open.alipay.com/module/webApp
- 支付宝开放平台开发者工具，提供 SDK、生成密钥、签名、验签、格式转换和密钥匹配工具。  
  https://open.alipay.com/tool
- 支付宝开放平台支持中心，包含沙箱、参数签名、响应验签等入口。  
  https://open.alipay.com/support/supportCenter.htm
- Alipay / Antom 签名文档，接收通知时必须验证 Alipay request signature。  
  https://iopenhome.alipay.com/docs/ac/ams/digital_signature?pageVersion=30

## 结论

支付宝 Provider 的下一步只能是 sandbox contract 或 disabled-by-default adapter。它不能直接接 checkout，不能写真实密钥，不能执行 payment workflow，不能把同步跳转页当作支付成功。

支付宝支付成功候选入口只能是 `notify_url` 的后端异步通知，且必须验签、幂等、可重试，并写入 payment notification inbox / event log。

## Provider ID

建议：

```text
alipay_sandbox
alipay
```

其中：

- `alipay_sandbox` 只能用于测试 / sandbox。
- `alipay` production 默认 disabled。
- provider registry 第一版必须显式拒绝 production enable，除非 release gate 全部通过。

## 配置键名

只允许写 key 名，不写真实值：

```text
CHINA_PAYMENT_PROVIDER_ALIPAY_ENABLED=false
CHINA_PAYMENT_PROVIDER_ALIPAY_MODE=sandbox
CHINA_PAYMENT_ALIPAY_APP_ID_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_MERCHANT_ID_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_PRIVATE_KEY_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_PUBLIC_KEY_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_APP_CERT_SN_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_ROOT_CERT_SN_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_NOTIFY_URL_BASE=<url>
CHINA_PAYMENT_ALIPAY_RETURN_URL_BASE=<url>
```

禁止：

- app id 明文。
- merchant id 明文。
- private key 明文。
- 支付宝公钥 / 证书全文明文。
- webhook token 明文。

## Create Payment Contract

输入：

```ts
type AlipayCreatePaymentInput = {
  merchantOrderRef: string
  amountValue: number
  currency: "CNY"
  subject: string
  notifyUrl: string
  returnUrl?: string
  expiresAt?: string
  metadata?: Record<string, unknown>
}
```

输出：

```ts
type AlipayCreatePaymentResult = {
  provider: "alipay_sandbox" | "alipay"
  providerPaymentId: string
  merchantOrderRef: string
  paymentUrl?: string
  qrCodeUrl?: string
  clientPayload?: Record<string, unknown>
  expiresAt?: string
  rawPayloadDigest: string
}
```

限制：

- 只允许 `CNY`。
- `amountValue` 必须为正整数分。
- `notifyUrl` 必填。
- `returnUrl` 可选但不能完成订单。
- `rawPayloadDigest` 只能是 digest，不能存 raw payload 明文。

## Notify Normalize Contract

输入：

```ts
type AlipayRawNotificationInput = {
  headers: Record<string, string | string[] | undefined>
  form: Record<string, string | undefined>
  receivedAt: string
}
```

归一化输出：

```ts
type NormalizedAlipayNotification = {
  provider: "alipay_sandbox" | "alipay"
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

如果没有稳定 notify id：

```text
payment_notify:alipay:<out_trade_no>:<trade_no>
```

禁止使用随机 UUID。

## Verify Contract

必须校验：

- RSA2 / certificate mode 配置。
- sign_type。
- signature。
- canonicalized notify params。
- app id / seller id。
- out_trade_no。
- trade_no。
- total_amount。
- currency CNY。

验签失败：

- 不写 payment success。
- 可写 rejected event log。
- 返回受控失败。
- 不输出 raw signature 或 key。

## Return URL Contract

`return_url` 只允许展示：

- pending。
- waiting provider notification。
- order not confirmed yet。

禁止：

- 调用 `placeOrder()`。
- 设置 payment success。
- 创建 refund。
- 创建 settlement / commission。

## Fake Notify Test Matrix

第一版 contract-only 或 disabled adapter 至少准备：

- verified payment succeeded。
- invalid signature。
- wrong app id。
- amount mismatch。
- currency mismatch。
- provider mismatch。
- duplicate notify id。
- missing trade_no。
- unknown out_trade_no。
- closed / failed trade status。

## No-Go

任一命中停止：

- 需要真实支付宝 app id / merchant id / private key 写入 repo。
- 需要直接接 checkout。
- 同步跳转页完成订单。
- 未验签通知推进 payment/order。
- 未写入 inbox / event log。
- 未经过 DB-backed rehearsal。
- 与退款、对账、结算、佣金、打款同 PR。

## 下一步

推荐：

1. `wechat-pay-provider-sandbox-contract`
2. `provider-secret-config-template`
3. `alipay-provider-disabled-adapter-skeleton`

其中 `alipay-provider-disabled-adapter-skeleton` 也必须保持 disabled-by-default，不接 checkout。

## 本 PR 验证

```bash
git diff --check
```

预期：无输出。

