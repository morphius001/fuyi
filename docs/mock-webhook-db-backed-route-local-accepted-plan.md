# Mock Webhook DB-backed Route Local Accepted Plan

更新时间：2026-05-08 01:18 Asia/Shanghai

## 背景

当前已具备：

- neutral mock webhook route：`POST /china/payment-webhooks/mock`。
- local DB resolver skeleton。
- local disposable Postgres adapter skeleton。
- DB preflight smoke：临时 API + disposable DB + disabled route。
- payment notification harness：16 suites / 105 tests。

下一步可以规划把 neutral route 的 local DB path 从 disabled skeleton 推进到 local disposable DB inbox-only accepted / duplicate smoke。

## 目标

下一轮实现只允许：

1. route 在 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true` 时创建 local adapter。
2. route 用 adapter 创建 `DbPaymentNotificationInboxRepository`。
3. resolver 返回 available 后才读取 body。
4. route 调用 `handleMockPaymentWebhookNotification()`。
5. runtime mode 保持 `mock_inbox_only`。
6. 只写 `payment_notification_inbox` / `payment_notification_event_log`。
7. smoke 证明 accepted / duplicate / rejected 行为。

## 非目标

- 不接真实支付宝。
- 不接真实微信支付。
- 不注册 production migration。
- 不连接预发或生产数据库。
- 不执行 payment workflow。
- 不改变 payment session、order、refund、settlement、commission、payout 或 permission。
- 不重新启用旧 Admin mock route。

## Route 最小改动

建议下一轮只改 neutral route：

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
```

新增 local DB path：

1. 读取 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true`。
2. 构造 local database URL 输入。
3. 调用 `createLocalPaymentNotificationPostgresClient()`。
4. 传入 `resolveMockWebhookInboxRepository()`：
   - `transactionClient`: local client。
   - `repositoryFactory`: `(client) => new DbPaymentNotificationInboxRepository(client)`。
5. resolver `available` 后读取 raw body。
6. 调用 `handleMockPaymentWebhookNotification()`。
7. 返回 mapper 响应和安全 debug。

仍然保留：

- production disabled。
- resolver disabled / unavailable 时不读 body。
- local DB gate 优先于 local in-memory。
- local in-memory smoke 路径不回归。

## Local Adapter 输入

route 不得主动读取真实 `.env` 或猜测 production container token。local adapter 输入必须来自显式 env：

```text
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL=postgres://...
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME=fuyi_payment_notification_route_dry_run_...
NODE_ENV=development
```

其中：

- DB name 必须是 dry-run 前缀。
- host 必须是 `127.0.0.1` 或 `localhost`。
- production 永远 disabled。
- database URL 不得进入响应、日志或 event metadata。

如果 DB URL / name 不满足 gate，route 返回 disabled，不读 body。

## Smoke Script 规划

下一轮可以扩展：

```text
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
```

新增 mode：

```text
accepted
duplicate
rejected
```

建议仍默认跑 preflight disabled；accepted/duplicate 由脚本自己创建 disposable DB、应用 migration、启动临时 API、发送 signed payload、查询 DB、清理。

## Accepted Smoke

步骤：

1. 创建 disposable DB：`fuyi_payment_notification_route_dry_run_*`。
2. 应用 migration skeleton up SQL。
3. 启动临时 API `127.0.0.1:9110`。
4. 注入 fake env：
   - `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true`
   - `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only`
   - `CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay`
   - `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true`
   - `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL=postgres://.../fuyi_payment_notification_route_dry_run_*`
   - `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME=fuyi_payment_notification_route_dry_run_*`
   - `CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=local_db_route_smoke_secret_not_real`
5. 发送 signed payload。
6. 断言 HTTP 202 / `accepted`。
7. 查询 DB：
   - inbox row count = 1。
   - event log actions 包含 `received`、`verified`。
   - `raw_payload_digest` 存在。
   - 不存在 raw payload、signature、secret、database URL。

## Duplicate Smoke

步骤：

1. 使用 accepted smoke 的同一临时 API 和 DB。
2. 再发送同一 signed payload。
3. 断言 HTTP 200 / `duplicate`。
4. 查询 DB：
   - inbox row count 仍为 1。
   - event log actions 包含 `dedupe_hit`。
   - 无 raw payload / secret / database URL。

## Rejected Smoke

建议先覆盖：

- missing signature：400 `SIGNATURE_MISSING`。
- invalid signature：400 `SIGNATURE_INVALID`。
- non-CNY payload：400 `CURRENCY_UNSUPPORTED`。

DB 断言：

- missing / invalid signature 不应写 verified event。
- invalid signature 可以按 repository contract 写 terminal_failed，但不能泄漏 signature。
- non-CNY payload 在 normalizer 阶段拒绝，不应写 inbox。

如果实际 composition 当前行为和上述预期不一致，先以现有 contract 为准补文档，不要临场改变状态语义。

## 回滚与清理

脚本必须：

- 只关闭自己启动的临时 API。
- 不关闭 9000 常驻服务。
- 不修改 `.env`。
- down migration。
- 删除 disposable DB。
- 复查 `fuyi_payment_notification_route_dry_run_%` 和 `fuyi_payment_notification_inbox_dry_run_%` 无残留。
- 复查 9110 无监听。

## 实现 PR 拆分

推荐：

1. `mock-webhook-db-backed-route-local-accepted`
   - route 接 local adapter。
   - smoke 脚本新增 accepted / duplicate。
   - 不执行 workflow。
2. `mock-webhook-db-backed-route-local-rejected-smoke`
   - 补 missing / invalid / non-CNY smoke。
   - 不改状态推进。
3. `mock-webhook-db-backed-route-post-validation`
   - 合并后记录 harness、smoke、typecheck、runtime grep、DB/端口无残留。

payment workflow execution、支付宝、微信支付、退款、对账和商家结算继续后置。

## 验证清单

实现 PR 至少跑：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh accepted
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh duplicate
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
ss -ltn '( sport = :9110 )' || true
git diff --check
```

## Go / No-Go

Go：

- accepted / duplicate 只在 local disposable DB 下可用。
- production disabled。
- remote DB refused。
- raw payload / signature / secret / database URL 不落库、不进响应。
- workflow 不执行。

No-Go：

- 需要真实支付凭证。
- 需要预发或生产 DB。
- 需要注册 migration。
- 需要修改订单、退款、对账、结算、佣金或权限。
- 无法证明 DB 和端口清理。
