# Mock Webhook Neutral Route Disabled Post-Validation

更新时间：2026-05-07 18:45 Asia/Shanghai

## 对象

- PR: [#139](https://github.com/morphius001/fuyi/pull/139)
- 标题：`feat: add neutral disabled mock webhook route`
- Merge commit: `4fa645f679343c6820c3fdfd62f23e2787631ee6`

## 合并后验证

在 `origin/main` 基线上创建验证分支后执行。

### Payment Notification Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

- 14 个 test suites 通过。
- 80/80 tests 通过。
- 本地 disposable DB dry-run 通过。
- dry-run row count：`2|9`。
- 临时库 `fuyi_payment_notification_inbox_dry_run_20260507184340` 已删除。

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

neutral mock route 已存在，但仍不是可用支付 runtime：

- 默认 disabled。
- 即使 env requested 也 disabled。
- 不读取 body。
- 不调用 handler。
- 不创建 repository。
- 不连接 DB。
- 不执行 payment workflow。
- 不接支付宝或微信支付。

## 风险结论

本轮合并后风险可控。

下一步可以规划 `mock-webhook-neutral-route-inmemory-plan` 或 `mock-webhook-neutral-route-inmemory-skeleton`，但必须继续保持：

- local-only。
- mock-only。
- 不连接 DB。
- 不执行 payment workflow。
- 不接真实支付宝、微信支付、退款、对账或商家结算。
