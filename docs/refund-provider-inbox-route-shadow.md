# Refund Provider Inbox Route Shadow

更新时间：2026-05-10 Asia/Shanghai

## 结论

新增支付宝 / 微信支付退款 provider inbox route 的 disabled shadow skeleton。当前 route 文件存在，但无论默认状态还是 local shadow flags 打开，都会返回 disabled，并且不会读取 request body。该阶段只落地 route shape、config gate 和 response redaction helper；不接 provider verifier runtime，不写 inbox，不连接 DB，不注册 module，不执行 workflow，也不写 refund success state。

这不是可用退款通知入口。它只为后续 inbox wiring PR 提供受控骨架。

## 文件范围

新增：

```text
packages/api/src/api/china/refund-inbox/wechat-pay/route.ts
packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
packages/api/src/api/china/refund-inbox/alipay/route.ts
packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-response.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-response.unit.spec.ts
```

更新：

```text
packages/api/src/modules/china-payment-notification/index.ts
```

## Runtime Gate

`parseRefundProviderInboxRouteConfig()` 默认 disabled，并阻断：

- production / prod / preprod / staging。
- `CHINA_REFUND_STATE_MUTATION_ENABLED=true`。
- provider mismatch。
- unsupported route mode。
- non-local target env。
- local DB storage。
- real-looking secrets in env.

即使 local shadow flags 完整，当前 route skeleton 仍返回 disabled，原因是 inbox wiring 需要单独 PR：

```text
REFUND_PROVIDER_ROUTE_DISABLED
```

## Response Safety

`buildRefundProviderInboxRouteSafeResponse()` 固定返回：

- `runtimeMutationBlocked: true`
- `stateMutationBlocked: true`
- `refundSuccessState: false`
- `successMeans: "inbox_or_audit_only"`

`redactRefundProviderInboxRouteMetadata()` 会递归移除 raw payload、signature / sign / nonce / serial、secret、private key、APIv3 key、certificate、public key、DB URL、provider refund request / query command、workflow command、refund state mutation command、完整手机号、身份证、银行卡、地址、settlement、commission、payout、fulfillment 和 logistics 字段。

## 验证

需要执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts \
  src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-response.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
grep -RIn \
  -e providerRefundRequest \
  -e refundQuery \
  -e execute_workflow \
  -e refundStateMutation \
  -e settlement_adjusted \
  -e commission_adjusted \
  -e payout_adjusted \
  -e fulfillment \
  -e logistics \
  packages/api/src/api/china/refund-inbox/wechat-pay \
  packages/api/src/api/china/refund-inbox/alipay \
  packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts \
  packages/api/src/modules/china-payment-notification/refund-provider-inbox-response.ts || true
git diff --check
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
