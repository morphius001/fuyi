# Task: mock-webhook-admin-route-disabled-validation

## 目标

记录旧 Admin mock webhook route 降级为 disabled-only 合并后的验证结果。

## 允许修改

- `.codex/tasks/mock-webhook-admin-route-disabled-validation.md`
- `docs/mock-webhook-admin-route-disabled-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `packages/**`。
- 不修改 `apps/**`。
- 不新增 API route。
- 不连接 DB-backed repository。
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

- 文档记录 PR #151 合并后的实际验证结果。
- 明确 Admin route 已 disabled-only。
- 明确 neutral route 仍是唯一 mock provider callback 演进路径。
- 明确未接 runtime、DB-backed repository、migration、payment workflow 或真实支付 Provider。
