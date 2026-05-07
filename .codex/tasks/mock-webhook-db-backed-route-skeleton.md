# Task: mock-webhook-db-backed-route-skeleton

## 目标

为 neutral mock webhook route 增加 DB-backed resolver skeleton。

当前第一步只识别 local DB gate 并调用 resolver；在没有安全 repository injection 时仍返回 disabled，不读 body、不写库。

## 允许修改

- `packages/api/src/api/china/payment-webhooks/mock/**`
- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh`
- `.codex/tasks/mock-webhook-db-backed-route-skeleton.md`
- `docs/mock-webhook-db-backed-route-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不注册 migration。
- 不创建真实 DB connection。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
git diff --check
```

## 完成标准

- local DB env 下 route 仍 disabled，直到 repository injection 可用。
- route 不读取 body、不写库、不执行 workflow。
- local in-memory mock 路径不回归。
- local DB preflight smoke 继续通过。
