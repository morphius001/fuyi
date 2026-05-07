# 支付通知合并后验证记录

## 范围

本记录覆盖支付通知方向已合并的安全链路：

- 支付通知幂等计划。
- 支付通知合同。
- Mock payment notification skeleton。
- Inbox / event log 模型设计。
- 本地 disposable DB dry-run。
- 未注册 migration skeleton。
- 从 skeleton 提取 SQL 的 dry-run 脚本。
- 本地 idempotency harness。
- Edge-case 单测。
- In-memory inbox repository。

## 验证时间

2026-05-07 14:04 Asia/Shanghai

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
CHECK payment notification module is not registered in medusa-config.ts
CHECK staged files do not include forbidden runtime/config scope
RUN mock payment notification unit tests
PASS src/modules/china-payment-notification/__tests__/mock-payment-notification.unit.spec.ts
Tests: 10 passed, 10 total
RUN payment notification inbox migration skeleton dry-run
CREATE disposable dry-run database: fuyi_payment_notification_inbox_dry_run_20260507140449
CHECK row counts
2|2
PASS payment notification inbox migration skeleton local dry-run completed and disposable database will be dropped.
PASS payment notification idempotency harness completed.
```

```bash
cd packages/api
bunx tsc --noEmit -p tsconfig.json
```

结果：通过。

```bash
git grep -n -e 'china-payment-notification' -- \
  packages/api/medusa-config.ts \
  apps \
  packages/api/src/api \
  packages/api/src/workflows \
  packages/api/src/subscribers \
  packages/api/src/jobs \
  packages/api/src/links || true
```

结果：无输出，表示未发现 runtime 注册或三端调用。

无残留复查：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果为空，表示临时库已删除。

## 当前边界

- `china-payment-notification` 仍未注册到 `medusa-config.ts`。
- 未接 webhook route、workflow、subscriber、job、link 或 checkout。
- 未接真实支付宝或微信支付。
- 未改变 checkout、cart、order、payment、refund、settlement、commission 或 permission 行为。
- migration 仍是 skeleton，不能用于预发或生产。
- dry-run 仅在本地 disposable DB 上执行。

## 下一步建议

1. `payment-notification-repository-sql-design`
   - 设计 SQL repository 和测试边界。
   - 不接 runtime。

2. `payment-notification-handler-state-guard-plan`
   - 规划 handler 到 payment workflow 的状态机守卫。
   - 只做文档，不能写状态推进代码。

3. `mock-payment-notification-runtime-disabled-plan`
   - 设计默认 disabled 的 mock runtime。
   - 仍不接真实支付。

真实支付宝、微信支付、退款、对账、商家结算、佣金和权限继续保持高风险串行。
