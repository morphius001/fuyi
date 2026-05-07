# mock-webhook-composition-error-tests

## 目标

补齐 mock webhook composition helper 的 repository error mapping 单元测试和安全响应码。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-webhook-composition-error-tests.md`
- `docs/mock-webhook-composition-error-tests.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `packages/api/src/workflows/**`
- `packages/api/src/subscribers/**`
- `packages/api/src/jobs/**`
- `packages/api/src/links/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 要求

- repository unique conflict 映射为 duplicate response。
- repository retryable/unknown receive failure 映射为 `INBOX_RETRYABLE`。
- audit append retryable failure 映射为 `INBOX_RETRYABLE`，但不得执行 workflow。
- response 不暴露 raw payload、secret 或完整签名。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```
