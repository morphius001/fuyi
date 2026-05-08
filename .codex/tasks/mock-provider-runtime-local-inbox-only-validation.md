# Task: mock-provider-runtime-local-inbox-only-validation

## 目标

记录 `mock-provider-runtime-local-inbox-only-skeleton` 合并后的验证结果。

## 允许修改

- `.codex/tasks/mock-provider-runtime-local-inbox-only-validation.md`
- `docs/mock-provider-runtime-local-inbox-only-validation.md`
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
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
git grep -n "china-payment-notification" -- packages/api/medusa-config.ts || true
psql -h 127.0.0.1 -p 15432 -U codex -d postgres -Atc "select datname from pg_database where datname ~ '^fuyi_payment_notification_.*dry_run_.*' order by datname;"
```

## 完成标准

- PR #187 已合并。
- Harness、typecheck、diff check、runtime registration grep 均通过。
- disposable DB 无残留。
- 文档明确本阶段仍不是可上线支付 runtime。
