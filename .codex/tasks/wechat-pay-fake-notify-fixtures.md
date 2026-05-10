# wechat-pay-fake-notify-fixtures

## 目标

新增微信支付 fake notify fixture，作为后续 verifier / normalizer 纯函数测试的输入。

## 范围

- 新增 fake-only raw notification fixture。
- 新增 fake-only decrypted resource fixture。
- 新增 expected idempotency key 和 payload digest。
- 新增 focused unit test。
- 将 focused test 加入 payment notification harness。

## 非目标

- 不实现验签。
- 不实现解密。
- 不实现 normalize helper。
- 不新增 API route。
- 不接微信支付 SDK。
- 不读取真实 app id、mch id、private key、APIv3 key、平台证书、公钥或 token。
- 不接 checkout，不执行 payment workflow。
- 不写 inbox / event log，不连接 DB，不注册 migration。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/wechat-pay-test-vectors.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

## 交付

- `packages/api/src/modules/china-payment-notification/wechat-pay-test-vectors.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-test-vectors.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `docs/wechat-pay-fake-notify-fixtures.md`
- ledger / queue 更新
