# mock-webhook-local-route-inmemory-skeleton

## 目标

为 mock webhook Admin route 增加 local-only in-memory 分支。默认仍 disabled；只有显式 local env 才读取 raw body 并调用 handler。

## 允许修改

- `packages/api/src/api/admin/china/mock-payment-webhooks/**`
- `.codex/tasks/mock-webhook-local-route-inmemory-skeleton.md`
- `docs/mock-webhook-local-route-inmemory-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/src/workflows/**`
- `packages/api/src/subscribers/**`
- `packages/api/src/jobs/**`
- `packages/api/src/links/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```
