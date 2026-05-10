# Alipay Notification Normalizer Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增支付宝 fake notify normalizer 纯函数合同。

它不是生产验签实现，不接支付宝 SDK，不接 checkout，不写 inbox，不执行 payment workflow。

## 文件

- `packages/api/src/modules/china-payment-notification/alipay-notification-normalizer.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/alipay-notification-normalizer.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## 合同内容

新增：

- `normalizeAlipayNotificationContract()`。
- `parseAlipayAmountToMinorUnitsContract()`。
- `AlipayNotificationNormalizerContractInput`。
- `AlipayNotificationNormalizerContractResult`。
- `AlipayNotificationNormalizerFailureCode`。

当前 normalizer 只接受 fake-only verifier result 和 fake form，并要求调用方显式传入：

- `expectedAppId`。
- `expectedSellerId`。
- 可选 expected amount。

它校验：

- verification 必须是 `signatureStatus=verified`。
- form `app_id` 匹配 expected fake app id。
- form `seller_id` 匹配 expected fake seller id。
- `TRADE_SUCCESS` 映射为 `payment.succeeded`。
- `TRADE_CLOSED` 映射为 `payment.closed`。
- 其他 trade status 阻断为 unsupported。
- `currency` 必须是 `CNY`。
- `total_amount` 必须是最多两位小数的金额字符串，并转换为分。
- expected amount 必须匹配。
- `out_trade_no`、`trade_no`、`notify_id` 必须存在。

成功时输出标准 `ChinaPaymentNotificationEnvelope`：

- `provider=alipay`。
- `eventType=payment.succeeded` 或 `payment.closed`。
- `merchantOrderRef=out_trade_no`。
- `providerTransactionId=trade_no`。
- `amount.value` 使用分为单位的整数。
- `idempotencyKey=payment_notify:alipay:<notify_id>`。
- `signature.status=verified`。
- `riskFlags=[]`。

## 行为边界

本轮不做：

- 真实 RSA / RSA2 验签。
- public key / certificate lookup。
- env secret 读取。
- SDK 调用。
- API route。
- checkout binding。
- payment workflow execution。
- inbox / event log 写入。
- DB / migration。
- refund、reconciliation、settlement、commission、payout、fulfillment 或 logistics runtime。

返回结果也不包含：

- `paymentUrl`。
- `qrCodeUrl`。
- `clientPayload`。
- executable workflow command。

## 验证

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/alipay-notification-normalizer.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
find apps packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/links packages/api/medusa-config.ts -path "*/node_modules" -prune -o -type f -print 2>/dev/null | xargs grep -n "normalizeAlipayNotificationContract" 2>/dev/null || true
git diff --check
```

结果：

```text
Focused normalizer unit test:
Test Suites: 1 passed, 1 total
Tests: 10 passed, 10 total

payment-notification-idempotency-harness.sh:
Test Suites: 29 passed, 29 total
Tests: 194 passed, 194 total
disposable DB dry-run created, rolled back, and cleaned up.

bunx tsc --noEmit -p tsconfig.json passed.
Runtime grep for normalizeAlipayNotificationContract outside node_modules returned no output.
git diff --check passed.
```

## 下一步

推荐：

1. `payment-provider-verifier-normalizer-validation`
2. `payment-runtime-inbox-only-route-gate`
3. `refund-runtime-risk-gate-plan`

后续仍不得读取真实 secret，不得接 SDK，不得接 checkout，不得执行 payment workflow。
