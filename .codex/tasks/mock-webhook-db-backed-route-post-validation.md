# Task: mock-webhook-db-backed-route-post-validation

## 目标

记录 PR #164 / #165 合并后的 mock webhook DB-backed route 验证结果。

## 允许修改

- `.codex/tasks/mock-webhook-db-backed-route-post-validation.md`
- `docs/mock-webhook-db-backed-route-post-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不调用 payment workflow。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh accepted
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh duplicate
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh rejected
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -RIn "china-payment-notification" packages/api/medusa-config.ts packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
ss -ltnp | grep ':9110' || true
git diff --check
```

## 完成标准

- 验证结果写入 docs。
- queue 和 ledger 更新。
- 未修改 runtime 代码。
