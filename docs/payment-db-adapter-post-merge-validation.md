# 支付通知 DB Adapter Skeleton 合并后验证

## 范围

本报告记录 PR #112 和 PR #113 合并后的验证：

- PR #112：DB adapter skeleton 计划。
- PR #113：注入式 DB adapter skeleton 和 mocked transaction 单测。

## 验证结果

执行时间：2026-05-07 20:30 Asia/Shanghai

### Idempotency Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 8 passed, 8 total
Tests:       46 passed, 46 total
CHECK row counts
2|9
PASS payment notification inbox migration skeleton local dry-run completed and disposable database will be dropped.
PASS payment notification idempotency harness completed.
```

### API Typecheck

命令：

```bash
cd packages/api
bunx tsc --noEmit -p tsconfig.json
```

结果：通过，无输出错误。

### Runtime 未注册检查

命令：

```bash
git grep -n -e 'china-payment-notification' -- \
  packages/api/medusa-config.ts \
  packages/api/src/api \
  packages/api/src/workflows \
  packages/api/src/subscribers \
  packages/api/src/jobs \
  packages/api/src/links
```

结果：无匹配。

### Disposable DB 无残留

命令：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：为空。

## 当前边界

- DB adapter skeleton 只接注入式 transaction client。
- 当前测试使用 mocked transaction client。
- 没有创建数据库连接。
- 没有新增 webhook route。
- 没有注册 migration。
- 没有调用 payment workflow。
- 没有真实支付宝、微信支付、退款、对账、结算、佣金或权限变更。

## 下一步

安全下一步应先做 `payment-inbox-repository-disposable-db-test-plan`，规划如何在本地 disposable DB 里验证 adapter 合同。真正连接任何数据库前仍必须保持本地 disposable、可回滚、无残留。
