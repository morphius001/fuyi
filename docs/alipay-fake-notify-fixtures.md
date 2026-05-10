# Alipay Fake Notify Fixtures

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增支付宝 fake notify fixture，作为后续 canonicalization / verifier / normalizer 纯函数测试的输入。

它不是验签实现，不接支付宝 SDK，不接 checkout，不执行 payment workflow。

## 文件

- `packages/api/src/modules/china-payment-notification/alipay-test-vectors.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/alipay-test-vectors.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## Fixture 内容

新增：

- `alipayFakeNotifyForm`。
- `alipayFakeRawNotification`。
- `alipayFakeCanonicalParamKeys`。
- `alipayFakeCanonicalPayload`。
- `alipayFakeSuccessNotifyVector`。

Canonical payload 明确排除 `sign` 和 `sign_type`；`sign_type=RSA2` 只作为单独字段保留给后续 verifier 校验。

Fixture 明确使用：

- `app_fake_test_001`。
- `merchant_fake_test_001`。
- `trade_alipay_fake_001`。
- `signature_fake_test_only_001`。

不包含：

- 真实 app id。
- 真实 merchant id。
- private key。
- public key。
- 证书。
- token。

## 行为边界

本轮只提供静态 test vector：

- 不实现 canonicalization helper。
- 不验签。
- 不归一化。
- 不写 inbox / event log。
- 不连接 DB。
- 不新增 route。
- 不执行 workflow。
- 不返回 `paymentUrl`、`qrCodeUrl` 或 `clientPayload`。

后续 verifier / normalizer PR 必须继续保持纯函数，直到 runtime gate、DB-backed rehearsal、workflow execution adapter 和真实 sandbox credentials owner 全部明确。

## 验证

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/alipay-test-vectors.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

结果：

```text
PASS src/modules/china-payment-notification/__tests__/alipay-test-vectors.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 4 passed, 4 total

payment-notification-idempotency-harness.sh:
Test Suites: 25 passed, 25 total
Tests: 161 passed, 161 total
disposable DB dry-run created, rolled back, and cleaned up.

bunx tsc --noEmit -p tsconfig.json passed.
git diff --check passed.
```

## 下一步

推荐：

1. `provider-fake-notify-contract-validation`
2. `wechat-pay-notification-verifier-contract`
3. `alipay-notification-verifier-contract`

其中 verifier / normalizer 仍不得读取真实 secret，不得接 checkout，不得执行 payment workflow。
