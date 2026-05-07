# mock-webhook-composition-post-validation

## 目标

记录 PR #124 和 PR #125 合并后的 mock webhook composition helper 验证结果。

## 允许修改

- `.codex/tasks/mock-webhook-composition-post-validation.md`
- `docs/mock-webhook-composition-post-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

## 边界

- 只记录验证。
- 不改业务代码。
- 不新增 API route。
- 不接 runtime，不写 DB，不调用 payment workflow。
