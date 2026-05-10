# Refund Provider Real Verifier Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

下一步只能规划真实 provider refund notification verifier，不能直接实现 SDK 接入、route、DB 写入或退款状态变更。支付宝和微信支付必须分 provider 做真实验签合同；验签通过也只代表 provider notification authentic，不代表平台退款成功。

本计划把后续工作限定为 verifier-only / contract-first。真实 route、provider refund request、workflow、refund success state、settlement、commission、payout、permission、fulfillment 和 logistics 继续 No-Go。

## 资料来源

- 微信支付商户文档：退款结果回调通知，更新时间 2025-01-02。文档说明退款单状态变更时微信支付会 POST 到申请退款传入的 `notify_url`，通知含 `REFUND.SUCCESS`、`REFUND.ABNORMAL`、`REFUND.CLOSED`，资源为 `encrypt-resource`，算法为 `AEAD_AES_256_GCM`，并要求用 `Wechatpay-Timestamp`、`Wechatpay-Nonce`、请求主体和 `Wechatpay-Signature` 验签。  
  https://pay.wechatpay.cn/doc/v3/merchant/4012791865
- 微信支付商户文档：退款结果通知，更新时间 2024-12-10。文档同样要求回调验签、5 秒内应答，并在业务处理耗时较长时建议先应答再异步处理。  
  https://pay.wechatpay.cn/doc/v3/merchant/4012647469
- Alipay / Antom asynchronous notification help：异步通知通过 POST 发送到 `notify_url`，未返回 `success` 会重发，验签应使用支付宝返回参数中除 `sign_type` 和 `sign` 外的参数。  
  https://global.alipay.com/developer/helpcenter/detail?_route=sg&categoryId=67617&knowId=201602452303&sceneCode=AC_DEV
- AlipayHK asynchronous notification verification：RSA2 / RSA 验签需移除 `sign` 和 `sign_type`，按 key 升序拼接，再使用支付宝公钥验证。  
  https://docs.alipay.hk/alipayhkdocs/hk/wap_hk/asyncnotif
- Antom `alipay.trade.refund` 文档：退款请求含 `out_trade_no` / `trade_no`、`out_request_no`、`refund_amount`、`refund_currency`，同步响应含 `fund_change`、`refund_fee`、`gmt_refund_pay` 等字段。  
  https://iopenhome.alipay.com/docs/ac/solution_api/trade-refund

## Shared Verifier Boundary

后续真实 verifier 应输出统一结果，但不输出可执行命令：

```ts
type RefundProviderVerifierResult = {
  provider: "alipay" | "wechat_pay"
  providerMode: "sandbox" | "production"
  signatureStatus: "verified" | "failed"
  decryptStatus?: "decrypted" | "failed" | "not_required"
  providerEventId?: string
  providerRefundId?: string
  merchantOrderRef?: string
  merchantRefundRequestRef?: string
  providerTransactionId?: string
  eventType?: "refund.succeeded" | "refund.failed" | "refund.closed" | "refund.abnormal" | "unknown"
  amountValue?: number
  currency?: "CNY"
  rawPayloadDigest: string
  canonicalPayloadDigest?: string
  idempotencyKey?: string
  failureCode?: string
  receivedAt: string
  executable: false
}
```

必须保持：

- `executable: false`。
- raw payload 只保存 digest，不写明文。
- verifier 不读取全局 env secret；调用方必须通过 secret provider / injected key reference 传入受控 key material。
- verifier 不写 DB、不调 repository、不返回 workflow command。
- verifier failure code 必须可审计但不泄露密钥、签名原文、证书全文、APIv3 key 或 raw decrypted body。

## WeChat Pay Verifier Plan

### 输入

```ts
type WechatRefundVerifierInput = {
  headers: Record<string, string | string[] | undefined>
  rawBody: string
  receivedAt: string
  trustedPlatformCertificates: Array<{
    serial: string
    publicKeyRef: string
    notBefore?: string
    notAfter?: string
  }>
  trustedPublicKeys?: Array<{
    publicKeyId: string
    publicKeyRef: string
  }>
  apiV3KeyRef: string
  expectedMchId: string
  expectedAppId?: string
  timestampToleranceSeconds: number
}
```

