# payment-repository-disposable-db-script-validation

## 目标

记录 repository disposable DB test script 合并后的验证结果。

## 允许修改

- `docs/payment-repository-disposable-db-script-validation.md`
- `.codex/tasks/payment-repository-disposable-db-script-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 验证命令

```bash
.codex/scripts/payment-inbox-repository-disposable-db-test.sh
.codex/scripts/payment-notification-idempotency-harness.sh
git grep -n -e 'china-payment-notification' -- \
  packages/api/medusa-config.ts \
  packages/api/src/api \
  packages/api/src/workflows \
  packages/api/src/subscribers \
  packages/api/src/jobs \
  packages/api/src/links
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```
