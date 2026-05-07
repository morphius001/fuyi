# Task: mock-webhook-db-backed-route-resolver-contract

## 目标

新增 neutral mock webhook route 的 repository resolver contract、纯 helper 和 mocked tests。

本任务不接 route，不连接 DB，不注册 migration，不调用 payment workflow。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-webhook-db-backed-route-resolver-contract.md`
- `docs/mock-webhook-db-backed-route-resolver-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增或修改 API route。
- 不实现真实 DB connection。
- 不注册 migration。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
git diff --check
```

## 完成标准

- resolver 默认 disabled，production disabled。
- 只有 local DB flag、transaction client 和 repository factory 都存在时才返回 available。
- resolver 不泄漏 database URL、secret、签名或 raw payload。
- harness 覆盖 resolver 单测。
- Runtime grep 不出现 workflow/subscriber/job/link 注册。
