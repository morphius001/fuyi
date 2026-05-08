# Mock Webhook DB-backed Route Post Validation

更新时间：2026-05-08 12:46 Asia/Shanghai

## 背景

已合并：

- PR #164：`mock-webhook-db-backed-route-local-accepted`
- PR #165：`mock-webhook-db-backed-route-local-rejected-smoke`

本轮只记录合并后验证结果，不修改 runtime 代码。

## 验证命令与结果

已执行：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh accepted
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh duplicate
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh rejected
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -RIn "china-payment-notification" packages/api/medusa-config.ts packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U codex -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%' order by datname"
ss -ltnp | grep ':9110' || true
git diff --check
```

结果：

- Payment notification harness 通过：16 suites / 108 tests。
- Inbox migration skeleton dry-run 通过，row count `2|9`，临时库已删除。
- Local DB accepted smoke 通过。
- Local DB duplicate smoke 通过。
- Local DB rejected smoke 通过：
  - missing signature。
  - invalid signature。
  - non-CNY payload，当前按既有 contract 返回 `PAYLOAD_INVALID`。
- API typecheck 通过。
- Runtime grep 未发现 `medusa-config.ts`、workflows、subscribers、jobs、links 注册 payment notification runtime。
- route / inbox disposable DB 无残留。
- 9110 无残留监听。
- `git diff --check` 通过。

## 当前状态

Neutral mock webhook route 已具备 local-only disposable DB inbox smoke：

- accepted。
- duplicate。
- rejected。

但它仍不是生产支付 runtime。

## 安全边界

仍未做：

- 未注册 production migration。
- 未连接预发或生产数据库。
- 未执行 payment workflow。
- 未接真实支付宝或微信支付。
- 未改变 checkout、cart、order、payment session、refund、settlement、payout、commission 或 permission。

## 下一步建议

下一阶段可以回到 docs-only 规划：

1. `mock-webhook-db-backed-route-runtime-gate-plan`
   - 规划从 local DB smoke 到未来 runtime gate 的条件。
   - 仍不执行 workflow。
2. `payment-notification-provider-adapter-plan`
   - 先规划支付宝 / 微信支付 provider adapter 接口，不写真实 provider。

任何 payment workflow execution、支付宝、微信支付、退款、对账、商家结算、佣金和权限都继续单独串行。
