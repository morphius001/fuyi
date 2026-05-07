# Mock Webhook DB Client Contract

更新时间：2026-05-08 00:58 Asia/Shanghai

## 完成内容

新增 local disposable Postgres adapter skeleton：

```text
packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts
```

它导出：

```text
createLocalPaymentNotificationPostgresClient(input)
```

当前 adapter 只把注入式 driver 包装成 `PaymentNotificationDbClient`，供后续 local disposable DB smoke 使用。

## 安全边界

本轮没有：

- 修改 route。
- 连接真实数据库。
- 新增依赖。
- 注册 migration。
- 修改 `packages/api/medusa-config.ts`。
- 调用 payment workflow。
- 修改支付、订单、退款、对账、结算、佣金、权限逻辑。

adapter 创建时会拒绝：

- `NODE_ENV=production`。
- local DB flag 未启用。
- database URL 缺失。
- database name 不匹配 dry-run 前缀。
- 非本地 host。

## Adapter Contract

adapter 使用注入式 driver：

```text
driver.connect(databaseUrl) -> connection
connection.query(sql, params)
connection.release()
```

`transaction(handler)` 顺序：

```text
connect -> begin -> handler -> commit -> release
connect -> begin -> handler throws -> rollback -> release
```

handler 内提供：

```text
insertInbox
updateInbox
findInboxByIdempotencyKey
insertEventLog
```

## SQL 行为

`insertInbox` 使用 `ON CONFLICT (provider, idempotency_key) DO NOTHING RETURNING id`，避免 unique violation 直接让 transaction abort。没有返回 row 时抛出稳定 `DB_UNIQUE_CONFLICT`。

`updateInbox` 按 `idempotency_key` 更新状态、retry、错误和处理时间，返回更新后的 row。

`findInboxByIdempotencyKey` 当前按 `idempotency_key` 查询；生产化前需要再评审是否改成 `(provider, idempotency_key)`。

`insertEventLog` 只允许 metadata 写入明确白名单字段：`idempotencyKey`、`provider`、`eventId`、`signatureStatus`、`processingStatus`、`errorCode`、`retryCount`。其它字段，包括大小写变体、嵌套对象、raw payload、signature、secret、token、authorization、database URL 和 password 都不会落库。

## Error Mapping

当前稳定映射：

```text
23505 / DB_UNIQUE_CONFLICT -> DB_UNIQUE_CONFLICT
40P01 / 55P03 -> DB_LOCK_TIMEOUT
08006 / ECONNRESET / ETIMEDOUT -> DB_CONNECTION_INTERRUPTED
unknown -> DB_UNKNOWN_ERROR
```

错误对象不会携带 database URL、secret 或 raw payload。

## 单测覆盖

新增：

```text
packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
```

覆盖：

- production refused。
- local flag missing refused。
- unsafe database name refused。
- remote host always refused。
- transaction success commit/release。
- transaction failure rollback/release。
- insertInbox SQL 不包含 raw payload / secret 字段。
- duplicate insert maps to `DB_UNIQUE_CONFLICT`。
- updateInbox returns mapped row。
- findInboxByIdempotencyKey missing returns null。
- insertEventLog only writes allowlisted metadata and drops sensitive variants。

## 验证

已通过：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
```

Harness 结果：

```text
16 test suites passed
105 tests passed
disposable inbox dry-run row count: 2|9
```

## 后续

下一步建议：

```text
mock-webhook-db-client-contract-validation
```

先做合并后验证记录，再进入 `mock-webhook-db-backed-route-local-accepted-plan`。

route 接 adapter、accepted / duplicate smoke、workflow execution、支付宝、微信支付、退款、对账、结算和商家结算仍然保持后续串行任务。
