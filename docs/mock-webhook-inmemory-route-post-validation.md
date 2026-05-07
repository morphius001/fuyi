# Mock Webhook In-Memory Route 合并后验证

## 范围

本报告记录 PR #134 合并后的验证。

主线提交：

- `d3fa2e9 feat add local in-memory mock webhook route (#134)`

## 验证结果

执行时间：2026-05-08 01:20 Asia/Shanghai

### Payment Notification Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 13 passed, 13 total
Tests:       78 passed, 78 total
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

### Runtime 入口检查

命令：

```bash
grep -R -n 'china-payment-notification' \
  packages/api/medusa-config.ts \
  packages/api/src/api \
  packages/api/src/workflows \
  packages/api/src/subscribers \
  packages/api/src/jobs \
  packages/api/src/links 2>/dev/null || true
```

结果命中：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
packages/api/src/api/admin/china/mock-payment-webhooks/__tests__/route.unit.spec.ts
```

正式 runtime 入口仍只有 route 文件；第二条是单元测试 import。

### Disposable DB 无残留

命令：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：为空。

## 当前边界

- 默认仍 disabled。
- production 强制 disabled。
- local in-memory 分支需要显式 env gate。
- 不连接数据库。
- 不执行 payment workflow。
- 不接真实支付宝、微信支付或任何真实 Provider。
- 未改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 行为。

## 下一步

安全下一步只能做 `mock-webhook-local-route-smoke-script-plan`，规划本地 curl/script smoke。不要直接进入 DB-backed route。
