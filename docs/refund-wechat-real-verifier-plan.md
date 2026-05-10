# Refund WeChat Real Verifier Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

微信支付真实退款结果回调 verifier 的下一步只能是纯函数合同 PR，不接 route、不写 inbox、不调用 provider refund API、不执行 workflow。验签和解密通过只说明微信支付回调可信；平台是否写退款成功状态必须由后续 state owner handoff 和 workflow gate 单独决定。

## 资料来源

- 微信支付退款结果回调通知：退款状态变更后，微信支付会向申请退款时传入的 `notify_url` POST 通知；通知类型包括 `REFUND.SUCCESS`、`REFUND.ABNORMAL`、`REFUND.CLOSED`，资源为加密数据，算法为 `AEAD_AES_256_GCM`。  
  https://pay.wechatpay.cn/doc/v3/merchant/4012791865
- 微信支付退款结果通知：回调通知必须验签；业务处理耗时较长时，商户可先应答再异步处理；如果未正确应答，微信支付会按规则重试。  
  https://pay.wechatpay.cn/doc/v3/merchant/4012647469
- 微信支付 API v3 SDK 说明：官方 SDK 提供请求签名、应答验签、回调通知验签和解密、平台证书下载等能力；本阶段不接 SDK，只规划合同边界。  
  https://github.com/wechatpay-apiv3/wechatpay-go

## Planned Files

后续 contract PR 建议新增或修改：

```text
packages/api/src/modules/china-payment-notification/wechat-pay-refund-notification-verifier.ts
packages/api/src/modules/china-payment-notification/wechat-pay-refund-notification-test-vectors.ts
packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-refund-notification-verifier.unit.spec.ts
packages/api/src/modules/china-payment-notification/index.ts
.codex/scripts/payment-notification-idempotency-harness.sh
docs/refund-wechat-real-verifier-contract.md
.codex/tasks/refund-wechat-real-verifier-contract.md
project-ledger/changelog.md
project-ledger/status.md
project-ledger/handoff.md
```

禁止同 PR 修改：

```text
packages/api/src/api/**
packages/api/src/workflows/**
packages/api/src/subscribers/**
packages/api/src/links/**
packages/api/medusa-config.ts
apps/**
```

除非后续任务文件明确允许，并且仍不得启用真实 runtime。

## Contract Shape

建议 contract 输入：

```ts
type WechatPayRefundVerifierInput = {
  headers: {
    "wechatpay-timestamp"?: string
    "wechatpay-nonce"?: string
    "wechatpay-signature"?: string
    "wechatpay-serial"?: string
    [key: string]: string | string[] | undefined
  }
  rawBody: string
  receivedAt: string
  currentUnixSeconds: number
  timestampToleranceSeconds: number
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
  expectedOutTradeNo?: string
  expectedOutRefundNo?: string
  expectedAmountValue?: number
  expectedCurrency?: "CNY"
}
```

建议 contract 输出：

```ts
type WechatPayRefundVerifierResult = {
  provider: "wechat_pay"
  signatureStatus: "verified" | "failed"
  decryptStatus: "decrypted" | "failed" | "not_attempted"
  serial?: string
  eventId?: string
  eventType?: "refund.succeeded" | "refund.abnormal" | "refund.closed" | "unknown"
  providerRefundId?: string
  merchantRefundRequestRef?: string
  merchantOrderRef?: string
  providerTransactionId?: string
  amountValue?: number
  currency?: "CNY"
  idempotencyKey?: string
  rawPayloadDigest: string
  decryptedPayloadDigest?: string
  failureCode?: WechatPayRefundVerifierFailureCode
  receivedAt: string
  executable: false
}
```

## Verification Steps Inside The Pure Function

必须按顺序执行：

1. 计算 raw body digest。
2. 校验 `Wechatpay-Timestamp`、`Wechatpay-Nonce`、`Wechatpay-Signature`、`Wechatpay-Serial` 是否存在。
3. 校验 timestamp 是否在 tolerance 内。
4. 根据 `Wechatpay-Serial` 选择平台证书或微信支付公钥；未命中则失败，不继续解析成功语义。
5. 使用原始请求 body 构造签名串，禁止重新序列化 JSON。
6. 真实验签通过后才解析 body。
7. 校验 body JSON 和 `resource` 结构。
8. 校验 `resource.algorithm` 为 `AEAD_AES_256_GCM`。
9. 使用 APIv3 key reference 解密 resource；本 contract PR 可先用 injected fake decryptor / deterministic test helper，不读取真实 key。
10. 校验 decrypted payload 的 `mchid`、`appid`、`out_trade_no`、`transaction_id`、`out_refund_no`、`refund_id`、金额和币种。
11. 映射事件类型并生成幂等 key。
12. 输出 `executable: false`。

