# Task: mock-provider-runtime-local-smoke-validation

## 目标

记录 `mock-provider-runtime-local-smoke-script` 合并后的主线验证结果。

## 允许修改

- `.codex/tasks/mock-provider-runtime-local-smoke-validation.md`
- `docs/mock-provider-runtime-local-smoke-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `package.json`、`bun.lock`、`.env` 或真实密钥。
- 不注册 Medusa payment provider。
- 不接支付宝或微信支付。
- 不执行 payment workflow。
- 不连接预发或生产数据库。

## 验证命令

```bash
.codex/scripts/mock-provider-runtime-local-smoke.sh disabled
.codex/scripts/mock-provider-runtime-local-smoke.sh accepted
.codex/scripts/mock-provider-runtime-local-smoke.sh duplicate
.codex/scripts/mock-provider-runtime-local-smoke.sh rejected
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成标准

- 四种 smoke 模式通过。
- Harness 和 API typecheck 通过。
- `medusa-config.ts` 未注册 payment notification 或 mock provider。
- disposable DB 和 9120 端口无残留。
- 只记录验证，不改 runtime code。
