# wechat-pay-provider-disabled-adapter-skeleton

## 目标

新增微信支付 Provider disabled adapter skeleton，作为后续 sandbox fake notify、验签/解密测试和 runtime gate 前的代码边界。

## 范围

- 新增未注册的微信支付 disabled adapter 纯函数 skeleton。
- 暴露配置 key 名和 secret reference key 名，不读取环境变量或 secret。
- `createPayment` / `queryPayment` / `closePayment` / `verifyAndDecryptNotification` / `normalizeNotification` 均返回 blocked decision。
- 新增 focused unit test。
- 将 focused test 加入 payment notification harness。

## 非目标

- 不注册 Medusa payment provider。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增 API route。
- 不接微信支付 SDK。
- 不读取真实 app id、mch id、private key、APIv3 key、证书、公钥或 token。
- 不接 checkout，不返回真实 payment URL 或微信调起 payload。
- 不执行 payment workflow，不注册 migration，不连接外部 DB。
- 不处理退款、对账、结算、佣金、打款、分账、履约或物流。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/wechat-pay-provider.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

## 交付

- `packages/api/src/modules/china-payment-notification/wechat-pay-provider.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-provider.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `docs/wechat-pay-provider-disabled-adapter-skeleton.md`
- ledger / queue 更新
