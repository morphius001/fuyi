# mock-webhook-local-route-disabled-skeleton

## 目标

新增默认 disabled 的 mock webhook local route skeleton。它只返回 disabled response，不调用 handler，不读取 raw body，不连接 repository。

## 允许修改

- `packages/api/src/api/admin/china/mock-payment-webhooks/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-webhook-local-route-disabled-skeleton.md`
- `docs/mock-webhook-local-route-disabled-skeleton.md`
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

预期 grep 只命中 `packages/api/src/api/admin/china/mock-payment-webhooks/route.ts`。
