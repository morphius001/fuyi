# Mock Webhook DB Client Contract Plan

更新时间：2026-05-08 00:40 Asia/Shanghai

## 背景

当前已有三层未注册 skeleton：

1. `DbPaymentNotificationInboxRepository`
   - 依赖抽象 `PaymentNotificationDbClient`。
   - 只知道 `transaction(handler)`。
   - handler 内只需要四个操作：
     - `insertInbox`
     - `updateInbox`
     - `findInboxByIdempotencyKey`
     - `insertEventLog`
2. `resolveMockWebhookInboxRepository()`
   - local DB flag + transaction client + repository factory 都存在才返回 repository。
   - production disabled。
3. neutral route local DB skeleton
   - `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true` 时优先走 DB resolver gate。
   - 没有安全 repository injection 时 disabled，不读 body、不写库。

下一步需要先规划一个 local disposable Postgres adapter contract，然后才实现 adapter skeleton。

## 目标

设计一个 local-only adapter，把本地 disposable Postgres 连接包装成 `PaymentNotificationDbClient`：

```text
createLocalPaymentNotificationPostgresClient(input) -> PaymentNotificationDbClient
```

这个 adapter 只为本地 smoke 服务，不是生产 repository 实现。

## 非目标

- 不接真实支付宝或微信支付。
- 不注册 production migration。
- 不连接预发或生产数据库。
- 不修改 Medusa `medusa-config.ts`。
- 不修改 route。
- 不调用 payment workflow。
- 不改变 payment session、order、refund、settlement、commission、payout 或 permission。

## 文件边界

下一轮实现建议只新增：

```text
packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts
packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
```

可选更新：

```text
packages/api/src/modules/china-payment-notification/index.ts
.codex/scripts/payment-notification-idempotency-harness.sh
docs/mock-webhook-db-client-contract.md
project-ledger/**
```

禁止：

```text
packages/api/medusa-config.ts
packages/api/src/api/**
packages/api/src/workflows/**
packages/api/src/subscribers/**
packages/api/src/jobs/**
packages/api/src/links/**
apps/**
```

## Local-only Gate

adapter 创建函数必须显式接收输入，不主动读取真实 `.env`：

```text
databaseUrl
databaseName
nodeEnv
localDbEnabled
allowRemoteDryRun
```

必须拒绝：

- `nodeEnv === "production"`。
- `localDbEnabled !== true`。
- database name 不以 `fuyi_payment_notification_route_dry_run_` 或 `fuyi_payment_notification_inbox_dry_run_` 开头。
- host 不是 `127.0.0.1` / `localhost`，除非显式 `allowRemoteDryRun=true`。
- database URL 为空。

adapter 不得把 database URL、password、secret、raw payload 写入 throw message 或响应对象。

## Transaction Contract

`PaymentNotificationDbClient.transaction(handler)` 应该：

1. 从本地 disposable DB 创建连接。
2. 开启 transaction。
3. 创建 `PaymentNotificationDbTransaction`。
4. 调用 handler。
5. handler 成功则 commit。
6. handler 失败则 rollback。
7. 无论成功失败都释放连接。

下一轮 adapter skeleton 可以先用注入式 driver，而不是直接引入新依赖：

```text
driver.connect(databaseUrl) -> connection
connection.query(sql, params)
connection.release()
```

这样 unit test 可以用 mocked driver 验证 SQL 和 transaction 顺序，不需要新增依赖。

## 为什么不使用生产连接池或 Medusa Container Token

本阶段 adapter 的目标是 local disposable DB smoke，不是生产 runtime。

不使用生产连接池的原因：

- 当前 migration 仍是未注册 skeleton，不能假设生产库已经存在 inbox / event log 表。
- local smoke 必须证明只写 disposable DB；复用生产连接池会让测试和真实数据边界混在一起。
- 支付通知是高风险链路，任何生产连接池接入都必须先经过 disposable preprod dry-run、迁移注册审查、回滚演练和 post-merge validation。
- 生产连接池的错误对象、连接串和 retry 行为可能包含敏感信息，当前 skeleton 不应承担脱敏和运维语义。

不猜测或复用 Medusa container token 的原因：

