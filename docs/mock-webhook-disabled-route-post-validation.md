# Mock Webhook Disabled Route 合并后验证

## 范围

本报告记录 PR #131 合并后的验证。

主线提交：

- `8721d32 feat add disabled mock webhook route skeleton (#131)`

## 验证结果

执行时间：2026-05-08 00:45 Asia/Shanghai

### Payment Notification Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 13 passed, 13 total
Tests:       75 passed, 75 total
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

结果只命中：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts:6:} from "../../../../modules/china-payment-notification";
```

### Disposable DB 无残留

命令：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：为空。

## 当前边界

- Admin route 当前只返回 disabled 503。
- Route 不读取 request body。
- Route 不调用 handler。
- Route 不创建 repository 或 DB connection。
- Route 不执行 payment workflow。
- 未修改 `packages/api/medusa-config.ts`。
- 未新增 workflow、subscriber、job 或 link。

## 下一步

安全下一步只能做 `mock-webhook-local-route-inmemory-plan`，规划 local in-memory smoke。不能直接接真实 DB、预发 DB、支付宝、微信支付或 workflow execution。
