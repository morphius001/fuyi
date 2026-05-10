# provider-disabled-adapter-rollup-validation

## 目标

汇总 PR #303-#310 支付 Provider sandbox / disabled adapter / fake notify plan 阶段状态，记录当前验证结果和后续安全边界。

## 范围

- 汇总 WeChat Pay / Alipay sandbox contract、secret config template、disabled adapter skeleton、validation、fake notify test plan。
- 复跑 payment notification harness。
- 复跑 API typecheck。
- 检查 provider module 未注册到 `medusa-config.ts`。
- 检查 adapter 未被 API route 引用。
- 记录下一步 Go / No-Go。

## 非目标

- 不修改 runtime。
- 不新增 API route。
- 不注册 Medusa payment provider。
- 不接支付宝 / 微信支付 SDK。
- 不接 checkout、payment workflow、DB、migration 或真实 secret。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
grep -RIn "china-payment-notification" packages/api/medusa-config.ts || true
grep -RIn "createDisabled.*ProviderAdapter" packages/api/src/api packages/api/medusa-config.ts || true
git diff --check
```

## 交付

- `docs/provider-disabled-adapter-rollup-validation.md`
- ledger / queue 更新
