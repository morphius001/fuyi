# 支付通知 Round 55 验证记录

## 范围

本记录覆盖 command mapper 合并后的支付通知安全链路：

- mock notification envelope / signature / idempotency
- inbox repository
- state guard
- workflow command mapper DTO
- inbox migration skeleton dry-run
- 未注册 runtime 检查

## 时间

2026-05-07 14:29 Asia/Shanghai

## 验证结果

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果摘要：

```text
CHECK payment notification module is not registered in medusa-config.ts
CHECK staged files do not include forbidden runtime/config scope
RUN payment notification unit tests
PASS src/modules/china-payment-notification/__tests__/payment-workflow-command-mapper.unit.spec.ts
PASS src/modules/china-payment-notification/__tests__/mock-payment-notification.unit.spec.ts
PASS src/modules/china-payment-notification/__tests__/payment-notification-inbox-repository.unit.spec.ts
PASS src/modules/china-payment-notification/__tests__/payment-notification-state-guard.unit.spec.ts
Tests: 25 passed, 25 total
CREATE disposable dry-run database: fuyi_payment_notification_inbox_dry_run_20260507142917
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

结果：无输出。

无残留复查：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果为空。

## 当前边界

- 未注册 `china-payment-notification`。
- 未接 webhook runtime。
- 未调用 Medusa/Mercur payment workflow。
- 未连接预发或生产数据库。
- 未改变 checkout、cart、order、payment、refund、settlement、commission 或 permission。
- 当前 command mapper 只输出 DTO，不执行 workflow。

## 下一步

继续支付方向前，建议只做以下安全任务之一：

1. `payment-notification-event-log-actions-plan`
   - 规划 event log action 白名单扩展。
   - 不改 migration。

2. `mock-payment-runtime-disabled-plan`
   - 规划默认 disabled 的 mock runtime。
   - 不执行 workflow。

3. `payment-sql-repository-plan`
   - 规划 SQL repository，不连接预发/生产。

真实支付宝、微信支付、退款、对账、商家结算、佣金和权限继续串行。
