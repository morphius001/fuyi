# Refund Alipay Real Verifier Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

支付宝退款相关 verifier 必须先做产品模式确认，再做纯函数合同。不能假设 `alipay.trade.refund` 一定提供独立退款异步通知；如果目标产品只提供交易异步通知或同步退款响应，平台必须把相关事件送入 manual review / refund query follow-up，不能自动写退款成功。

本轮只规划真实验签边界。不接支付宝 SDK、不读取真实密钥、不新增 route、不写 inbox、不执行 workflow、不写 refund success state、不触发结算、佣金、打款、权限、履约或物流。

## 资料来源

- Alipay / Antom asynchronous notification help：异步通知通过 POST 发送到 `notify_url`，商户需要返回 `success`，否则会重发；验签时使用支付宝返回参数中除 `sign_type` 和 `sign` 外的参数。  
  https://global.alipay.com/developer/helpcenter/detail?_route=sg&categoryId=67617&knowId=201602452303&sceneCode=AC_DEV
- AlipayHK asynchronous notification verification：RSA / RSA2 验签需要移除 `sign` 和 `sign_type`，按 key 升序拼接，再用支付宝公钥验证签名。  
  https://docs.alipay.hk/alipayhkdocs/hk/wap_hk/asyncnotif
- Antom `alipay.trade.refund`：退款请求包含 `out_trade_no` / `trade_no`、`out_request_no`、`refund_amount`、`refund_currency`；同步响应包含 `fund_change`、`refund_fee`、`gmt_refund_pay` 等字段。该响应不能等同于后端异步通知。  
  https://iopenhome.alipay.com/docs/ac/solution_api/trade-refund

## Product Mode Gate

后续合同 PR 前必须先确认目标支付宝产品模式：

```text
ALIPAY_REFUND_NOTIFY_MODE=trade_async_notify | refund_query_follow_up | product_specific_refund_notify
```

含义：

- `trade_async_notify`：退款相关信息可能体现在交易异步通知字段中；verified notification 只能进入 normalized envelope，是否是退款完成必须由本地 refund request snapshot 和后续 query / review 决定。
- `refund_query_follow_up`：退款同步响应或交易通知不足以确认平台退款状态；必须创建后续查询任务计划，但本阶段不得调用查询 API。
- `product_specific_refund_notify`：只有在目标产品官方文档明确支持独立退款通知时才可使用；必须在任务文件记录文档 URL 和字段清单。

No-Go：

- 把同步 `alipay.trade.refund` response 当成异步通知。
- 把交易支付成功通知当成退款成功。
- 对缺少 `out_request_no` / `out_biz_no` / 本地 refund command key 的通知自动成功。

## Planned Files

后续 contract PR 建议新增或修改：

