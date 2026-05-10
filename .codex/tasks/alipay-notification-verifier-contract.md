# alipay-notification-verifier-contract

## 目标

新增支付宝 fake notify verifier 纯函数合同，为后续真实验签实现提供稳定输入输出形状。

## 范围

- 新增 `buildAlipayNotificationCanonicalPayloadContract()`。
- 新增 `verifyAlipayNotificationContract()`。
- 只校验 fake form 的 `sign`、`sign_type=RSA2`、expected app id、expected seller id、expected fake signature 和 expected canonical payload。
- 新增 focused unit tests。
- 将 focused test 纳入 payment notification harness。
- 更新 docs / ledger / queue。

## 非目标

- 不实现真实 RSA / RSA2 验签。
- 不读取真实支付宝 app id、merchant id、private key、公钥、证书或 token。
- 不接支付宝 SDK。
- 不新增 API route。
- 不接 checkout，不执行 payment workflow。
- 不写 inbox / event log，不连接 DB，不注册 migration。
- 不处理退款、对账、结算、佣金、打款、履约或物流。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/alipay-notification-verifier.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
find apps packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/links packages/api/medusa-config.ts -path "*/node_modules" -prune -o -type f -print 2>/dev/null | xargs grep -n "verifyAlipayNotificationContract" 2>/dev/null || true
git diff --check
```

## 交付

- `packages/api/src/modules/china-payment-notification/alipay-notification-verifier.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/alipay-notification-verifier.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `docs/alipay-notification-verifier-contract.md`
- ledger / queue 更新
