# Task: mock-webhook-db-client-contract-validation

## 目标

记录 `mock-webhook-db-client-contract` 合并后的验证结果。

本任务只写验证文档和 ledger，不修改 runtime。

## 允许修改

- `.codex/tasks/mock-webhook-db-client-contract-validation.md`
- `docs/mock-webhook-db-client-contract-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增依赖。
- 不连接预发或生产数据库。
- 不注册 migration。
- 不接 route。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
ss -ltn '( sport = :9110 )' || true
git diff --check
```

## 完成标准

- 验证文档记录实际结果。
- 不新增 runtime 代码。
- 下一步任务仍保持 mock-only、local-only、串行推进。
