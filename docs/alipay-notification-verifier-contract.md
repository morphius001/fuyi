# Alipay Notification Verifier Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增支付宝 fake notify verifier 纯函数合同。

它不是生产验签实现，不接支付宝 SDK，不接 checkout，不执行 payment workflow。

## 文件

- `packages/api/src/modules/china-payment-notification/alipay-notification-verifier.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/alipay-notification-verifier.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## 合同内容

新增：

- `buildAlipayNotificationCanonicalPayloadContract()`。
- `verifyAlipayNotificationContract()`。
- `AlipayNotificationVerifierContractInput`。
- `AlipayNotificationVerifierContractResult`。
- `AlipayNotificationVerifierFailureCode`。

当前 verifier 只接受 fake-only fixture 输入，并要求调用方显式传入：

- `expectedAppId`。
- `expectedSellerId`。
- `expectedFakeSignature`。
- 可选 `expectedCanonicalPayload`。

它校验：

- `sign` 存在。
- `sign_type` 存在且为 `RSA2`。
- `app_id` 匹配 expected fake app id。
- `seller_id` 匹配 expected fake seller id。
- fake signature 与 `expectedFakeSignature` 一致。
- canonical payload 与 expected canonical payload 一致。
- raw payload digest 和 canonical payload digest 稳定。

Canonical payload 明确：

- 排除 `sign`。
- 排除 `sign_type`。
- 排除空字符串值。
- 按 key 升序拼接。
- 保留 form 原始字符串值，不做金额浮点重算。

`sign_type=RSA2` 只作为独立字段校验输入，不进入 canonical payload。

它返回：

- `signatureStatus`。
- `signType`。
- `notifyId` / `tradeNo` / `tradeStatus`。
- `rawPayloadDigest`。
- `canonicalPayloadDigest`。
- `failureCode` / `failureMessage`。
- `fixtureOnly: true`。
- `executable: false`。

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
- canonical payload 明文。
- `payment.succeeded` workflow command。

## 验证

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/alipay-notification-verifier.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
find apps packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/links packages/api/medusa-config.ts -path "*/node_modules" -prune -o -type f -print 2>/dev/null | xargs grep -n "verifyAlipayNotificationContract" 2>/dev/null || true
git diff --check
```

结果：

```text
Focused verifier unit test:
Test Suites: 1 passed, 1 total
Tests: 8 passed, 8 total

payment-notification-idempotency-harness.sh:
Test Suites: 27 passed, 27 total
Tests: 176 passed, 176 total
disposable DB dry-run created, rolled back, and cleaned up.

bunx tsc --noEmit -p tsconfig.json passed.
Runtime grep for verifyAlipayNotificationContract outside node_modules returned no output.
git diff --check passed.
```

## 下一步

推荐：

1. `wechat-pay-notification-normalizer-contract`
2. `alipay-notification-normalizer-contract`
3. `payment-provider-verifier-contract-validation`

后续仍不得读取真实 secret，不得接 SDK，不得接 checkout，不得执行 payment workflow。
