# Mock Webhook DB-backed Route Local Accepted

更新时间：2026-05-08 12:24 Asia/Shanghai

## 本轮目标

本轮把 neutral mock payment webhook route 的 local DB path 从 disabled skeleton 推进到本地 disposable Postgres inbox-only smoke：

- `POST /china/payment-webhooks/mock`
- `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true`
- `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only`
- provider 仍为 `mock_china_pay`

它仍然不是生产支付 runtime，不执行 payment workflow，不接支付宝或微信支付。

## 改动摘要

### Neutral Route

`packages/api/src/api/china/payment-webhooks/mock/route.ts` 现在在 local DB gate 下：

1. 读取显式 local DB env。
2. 解析 `ContainerRegistrationKeys.PG_CONNECTION`。
3. 查询 `current_database()`，确认当前连接库名等于 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME`。
4. 构造 local-only Postgres adapter。
5. 通过 `resolveMockWebhookInboxRepository()` 创建 `DbPaymentNotificationInboxRepository`。
6. resolver available 后才读取 body。
7. 调用 `handleMockPaymentWebhookNotification()`。
8. 返回 `mock_payment_webhook_neutral_local_db` route 标记。

local DB gate 优先于 local in-memory；如果 repository 不可用，仍返回 disabled 且不读 body。

### Local Adapter

`local-postgres-db-client.ts` 保持 local-only：

- production refused。
- 未显式 local DB flag refused。
- DB name 必须是 dry-run 前缀。
- host 只能是 `127.0.0.1` 或 `localhost`。
- event metadata 只保留 allowlist primitive 字段。

本轮补齐：

- `rowCount` 兼容。
- 插入前先按 provider + idempotency key 查询，稳定处理 sequential duplicate。
- route adapter 将 Knex raw SQL placeholder 从 `$1` 转换成 `?`。
- route adapter 将 `undefined` 参数转成 `null`，对应 nullable DB 字段。

### Event Log ID

本轮修复了一个 skeleton bug：

旧 `stableId()` 会把 event log id 截断到 48 个字符，长 inbox id 下 `received` 和 `verified` 可能生成同一个主键，导致 DB 23505 后被上层误判为 duplicate。

现在 `stableId()` 使用可读短前缀 + sha256 hash，既保留动作差异，又避免无限增长；并补充单测确认同一通知的 event log ids 不重复且长度受控。

### Smoke Script

`.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh` 新增：

- `accepted` mode。
- `duplicate` mode。
- local app schema 复制到 disposable DB。
- signed payload 生成。
- inbox / event log DB 断言。
- raw payload / mock secret / signature / DB URL 响应泄漏检查。
- curl 30 秒超时，避免异常挂住整轮。
- 固定使用 9110，不允许通过 env 改到常驻服务端口。
- dry-run DB name 继续要求 `fuyi_payment_notification_route_dry_run_` 前缀，并增加 `[A-Za-z0-9_]` 白名单。
- 先停止临时 API，再 terminate DB sessions，再 drop disposable DB。

## 验证结果

已执行：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh accepted
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh duplicate
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git diff --check
psql -h 127.0.0.1 -p 15432 -U codex -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%' order by datname"
ss -ltnp | grep ':9110' || true
```

结果：

- payment notification harness 通过：16 suites / 108 tests。
- inbox migration skeleton dry-run 通过，row count `2|9`，临时库已清理。
- accepted smoke 通过：HTTP 202 / `accepted`，inbox count = 1，event log 包含 `verified`。
- duplicate smoke 通过：HTTP 200 / `duplicate`，inbox count 仍为 1，event log 包含 `dedupe_hit`。
- API typecheck 通过。
- `git diff --check` 通过。
- route / inbox disposable DB 无残留。
- 9110 无残留监听。

## 安全边界

本轮仍未做：

- 未注册 production migration。
- 未连接预发或生产数据库。
- 未接真实支付宝。
- 未接真实微信支付。
- 未执行 payment workflow。
- 未改变 checkout、cart、order、payment session、refund、settlement、payout、commission 或 permission。
- 未启用旧 Admin mock route。

## 下一步

建议下一步单独做：

1. `mock-webhook-db-backed-route-local-rejected-smoke`
   - missing signature。
   - invalid signature。
   - non-CNY payload。
   - 验证 rejected path 不泄漏敏感字段。
2. `mock-webhook-db-backed-route-post-validation`
   - 合并后重新记录 harness、typecheck、runtime grep、DB/端口无残留。

payment workflow execution、支付宝、微信支付、退款、对账、商家结算、佣金和权限继续后置为高风险串行任务。
