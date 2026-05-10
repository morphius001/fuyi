# WeChat Pay Provider Sandbox Contract

更新时间：2026-05-10 Asia/Shanghai

## 资料来源

本合同只做 sandbox / contract 设计，不实现微信支付 Provider：

- 微信支付商户文档：支付成功回调通知通过下单接口传入的 `notify_url` 以 POST 发送，通知资源为加密数据，商户需使用 APIv3 密钥解密。  
  https://pay.wechatpay.cn/doc/v3/merchant/4012791861
- 微信支付商户文档：回调验签需用 `Wechatpay-Timestamp`、`Wechatpay-Nonce`、请求主体和 `Wechatpay-Signature`，并按 `Wechatpay-Serial` 选择微信支付平台证书或微信支付公钥。  
  https://pay.wechatpay.cn/doc/v3/merchant/4012791861
- 微信支付 API v3 官方 Go SDK：包含请求签名、应答验签、回调通知验签和解密、平台证书下载等能力说明。  
  https://github.com/wechatpay-apiv3/wechatpay-go

## 结论

微信支付 Provider 的下一步只能是 sandbox contract 或 disabled-by-default adapter。它不能直接接 checkout，不能写真实密钥，不能执行 payment workflow，不能把前端微信返回页当作支付成功。

微信支付支付成功候选入口只能是 `notify_url` 的后端异步通知，且必须验签、解密、幂等、可重试，并写入 payment notification inbox / event log。

## Provider ID

建议：

```text
wechat_pay_sandbox
wechat_pay
```

其中：

- `wechat_pay_sandbox` 只能用于测试 / sandbox。
- `wechat_pay` production 默认 disabled。
- provider registry 第一版必须显式拒绝 production enable，除非 release gate 全部通过。

## 配置键名

只允许写 key 名，不写真实值：

```text
CHINA_PAYMENT_PROVIDER_WECHAT_PAY_ENABLED=false
CHINA_PAYMENT_PROVIDER_WECHAT_PAY_MODE=sandbox
CHINA_PAYMENT_WECHAT_PAY_APP_ID_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_MCH_ID_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_PRIVATE_KEY_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_MERCHANT_CERT_SERIAL_NO_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_API_V3_KEY_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_PLATFORM_CERT_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_PUBLIC_KEY_ID_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_NOTIFY_URL_BASE=<url>
CHINA_PAYMENT_WECHAT_PAY_RETURN_URL_BASE=<url>
```

禁止：

- app id 明文。
- mch id 明文。
- merchant private key 明文。
- APIv3 key 明文。
- 平台证书、微信支付公钥或商户证书全文明文。
- webhook token 明文。

## Create Payment Contract

输入：

```ts
type WechatPayCreatePaymentInput = {
  merchantOrderRef: string
  amountValue: number
  currency: "CNY"
  description: string
  notifyUrl: string
  payerOpenId?: string
  clientIp?: string
  expiresAt?: string
  metadata?: Record<string, unknown>
}
```

输出：

```ts
type WechatPayCreatePaymentResult = {
  provider: "wechat_pay_sandbox" | "wechat_pay"
  prepayId?: string
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
- `payerOpenId` 只用于 JSAPI / 小程序类场景；H5 / Native 不应强制需要。
- `clientPayload` 只能用于前端调起微信支付，不代表支付成功。
- `rawPayloadDigest` 只能是 digest，不能存 raw payload 明文。

## Notify Normalize Contract

输入：

```ts
type WechatPayRawNotificationInput = {
  headers: {
    "wechatpay-timestamp"?: string
    "wechatpay-nonce"?: string
    "wechatpay-signature"?: string
    "wechatpay-serial"?: string
    [key: string]: string | string[] | undefined
  }
  rawBody: string
  receivedAt: string
}
```

归一化输出：

```ts
type NormalizedWechatPayNotification = {
  provider: "wechat_pay_sandbox" | "wechat_pay"
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

如果没有稳定 event id：

```text
payment_notify:wechat_pay:<out_trade_no>:<transaction_id>
```

禁止使用随机 UUID。

## Verify And Decrypt Contract

必须校验：

- `Wechatpay-Timestamp`。
- `Wechatpay-Nonce`。
- `Wechatpay-Signature`。
- `Wechatpay-Serial` 对应的平台证书或微信支付公钥。
- 原始请求 body，而不是重新序列化后的 JSON。
- 回调 resource 加密算法和密文结构。
- APIv3 key 解密结果。
- appid / mchid。
- out_trade_no。
- transaction_id。
- amount total / payer_total。
- currency CNY。
- payment session / provider reference。

验签或解密失败：

- 不写 payment success。
- 可写 rejected event log。
- 返回受控失败。
- 不输出 raw signature、private key、APIv3 key 或证书全文。

## Return URL Contract

微信前端返回页只允许展示：

- pending。
- waiting provider notification。
- order not confirmed yet。

禁止：

- 调用 `placeOrder()`。
- 设置 payment success。
- 创建 refund。
- 创建 settlement / commission。
- 创建 fulfillment / shipment / waybill。

## Fake Notify Test Matrix

第一版 contract-only 或 disabled adapter 至少准备：

- verified payment succeeded。
- invalid signature。
- wrong serial / missing platform cert。
- decrypt failure。
- wrong appid。
- wrong mchid。
- amount mismatch。
- currency mismatch。
- provider mismatch。
- duplicate event id。
- missing transaction_id。
- unknown out_trade_no。
- closed / failed trade state。

## No-Go

任一命中停止：

- 需要真实微信支付 app id / mch id / merchant private key / APIv3 key / platform cert 写入 repo。
- 需要直接接 checkout。
- 前端微信返回页完成订单。
- 未验签通知推进 payment/order。
- 未解密通知推进 payment/order。
- 未写入 inbox / event log。
- 未经过 DB-backed rehearsal。
- 与退款、对账、结算、佣金、打款、分账同 PR。

## 下一步

推荐：

1. `provider-secret-config-template`
2. `wechat-pay-provider-disabled-adapter-skeleton`
3. `alipay-provider-disabled-adapter-skeleton`

其中 `wechat-pay-provider-disabled-adapter-skeleton` 也必须保持 disabled-by-default，不接 checkout。

## 本 PR 验证

```bash
git diff --check
```

预期：无输出。
