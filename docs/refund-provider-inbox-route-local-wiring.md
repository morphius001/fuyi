# Refund Provider Inbox Route Local Wiring

更新时间：2026-05-10 Asia/Shanghai

## 结论

Provider refund inbox route 现在支持 development/local/in-memory/fixture-only wiring。支付宝 / 微信支付 route 仍默认 disabled；只有 local gate 和 fake fixture config 明确通过后才读取 body、调用 provider verifier contract、归一化为 inbox-only envelope，并写入 local in-memory refund inbox repository。

该阶段仍不是可用真实退款 runtime：不连接 DB、不注册 module、不接 SDK、不写真实密钥、不调用 provider refund API、不调用 refund query API、不执行 workflow、不写平台退款成功状态。

## 实现范围

新增：

```text
packages/api/src/modules/china-payment-notification/refund-provider-inbox-local-repository.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-normalizer.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-local-repository.unit.spec.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-normalizer.unit.spec.ts
```

更新：

```text
packages/api/src/api/china/refund-inbox/wechat-pay/route.ts
packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
packages/api/src/api/china/refund-inbox/alipay/route.ts
packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
packages/api/src/modules/china-payment-notification/index.ts
```

## Runtime Gate

仍必须满足：

```text
NODE_ENV=development
CHINA_REFUND_RUNTIME_ENABLED=true
CHINA_REFUND_NOTIFY_ROUTE_ENABLED=true
CHINA_REFUND_STATE_MUTATION_ENABLED=false
CHINA_REFUND_PROVIDER=wechat_pay | alipay
CHINA_REFUND_ROUTE_MODE=provider_inbox_only
CHINA_REFUND_TARGET_ENV=local
CHINA_REFUND_INBOX_LOCAL_INMEMORY=true
CHINA_REFUND_INBOX_LOCAL_DB=false 或未设置
```

未通过 gate 时 route 不读取 body。

## Provider Fixture Config

微信支付 route 需要 fake fixture config：

```text
CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_SIGNATURE
CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_CIPHERTEXT
CHINA_REFUND_WECHAT_FIXTURE_PLATFORM_SERIAL
CHINA_REFUND_WECHAT_FIXTURE_CURRENT_UNIX_SECONDS
CHINA_REFUND_WECHAT_FIXTURE_DECRYPTED_RESOURCE_JSON
CHINA_REFUND_WECHAT_EXPECTED_MCH_ID
CHINA_REFUND_WECHAT_EXPECTED_APP_ID
CHINA_REFUND_WECHAT_EXPECTED_OUT_TRADE_NO
CHINA_REFUND_WECHAT_EXPECTED_OUT_REFUND_NO
CHINA_REFUND_WECHAT_EXPECTED_AMOUNT_VALUE
```

支付宝 route 需要 fake fixture config：

```text
CHINA_REFUND_ALIPAY_FIXTURE_EXPECTED_SIGNATURE
CHINA_REFUND_ALIPAY_EXPECTED_APP_ID
CHINA_REFUND_ALIPAY_EXPECTED_SELLER_ID
CHINA_REFUND_ALIPAY_EXPECTED_OUT_TRADE_NO
CHINA_REFUND_ALIPAY_EXPECTED_TRADE_NO
CHINA_REFUND_ALIPAY_EXPECTED_OUT_REQUEST_NO
CHINA_REFUND_ALIPAY_EXPECTED_AMOUNT_VALUE
CHINA_REFUND_ALIPAY_REFUND_NOTIFY_MODE
```

## Response Semantics

- `accepted`: 只代表 local in-memory inbox accepted，随后标记 `runtime_mutation_blocked`。
- `duplicate`: same digest replay，不重复写记录。
- `manual_review`: provider non-success event 或 digest conflict。
- `processed_for_audit_only`: Alipay trade-only notification。
- `query_required`: Alipay query-required notification，但本阶段不调用 query API。
- `rejected`: 验签、payload、identity、金额或币种失败。

所有 response 仍固定：

```json
{
  "runtimeMutationBlocked": true,
  "stateMutationBlocked": true,
  "refundSuccessState": false,
  "successMeans": "inbox_or_audit_only"
}
```

## No-Go

仍禁止：

- 真实 SDK dependency。
- 真实密钥 / 证书 / webhook token。
- 生产或普通预发 DB 连接。
- provider refund request。
- provider refund query API。
- workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission weakening。
- fulfillment / logistics mutation。
