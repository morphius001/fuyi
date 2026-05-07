# Mock Webhook Composition 合并后验证

## 范围

本报告记录 PR #124 和 PR #125 合并后的验证。

主线提交：

- `8435924 feat add mock webhook composition helper (#124)`
- `0b5eba8 test add mock webhook composition error mapping (#125)`

## 验证结果

执行时间：2026-05-07 23:45 Asia/Shanghai

### Payment Notification Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 11 passed, 11 total
Tests:       69 passed, 69 total
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
  "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：为空。

## 当前边界

- Composition helper 仍位于未注册 module 内。
- 没有新增 `packages/api/src/api/**` route。
- 没有修改 `packages/api/medusa-config.ts`。
- 没有创建数据库连接。
- 没有执行 payment workflow。
- 没有改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 行为。

## 下一步

安全下一步可以做 `mock-webhook-handler-skeleton-plan`：只规划未注册 handler 函数的文件边界、输入输出、runtime disabled gate 和验证清单。真正新增 API route、DB write、runtime switch、真实支付宝/微信支付、退款、对账和结算继续拆开。
