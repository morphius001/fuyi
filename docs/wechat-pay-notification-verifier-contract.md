# WeChat Pay Notification Verifier Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增微信支付 fake notify verifier 纯函数合同。

它不是生产验签实现，不接微信支付 SDK，不解密，不接 checkout，不执行 payment workflow。

## 文件

- `packages/api/src/modules/china-payment-notification/wechat-pay-notification-verifier.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-notification-verifier.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## 合同内容

新增：

- `verifyWechatPayNotificationContract()`。
- `WechatPayNotificationVerifierContractInput`。
- `WechatPayNotificationVerifierContractResult`。
- `WechatPayNotificationVerifierFailureCode`。

当前 verifier 只接受 fake-only fixture 输入，并要求调用方显式传入：

- `trustedSerials`。
- `expectedFakeSignature`。
- `currentUnixSeconds`。
- 可选 `timestampToleranceSeconds`。
- 可选 `expectedResourceAlgorithm`。

它校验：

- `Wechatpay-Signature` 存在。
- `Wechatpay-Timestamp` 存在且在 tolerance 内。
- `Wechatpay-Nonce` 存在。
- `Wechatpay-Serial` 属于 fake trusted serial list。
- fake signature 与 `expectedFakeSignature` 一致。
- encrypted resource algorithm 是 `AEAD_AES_256_GCM`。
- raw body 可解析且 digest 稳定。

它返回：

- `signatureStatus`。
- `resourceStatus`。
- `eventId` / `eventType`。
- `rawPayloadDigest`。
- `failureCode` / `failureMessage`。
- `fixtureOnly: true`。
- `executable: false`。

## 行为边界

本轮不做：

- 真实 RSA / SHA256 验签。
- AES-GCM 解密。
- official platform certificate / public key lookup。
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
- decrypted payment payload。
- `payment.succeeded` workflow command。

## 验证

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/wechat-pay-notification-verifier.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

结果：

```text
Focused verifier unit test:
Test Suites: 1 passed, 1 total
Tests: 7 passed, 7 total

payment-notification-idempotency-harness.sh:
Test Suites: 26 passed, 26 total
Tests: 168 passed, 168 total
disposable DB dry-run created, rolled back, and cleaned up.

bunx tsc --noEmit -p tsconfig.json passed.
git diff --check passed.
```

## 下一步

推荐：

1. `alipay-notification-verifier-contract`
2. `wechat-pay-notification-normalizer-contract`
3. `alipay-notification-normalizer-contract`

后续仍不得读取真实 secret，不得接 SDK，不得接 checkout，不得执行 payment workflow。
