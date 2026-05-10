# wechat-pay-notification-normalizer-contract

## 目标

新增微信支付 fake notify normalizer 纯函数合同，把 verifier result + fake decrypted resource 映射为标准 payment notification envelope。

## 范围

- 新增 `normalizeWechatPayNotificationContract()`。
- 只处理 fake verified success notification。
- 校验 expected app id、expected mch id、trade state、CNY currency、amount 和 order / transaction reference。
- 新增 focused unit tests。
- 将 focused test 纳入 payment notification harness。
- 更新 docs / ledger / queue。

## 非目标

- 不实现 AES-GCM 解密。
- 不实现真实微信支付验签。
- 不读取真实 app id、mch id、merchant private key、APIv3 key、平台证书、公钥或 token。
- 不接微信支付 SDK。
- 不新增 API route。
- 不接 checkout，不执行 payment workflow。
- 不写 inbox / event log，不连接 DB，不注册 migration。
- 不处理退款、对账、结算、佣金、打款、履约或物流。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/wechat-pay-notification-normalizer.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
find apps packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/links packages/api/medusa-config.ts -path "*/node_modules" -prune -o -type f -print 2>/dev/null | xargs grep -n "normalizeWechatPayNotificationContract" 2>/dev/null || true
git diff --check
```

## 交付

- `packages/api/src/modules/china-payment-notification/wechat-pay-notification-normalizer.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-notification-normalizer.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `docs/wechat-pay-notification-normalizer-contract.md`
- ledger / queue 更新