```text
packages/api/src/modules/china-payment-notification/alipay-refund-notification-verifier.ts
packages/api/src/modules/china-payment-notification/alipay-refund-notification-test-vectors.ts
packages/api/src/modules/china-payment-notification/__tests__/alipay-refund-notification-verifier.unit.spec.ts
packages/api/src/modules/china-payment-notification/index.ts
.codex/scripts/payment-notification-idempotency-harness.sh
docs/refund-alipay-real-verifier-contract.md
.codex/tasks/refund-alipay-real-verifier-contract.md
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

## Contract Shape

建议输入：

```ts
type AlipayRefundVerifierInput = {
  headers: Record<string, string | string[] | undefined>
  form: Record<string, string | undefined>
  receivedAt: string
  trustedAlipayPublicKeyRefs: Array<{
    keyId: string
    publicKeyRef: string
    mode: "public_key" | "certificate"
    appCertSn?: string
    alipayRootCertSn?: string
  }>
  expectedAppId: string
  expectedSellerId?: string
  expectedOutTradeNo?: string
  expectedTradeNo?: string
  expectedOutRequestNo?: string
  expectedAmountValue?: number
  expectedCurrency: "CNY"
  refundNotifyMode: "trade_async_notify" | "refund_query_follow_up" | "product_specific_refund_notify"
}
```

建议输出：

```ts
type AlipayRefundVerifierResult = {
  provider: "alipay"
  signatureStatus: "verified" | "failed"
  productModeStatus: "confirmed" | "unconfirmed" | "query_required"
  signType?: "RSA2" | "RSA"
  notifyId?: string
  appId?: string
  sellerId?: string
  tradeNo?: string
  merchantOrderRef?: string
  merchantRefundRequestRef?: string
  providerRefundId?: string
  eventType?: "refund.succeeded" | "refund.failed" | "refund.unknown" | "trade.updated" | "unknown"
  amountValue?: number
  currency?: "CNY"
  rawPayloadDigest: string
  canonicalPayloadDigest: string
  idempotencyKey?: string
  failureCode?: AlipayRefundVerifierFailureCode
  receivedAt: string
  executable: false
}
```

## Verification Steps Inside The Pure Function

必须按顺序执行：

1. 复制 form 输入并计算 raw payload digest。
2. 校验 `sign` 存在。
3. 校验 `sign_type` 存在；第一版只允许 `RSA2`，如需支持 `RSA` 必须单独标注风险。
4. 构造 canonical payload：排除 `sign` 和 `sign_type`，排除空值，按 key 升序，保留原始字符串值。
5. 使用 injected public key / certificate ref 进行真实验签；contract PR 可先用 deterministic fake public key helper，不读取 env。
6. 验签通过后校验 `app_id`、`seller_id` / `seller_email`、`out_trade_no` / `trade_no`。
7. 根据 product mode 判断退款字段是否足以进入 refund envelope。
8. 如果存在 `out_request_no` / `out_biz_no`、`refund_fee`、`gmt_refund` / `gmt_refund_pay`，校验本地 refund request snapshot。
9. 金额字符串按 decimal 转分；禁止 `Number(float) * 100` 造成精度问题。
10. 币种只允许 CNY；缺少币种时必须由本地 payment snapshot 补证，否则 manual review。
11. 生成幂等 key。
12. 输出 `executable: false`。

## Event Mapping

建议：

```text
明确 refund success 字段 + request ref match + amount match -> refund.succeeded envelope
refund failure / close 字段 + request ref match             -> refund.failed envelope
只有 trade_status / trade_no                              -> trade.updated + manual_review_required
product mode unconfirmed                                  -> refund.unknown + query_required
unknown fields                                            -> unknown + manual_review_required
```

注意：

- `refund.succeeded envelope` 仍不等于平台退款成功。
- 同步退款响应只可作为 request snapshot 的候选输入，不可作为 notify verifier 输入。
- 缺少退款请求号时，不得自动成功。

## Idempotency

首选：

```text
refund_notify:alipay:<notify_id>
```

refund fields fallback：

```text
refund_notify:alipay:<out_trade_no>:<out_request_no|out_biz_no>:<refund_fee>
```

trade-only fallback：

```text
refund_notify:alipay:<out_trade_no>:<trade_no>:trade_updated
```

禁止：

- 随机 UUID。
- 仅用 `trade_no` 判断退款成功。
- 不带金额 / 请求号的 refund success。
- 幂等冲突覆盖旧 digest。

## Failure Codes

建议：

```text
ALIPAY_REFUND_SIGN_MISSING
ALIPAY_REFUND_SIGN_TYPE_MISSING
ALIPAY_REFUND_SIGN_TYPE_UNSUPPORTED
ALIPAY_REFUND_SIGNATURE_FAILED
ALIPAY_REFUND_APP_MISMATCH
ALIPAY_REFUND_SELLER_MISMATCH
ALIPAY_REFUND_ORDER_MISMATCH
ALIPAY_REFUND_TRADE_MISMATCH
ALIPAY_REFUND_REQUEST_REF_MISSING
ALIPAY_REFUND_AMOUNT_MISSING
ALIPAY_REFUND_AMOUNT_INVALID
ALIPAY_REFUND_AMOUNT_MISMATCH
ALIPAY_REFUND_CURRENCY_MISMATCH
ALIPAY_REFUND_PRODUCT_MODE_UNCONFIRMED
ALIPAY_REFUND_NOTIFY_ID_MISSING
ALIPAY_REFUND_STATUS_UNKNOWN
```

## Test Vector Plan

后续 contract PR 先用 redacted fixture / sandbox vector：

- valid RSA2 notification with refund request ref。
- valid RSA2 trade-only notification requiring manual review。
- product mode unconfirmed -> query required。
- missing sign。
- missing sign_type。
- unsupported sign_type。
- bad signature。
- future extra field included in canonical payload。
- empty value excluded from canonical payload。
- app mismatch。
- seller mismatch。
- out_trade_no mismatch。
- trade_no mismatch。
- missing refund request ref。
- amount parse with decimal cents。
- amount mismatch。
- non-CNY or missing currency requiring local snapshot。
- duplicate same canonical digest。
- different digest conflict candidate。

## Redaction Rules

fixture 和结果必须避免：

- 真实 app id。
- 真实 seller id / merchant id。
- 真实 private key。
- 真实支付宝公钥 / 证书全文。
- 真实交易号。
- 真实手机号、地址、身份证、银行卡、实名。
- canonical payload 明文进入 response 或 ledger。

## Verification Commands

后续 contract PR 至少需要：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/alipay-refund-notification-verifier.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/alipay-notification-verifier.unit.spec.ts \
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

- 接支付宝 SDK。
- 写真实 app id / seller id / merchant id / private key / 支付宝公钥或证书。
- 新增 provider route。
- 写 inbox / event log。
- 调用 provider refund API 或 refund query API。
- 执行 workflow。
- 写 refund success state。
- 改 settlement、commission、payout、permission、fulfillment 或 logistics。

## 下一步

建议进入 `refund-wechat-real-verifier-contract` 或先做 `refund-provider-real-verifier-plan-validation`。如果继续实现，必须先做纯函数 + redacted fixtures，不接 route、不读真实密钥。
