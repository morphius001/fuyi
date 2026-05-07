# mock-webhook-neutral-route-inmemory-skeleton

## 目标

为 neutral mock payment webhook route 增加 local-only in-memory 分支。

## 允许修改

- `packages/api/src/api/china/payment-webhooks/mock/route.ts`
- `packages/api/src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts`
- `.codex/tasks/mock-webhook-neutral-route-inmemory-skeleton.md`
- `docs/mock-webhook-neutral-route-inmemory-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/package.json`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥
- 支付、订单、退款、结算、佣金、权限业务逻辑

## 必须满足

- 默认 disabled。
- production disabled。
- 只有 local env gate 全部满足时才读 body。
- 只允许 `mock_china_pay` + `mock_inbox_only`。
- 使用临时 mock secret，不输出 secret。
- 只使用 in-memory repository。
- 不连接 DB。
- 不执行 payment workflow。
- 不接支付宝、微信支付、退款、对账或商家结算。

## 验证

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```
