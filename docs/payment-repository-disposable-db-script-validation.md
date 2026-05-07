# 支付通知 Repository Disposable DB Script 合并后验证

## 范围

本报告记录 PR #116 合并后的验证。

## 验证结果

执行时间：2026-05-07 21:30 Asia/Shanghai

### Repository Disposable DB Script

命令：

```bash
.codex/scripts/payment-inbox-repository-disposable-db-test.sh
```

结果：

```text
CREATE disposable dry-run database: fuyi_payment_notification_repository_dry_run_20260507164949
APPLY payment notification schema
RUN repository integration test
CHECK repository row counts
3|6
APPLY rollback
CHECK rollback removed dry-run tables
DROP disposable dry-run database
CHECK no residual disposable database
PASS payment notification repository disposable DB test completed.
```

### Payment Notification Harness

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
PASS payment notification idempotency harness completed.
```

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
  "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：为空。

## 当前边界

- 脚本只连接本地 disposable DB。
- 未连接预发或生产数据库。
- 未新增 webhook route。
- 未注册 migration。
- 未调用 payment workflow。
- 未改变 checkout、cart、order、payment、refund、settlement、commission 或 permission。

## 下一步

安全下一步可以做 `mock-webhook-inbox-only-route-readiness`，继续只检查 route 前依赖和禁区；真正新增 route 仍需单独高风险串行任务。