### 必须校验

- `Wechatpay-Serial` 存在，并能匹配平台证书序列号或微信支付公钥 ID。
- `Wechatpay-Signature`、`Wechatpay-Timestamp`、`Wechatpay-Nonce` 存在。
- timestamp 在可接受窗口内。
- 签名串使用 timestamp、nonce 和原始请求 body，不得使用重新序列化 JSON。
- 签名通过后才允许解析 / 解密业务资源。
- `resource.algorithm` 必须是 `AEAD_AES_256_GCM`。
- 使用 APIv3 key、resource nonce、associated_data 和 ciphertext 解密。
- decrypted payload 的 `mchid`、`appid`、`out_trade_no`、`transaction_id`、`out_refund_no`、`refund_id`、金额和币种必须与本地上下文匹配。
- event type 映射：
  - `REFUND.SUCCESS` -> `refund.succeeded`
  - `REFUND.ABNORMAL` -> `refund.abnormal`
  - `REFUND.CLOSED` -> `refund.closed`
  - unknown -> `unknown` + manual review

### 幂等

首选：

```text
refund_notify:wechat_pay:<event_id>
```

fallback：

```text
refund_notify:wechat_pay:<out_refund_no>:<refund_id>:<event_type>
```

禁止：

- 随机 UUID。
- 仅用 `refund_id` 判断成功。
- different digest conflict 自动覆盖。

### 失败码

建议：

```text
WECHAT_REFUND_MISSING_HEADER
WECHAT_REFUND_UNKNOWN_SERIAL
WECHAT_REFUND_TIMESTAMP_OUT_OF_RANGE
WECHAT_REFUND_SIGNATURE_FAILED
WECHAT_REFUND_MALFORMED_BODY
WECHAT_REFUND_UNSUPPORTED_RESOURCE_ALGORITHM
WECHAT_REFUND_DECRYPT_FAILED
WECHAT_REFUND_MERCHANT_MISMATCH
WECHAT_REFUND_APP_MISMATCH
WECHAT_REFUND_AMOUNT_MISMATCH
WECHAT_REFUND_CURRENCY_MISMATCH
WECHAT_REFUND_UNKNOWN_EVENT_TYPE
```

## Alipay Verifier Plan

支付宝退款通知需要先做产品级确认：不同支付产品的退款状态可能通过交易异步通知返回，也可能要求用退款查询接口确认；不能假设 `alipay.trade.refund` 一定提供独立 refund `notify_url`。

### 输入

```ts
type AlipayRefundVerifierInput = {
  headers: Record<string, string | string[] | undefined>
  form: Record<string, string | undefined>
  receivedAt: string
  trustedAlipayPublicKeyRefs: Array<{
    keyId: string
    publicKeyRef: string
    mode: "public_key" | "certificate"
  }>
  expectedAppId: string
  expectedSellerId?: string
  expectedOutTradeNo?: string
  expectedOutRequestNo?: string
  expectedCurrency: "CNY"
}
```

### 必须校验

- `sign` 存在。
- `sign_type` 存在并只允许已配置的 `RSA2`；如需支持 `RSA`，必须单独风险确认。
- canonical payload 排除 `sign` 和 `sign_type`。
- canonical payload 使用支付宝返回的所有其他参数，按 key 升序拼接；必须允许未来新增参数参与验签。
- 使用支付宝公钥 / 证书模式验签。
- `app_id`、`seller_id` / `seller_email`、`out_trade_no` / `trade_no` 与本地上下文匹配。
- 若通知含退款字段，`out_biz_no` / `out_request_no`、`refund_fee`、`gmt_refund` / `gmt_refund_pay` 必须进入 normalized envelope。
- 若只有交易状态字段，必须进入 manual review 或 refund query follow-up，不得自动写 refund success。
- 金额字符串必须按 decimal 解析为分，不能用浮点数。
- 币种必须为 CNY；跨境或 USD 场景需单独 provider mode，不得混进当前 CNY 本地化链路。

