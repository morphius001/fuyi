# Mock Webhook Neutral Route In-Memory Post-Validation

更新时间：2026-05-07 19:00 Asia/Shanghai

## 对象

- PR: [#142](https://github.com/morphius001/fuyi/pull/142)
- 标题：`feat: add neutral in-memory mock webhook route`
- Merge commit: `3751bb5d97d96ebfad6b255078ef4db6c15f914a`

## 合并后验证

在 `origin/main` 基线上执行。

### Payment Notification Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

- 14 个 test suites 通过。
- 83/83 tests 通过。
- 本地 disposable DB dry-run 通过。
- dry-run row count：`2|9`。
- 临时库 `fuyi_payment_notification_inbox_dry_run_20260507185750` 已删除。

### API Typecheck

命令：

```bash
cd packages/api && bunx tsc --noEmit -p tsconfig.json
```

结果：通过，无输出。

### Runtime 入口检查

命令：

```bash
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
```

结果只命中：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
packages/api/src/api/admin/china/mock-payment-webhooks/__tests__/route.unit.spec.ts
packages/api/src/api/china/payment-webhooks/mock/route.ts
packages/api/src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts
```

没有命中：

- `packages/api/medusa-config.ts`
- workflows
- subscribers
- jobs
- links

### Disposable DB 残留检查

命令：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：空。

## 当前状态

neutral mock route 当前能力：

- 默认 disabled。
- production disabled。
- local-only env gate 满足时可以使用 in-memory mock inbox-only 分支。
- 不连接 DB。
- 不注册 module。
- 不执行 payment workflow。
- 不接支付宝或微信支付。
- 不改变 payment/order/refund/settlement/commission/permission 状态。
- 单测包含 raw payload、signature、mock secret 不泄漏断言。

## 风险结论

本轮合并后风险可控。

下一步应先规划 `mock-webhook-neutral-route-smoke-script-plan`，只针对 neutral route 设计本地 smoke。不要跳到 DB-backed route、真实 Provider、退款、对账或商家结算。
