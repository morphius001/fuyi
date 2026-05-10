# WeChat Pay Fake Notify Fixtures

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增微信支付 fake notify fixture，作为后续 verifier / normalizer 纯函数测试的输入。

它不是验签实现，不解密，不接微信支付 SDK，不接 checkout，不执行 payment workflow。

## 文件

- `packages/api/src/modules/china-payment-notification/wechat-pay-test-vectors.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-test-vectors.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## Fixture 内容

新增：

- `wechatPayFakeNotificationBody`。
- `wechatPayFakeRawBody`。
- `wechatPayFakeRawNotification`。
- `wechatPayFakeDecryptedResource`。
- `wechatPayFakeSuccessNotifyVector`。

Fixture 明确使用：

- `wx_fake_test_app`。
- `mch_fake_test_001`。
- `txn_wechat_fake_test_001`。
- `ciphertext_fake_test_only_001`。
- `signature_fake_test_only_001`。
- `serial_fake_test_only_001`。

不包含：

- 真实 app id。
- 真实 mch id。
- merchant private key。
- APIv3 key。
- 平台证书。
- 微信支付公钥。
- token。

## 行为边界

本轮只提供静态 test vector：

- 不验签。
- 不解密。
- 不归一化。
- 不写 inbox / event log。
- 不连接 DB。
- 不新增 route。
- 不执行 workflow。
- 不返回 `paymentUrl` 或 `clientPayload`。

后续 verifier / normalizer PR 必须继续保持纯函数，直到 runtime gate、DB-backed rehearsal、workflow execution adapter 和真实 sandbox credentials owner 全部明确。

## 验证

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/wechat-pay-test-vectors.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

结果：

```text
PASS src/modules/china-payment-notification/__tests__/wechat-pay-test-vectors.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 4 passed, 4 total
```

PR 收口前已执行：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：24 个 test suites / 157 个 tests 通过，disposable DB dry-run 创建、回滚并清理完成。

## 下一步

推荐：

1. `alipay-fake-notify-fixtures`
2. `wechat-pay-notification-verifier-contract`
3. `wechat-pay-notification-normalizer-contract`

其中 verifier / normalizer 仍不得读取真实 secret，不得接 checkout，不得执行 payment workflow。
