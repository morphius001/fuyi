# Mock Webhook Admin Route Disabled-only

更新时间：2026-05-07 22:25 Asia/Shanghai

## 结论

旧 Admin mock webhook route 已降级为 disabled-only。

```text
POST /admin/china/mock-payment-webhooks
```

该 route 现在只作为误调用保护存在，不再支持 local in-memory mock webhook 处理。

## 为什么这样做

Admin route 位于 `/admin/**` 命名空间，不适合作为真实 provider callback：

- 支付宝、微信支付等异步通知不应依赖 Admin session。
- 为 provider callback 放开 Admin auth 会扩大后台攻击面。
- neutral route 已经承担 mock provider callback 的本地验证路径。

后续 mock webhook 只沿 neutral route 演进：

```text
POST /china/payment-webhooks/mock
```

## 本轮改动

- 删除 Admin route 的 local in-memory 分支。
- 删除 Admin route 的 request body 读取。
- 删除 Admin route 的 signature/header 处理。
- 删除 Admin route 的 in-memory repository 构造。
- 保留 runtime config parsing，只用于判断 `runtimeRequested` 调试字段。
- 保留 disabled response mapper，响应状态仍为 503。

## 响应语义

Admin route 在以下场景全部返回 disabled：

- 默认环境。
- `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true`。
- `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only`。
- `CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true`。
- `NODE_ENV=production`。

响应不读取 raw body，不写 inbox，不调用 handler，不执行 workflow。

## 安全边界

本轮没有：

- 接真实支付宝或微信支付。
- 接真实 PaymentProvider。
- 连接 DB-backed inbox repository。
- 注册 migration。
- 调用 payment workflow。
- 修改 checkout、order、payment、refund、settlement、payout、commission 或 permission 逻辑。

## 验证结果

已在本地运行：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
git diff --check
```

结果：

- Payment notification harness 通过。
- Jest 单测 14 个 suites 全部通过，83 个 tests 全部通过。
- Admin route 单测覆盖默认、runtime requested、local in-memory requested、production 都 disabled 且不读取 body。
- API typecheck 通过。
- Runtime grep 只命中 Admin disabled route、neutral mock route 和 neutral route 单测；未命中 `medusa-config.ts`、workflows、subscribers、jobs 或 links 注册。
- Disposable DB 残留查询为空。
- `git diff --check` 通过。

## 后续

下一步建议新增 post-validation 文档任务，记录本轮合并后的 harness、typecheck、runtime grep 和 DB 无残留结果。

再下一步才规划 neutral route 的 DB-backed inbox skeleton；仍不碰 Admin route。
