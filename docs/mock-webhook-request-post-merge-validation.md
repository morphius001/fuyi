# Mock Webhook Request Contract 合并后验证

## 范围

本报告记录 PR #120 合并后的验证。

主线提交：`0c174f9 feat add mock payment webhook request contract (#120)`。

PR #120 新增 mock-only request contract：

- `mapMockPaymentWebhookRequestToNormalizeInput()`
- request contract 单元测试
- payment notification harness 覆盖 request contract
- 对应任务文件、边界文档和 ledger 更新

## 验证结果

执行时间：2026-05-07 22:35 Asia/Shanghai

### Payment Notification Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 10 passed, 10 total
Tests:       57 passed, 57 total
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

- Request contract 不解析 JSON。
- Request contract 不验签。
- Request contract 不写 inbox。
- Request contract 不连接数据库。
- 当前仍未新增 API route。
- 当前仍未注册 payment notification runtime。
- 当前仍未调用 payment workflow。
- 当前仍未改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 行为。

## 独立复核

子 agent 独立复核结果一致：

- `packages/api/medusa-config.ts` 没有注册该模块或 migration。
- `packages/api/src/api`、`workflows`、`subscribers`、`jobs`、`links` 中没有 mock webhook 或 payment notification runtime 文件。
- request/response 仍只是纯函数 contract。
- runtime config 仍默认 disabled，只允许 mock provider 枚举。
- API package 自身没有 `check-types` script；后续 API typecheck 继续使用 `cd packages/api && bunx tsc --noEmit -p tsconfig.json`。

## 下一步

安全下一步可以做 `mock-webhook-handler-composition-plan`：只规划 request contract、runtime disabled config、response mapper、normalizer、repository contract 和 state guard 如何组合，不新增 route 或 runtime。真正新增 API route、DB write、workflow command execution 和真实支付宝/微信支付继续保持单独串行。