## Event Mapping

```text
REFUND.SUCCESS  -> refund.succeeded
REFUND.ABNORMAL -> refund.abnormal
REFUND.CLOSED   -> refund.closed
unknown         -> unknown + manual_review_required
```

注意：

- `refund.succeeded` 只代表微信支付回调声称退款成功，不代表平台已写退款成功。
- `refund.abnormal` 必须进入人工复核或后续查询，不得自动重试 provider refund request。
- `refund.closed` 不得自动关闭平台退款，必须对照本地 refund request / order / payment snapshot。

## Idempotency

首选：

```text
refund_notify:wechat_pay:<event_id>
```

fallback：

```text
refund_notify:wechat_pay:<out_refund_no>:<refund_id>:<event_type>
```

幂等 key 不得包含手机号、openid、地址、实名、银行卡或 raw decrypted payload。

## Failure Codes

建议：

```text
WECHAT_REFUND_HEADER_MISSING
WECHAT_REFUND_TIMESTAMP_INVALID
WECHAT_REFUND_TIMESTAMP_OUT_OF_RANGE
WECHAT_REFUND_SERIAL_UNKNOWN
WECHAT_REFUND_CERT_EXPIRED
WECHAT_REFUND_SIGNATURE_FAILED
WECHAT_REFUND_BODY_MALFORMED
WECHAT_REFUND_RESOURCE_MISSING
WECHAT_REFUND_RESOURCE_ALGORITHM_UNSUPPORTED
WECHAT_REFUND_DECRYPT_FAILED
WECHAT_REFUND_MCH_MISMATCH
WECHAT_REFUND_APP_MISMATCH
WECHAT_REFUND_ORDER_MISMATCH
WECHAT_REFUND_REQUEST_MISMATCH
WECHAT_REFUND_AMOUNT_MISMATCH
WECHAT_REFUND_CURRENCY_MISMATCH
WECHAT_REFUND_EVENT_UNKNOWN
```

## Test Vector Plan

后续 contract PR 先用 redacted fixture / sandbox vector：

- valid `REFUND.SUCCESS`。
- valid `REFUND.ABNORMAL`。
- valid `REFUND.CLOSED`。
- missing signature header。
- missing serial header。
- unknown serial。
- expired / not-yet-valid certificate。
- stale timestamp。
- bad signature。
- malformed body。
- unsupported resource algorithm。
- decrypt failure。
- merchant mismatch。
- app mismatch。
- out_trade_no mismatch。
- out_refund_no mismatch。
- amount mismatch。
- non-CNY currency。
- unknown event type enters manual review.

## Redaction Rules

fixture 和结果必须避免：

- 真实 app id。
- 真实 mch id。
- 真实 merchant private key。
- 真实 APIv3 key。
- 真实平台证书、公钥或证书序列映射。
- 真实 openid、手机号、地址、身份证、银行卡、实名。
- decrypted payload 明文进入 response 或 ledger。

## Verification Commands

后续 contract PR 至少需要：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/wechat-pay-refund-notification-verifier.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-notification-verifier.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

还必须 grep 确认没有 runtime mutation：

```bash
find apps packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/links packages/api/medusa-config.ts \
  -path "*/node_modules" -prune -o -type f -print 2>/dev/null | \
  xargs grep -n \
    -e providerRefundRequest \
    -e execute_workflow \
    -e refundStateMutation \
    -e settlement_adjusted \
    -e commission_adjusted \
    -e payout_adjusted \
    -e fulfillment \
    -e logistics 2>/dev/null || true
```

## Rollback

verifier-only PR rollback 是代码级 revert。因为不接 route、不写 DB、不读真实 key、不执行 workflow，所以不需要数据回滚。

## No-Go

仍禁止：

- 接微信支付 SDK。
- 写真实 app id / mch id / private key / APIv3 key / 平台证书 / 公钥。
- 新增 provider route。
- 写 inbox / event log。
- 调用 provider refund API。
- 执行 workflow。
- 写 refund success state。
- 改 settlement、commission、payout、permission、fulfillment 或 logistics。

## 下一步

建议继续 `refund-alipay-real-verifier-plan`，并保持两个 provider 分 PR；微信支付真实 verifier contract 只能在两个 provider-specific plan 都明确后再做。