- 当前项目没有为 payment notification inbox 注册 module/service token。
- 在 route 中猜测 manager、knex、entityManager 或 container key，容易绕过后续 provider / adapter 边界。
- Medusa request scope 的真实 transaction 语义需要单独 discovery 和 mocked unit tests，不能在高风险支付 route 中临场接入。
- 本地 adapter 应该显式注入 driver 和 database URL，方便 smoke 脚本证明连接目标是 disposable DB。

等进入真实 runtime 前，必须另开任务确认生产 module registration、migration lifecycle、transaction scope、审计日志和 rollback 策略。

## SQL 映射

### insertInbox

写入 `payment_notification_inbox`：

```text
id
provider
event_id
event_type
idempotency_key
merchant_order_ref
payment_session_id
provider_transaction_id
provider_refund_id
amount_value
currency
signature_status
raw_payload_digest
processing_status
retry_count
last_error_code
last_error_message
occurred_at
received_at
processed_at
created_at
updated_at
```

不得写入 raw payload 或 signature。

### updateInbox

按 `idempotency_key` 更新：

```text
processing_status
retry_count
last_error_code
last_error_message
processed_at
updated_at
```

返回更新后的完整 row。

如果更新不到 row，抛出 repository not found 类错误，后续由 repository mapper 转成安全响应。

### findInboxByIdempotencyKey

按 `idempotency_key` 查询一条 row。

后续如果真实生产要支持多 provider，应当按 `(provider, idempotency_key)` 查询；本地 mock adapter 可以先遵循当前 repository contract，但文档需要记录这个生产差异。

### insertEventLog

写入 `payment_notification_event_log`：

```text
id
inbox_id
action
actor_type
message
metadata
created_at
```

metadata 只允许 safe metadata：

- idempotency key。
- provider。
- event id。
- signature status。
- processing status。
- error code。
- retry count。

禁止 metadata 写入 raw payload、signature、secret、database URL。

## Error Mapping

adapter 应把本地 DB 错误映射到稳定 code：

```text
23505 -> DB_UNIQUE_CONFLICT
40P01 -> DB_LOCK_TIMEOUT
55P03 -> DB_LOCK_TIMEOUT
08006 -> DB_CONNECTION_INTERRUPTED
ECONNRESET -> DB_CONNECTION_INTERRUPTED
ETIMEDOUT -> DB_CONNECTION_INTERRUPTED
```

不认识的错误不能泄漏 SQL、连接串、密码或 raw payload。

## Unit Tests

下一轮 adapter skeleton 单测至少覆盖：

- production refused。
- local flag missing refused。
- unsafe database name refused。
- remote host refused unless allowRemoteDryRun。
- transaction success order：connect -> begin -> handler -> commit -> release。
- transaction failure order：connect -> begin -> handler throws -> rollback -> release。
- insertInbox SQL 不包含 raw payload / secret 字段。
- duplicate insert error maps to `DB_UNIQUE_CONFLICT`。
- updateInbox returns updated row。
- findInboxByIdempotencyKey returns null when missing。
- insertEventLog serializes metadata as JSONB-safe object。

## Harness

adapter skeleton 可以先进入 unit harness，不接 route：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
```

route accepted / duplicate smoke 等下一轮 route 接入 adapter 后再做。

## PR 拆分

推荐下一步：

1. `mock-webhook-db-client-contract`
   - 新增 local adapter skeleton 和 mocked unit tests。
   - 不接 route。
2. `mock-webhook-db-client-contract-validation`
   - 合并后记录 harness、typecheck、runtime grep、DB 无残留。
3. `mock-webhook-db-backed-route-local-accepted-plan`
   - docs-only，规划 route 如何注入 local adapter 和 smoke accepted/duplicate。
4. `mock-webhook-db-backed-route-local-accepted`
   - route 接 local-only adapter，只在 disposable DB smoke 下可用。

## Go / No-Go

Go：

- adapter skeleton 无新增依赖。
- unit test 完全 mocked。
- production disabled。
- database URL / secret / raw payload 不泄漏。
- 不接 route、不接 workflow。

No-Go：

- 需要真实支付宝/微信支付凭证。
- 需要连接预发或生产 DB。
- 需要注册 migration。
- 需要改 checkout、order、payment、refund、settlement、commission、payout 或 permission。
- 需要新增依赖。
