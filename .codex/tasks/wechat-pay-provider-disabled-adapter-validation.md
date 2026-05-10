# wechat-pay-provider-disabled-adapter-validation

## 目标

记录 PR #305 微信支付 disabled adapter skeleton 合并后的验证结果和剩余边界。

## 范围

- 复跑 focused unit test。
- 复跑 API typecheck。
- 复跑 payment notification harness。
- 检查 `medusa-config.ts` 未注册 `china-payment-notification`。
- 检查 API route / medusa config 未引用 `createDisabledWechatPayProviderAdapter`。
- 记录验证结果、风险和下一步。

## 非目标

- 不修改 runtime。
- 不新增 API route。
- 不注册 Medusa payment provider。
- 不接微信支付 SDK、checkout、payment workflow、DB、migration 或真实 secret。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/wechat-pay-provider.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
grep -RIn "china-payment-notification" packages/api/medusa-config.ts || true
grep -RIn "createDisabledWechatPayProviderAdapter" packages/api/src/api packages/api/medusa-config.ts || true
git diff --check
```

## 交付

- `docs/wechat-pay-provider-disabled-adapter-validation.md`
- ledger / queue 更新