### 幂等

首选：

```text
refund_notify:alipay:<notify_id>
```

退款字段存在时 fallback：

```text
refund_notify:alipay:<out_trade_no>:<out_biz_no|out_request_no>:<refund_fee>
```

禁止：

- 仅用 `trade_no` 判断退款成功。
- 对缺少稳定退款请求号的通知自动成功。
- 把 synchronous refund response 当作异步通知。

### 失败码

建议：

```text
ALIPAY_REFUND_MISSING_SIGN
ALIPAY_REFUND_UNSUPPORTED_SIGN_TYPE
ALIPAY_REFUND_SIGNATURE_FAILED
ALIPAY_REFUND_APP_MISMATCH
ALIPAY_REFUND_SELLER_MISMATCH
ALIPAY_REFUND_ORDER_MISMATCH
ALIPAY_REFUND_REQUEST_REF_MISSING
ALIPAY_REFUND_AMOUNT_MISMATCH
ALIPAY_REFUND_CURRENCY_MISMATCH
ALIPAY_REFUND_PRODUCT_MODE_UNCONFIRMED
ALIPAY_REFUND_UNKNOWN_STATUS
```

## Test Vector Requirements

后续 verifier contract PR 必须先提交 fake / sandbox vectors，不接真实密钥：

- WeChat valid refund success callback。
- WeChat abnormal / closed callback。
- WeChat bad signature。
- WeChat sign-test style signature。
- WeChat unknown serial。
- WeChat stale timestamp。
- WeChat decrypt failure。
- WeChat merchant / app mismatch。
- Alipay valid refund status notification with RSA2。
- Alipay missing sign / sign_type。
- Alipay future extra field included in canonical payload。
- Alipay wrong app / seller。
- Alipay amount mismatch。
- Alipay product mode unconfirmed goes manual review。

所有 fixtures 必须 redacted：

- 不包含真实 app id。
- 不包含真实 merchant id。
- 不包含真实 private key。
- 不包含真实 APIv3 key。
- 不包含真实 public certificate body。
- 不包含真实手机号、地址、身份证、银行卡或用户实名。

## Implementation Sequence

建议串行 PR：

1. `refund-wechat-real-verifier-plan`：细化微信支付真实退款 verifier 文件边界和 fixture shape，docs-only。
2. `refund-alipay-real-verifier-plan`：细化支付宝真实退款 verifier 文件边界和产品模式确认，docs-only。
3. `refund-wechat-real-verifier-contract`：纯函数 verifier + fake/sandbox vectors，不接 route。
4. `refund-alipay-real-verifier-contract`：纯函数 verifier + fake/sandbox vectors，不接 route。
5. `refund-provider-real-verifier-validation`：汇总 provider verifier 合同验证。
6. `refund-provider-inbox-route-plan`：规划 provider inbox-only route shadow。

## Verification Matrix

每个 verifier contract PR 至少需要：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-notification-verifier.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

还必须加 provider-specific focused tests，并跑 runtime grep，确认没有：

```text
providerRefundRequest
execute_workflow
refundStateMutation
settlement_adjusted
commission_adjusted
payout_adjusted
fulfillment
logistics
```

## Rollback

verifier-only PR 的 rollback 是代码级 revert。因为不接 route、不写 DB、不读真实 secret、不执行 workflow，所以不需要数据回滚。

## No-Go

仍禁止：

- 接支付宝 / 微信支付 SDK。
- 写真实密钥、证书、公钥全文或 webhook token。
- 新增真实 provider route。
- 写 inbox / event log。
- 调用 provider refund API。
- 执行 workflow。
- 写 refund success state。
- 改 settlement、commission、payout、permission、fulfillment 或 logistics。

## 下一步

建议进入 `refund-wechat-real-verifier-plan` 和 `refund-alipay-real-verifier-plan`，分别做 provider-specific docs-only 细化；不要把两个 provider 的真实 verifier、route 和状态变更放进同一个 PR。
