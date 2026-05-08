# Task: mock-webhook-db-backed-route-local-accepted

## 目标

把 neutral mock payment webhook route 的 local DB path 从 disabled skeleton 推进到本地 disposable Postgres accepted / duplicate smoke。

本任务仍然只允许 mock provider、local-only、inbox-only，不执行 payment workflow。

## 允许修改

- `packages/api/src/api/china/payment-webhooks/mock/route.ts`
- `packages/api/src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh`
- `docs/mock-webhook-db-backed-route-local-accepted.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不注册 production migration。
- 不连接预发或生产数据库。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。
- 不调用 payment workflow。
- 不改变 checkout、cart、order、payment session、refund、settlement、payout 或 permission 状态。

## 实现要求

- route 只在 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true` 且非 production 时进入 local DB path。
- route 必须先确认 local DB repository 可用，再读取 request body。
- local DB 必须显式提供 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL` 和 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME`。
- DB name 必须继续受 local adapter dry-run 前缀保护。
- route 必须确认当前 Medusa pg connection 正在连接同一个 local disposable DB。
- raw payload、signature、secret、database URL 不得进入响应或 event metadata。
- accepted smoke 断言 HTTP 202 / `accepted`、inbox count = 1、event log 包含 `verified`。
- duplicate smoke 断言 HTTP 200 / `duplicate`、inbox count 仍为 1、event log 包含 `dedupe_hit`。
- 临时 API 只允许使用 9110，并且脚本不得关闭 9000 常驻服务。
- 脚本必须清理自己创建的临时 DB 和临时 API。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh accepted
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh duplicate
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git diff --check
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
ss -ltnp | grep ':9110' || true
```

## 完成标准

- payment notification harness 通过。
- accepted / duplicate local disposable DB smoke 通过。
- API typecheck 通过。
- `git diff --check` 通过。
- 无 route/inbox disposable DB 残留。
- 9110 无残留监听。
- 仍未注册 migration、未接真实 provider、未执行 workflow。
