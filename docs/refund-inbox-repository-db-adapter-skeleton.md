# Refund Inbox Repository DB Adapter Skeleton

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款 inbox repository mocked DB adapter skeleton 和 focused tests。

结论：通过。`DbRefundInboxRepository` 只实现 `RefundInboxRepositoryContract` 的 mocked DB adapter skeleton，依赖外部注入 transaction / mock DB client；不创建真实 DB 连接、不读取 env、不接 route、不注册 migration、不调用 provider refund API 或 workflow，不写退款成功 / 失败业务状态。

## 修改范围

- `packages/api/src/modules/china-payment-notification/refund-db-inbox-repository.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-inbox-repository-db-adapter-skeleton.md`
- `docs/refund-inbox-repository-db-adapter-skeleton.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Skeleton 内容

新增：

- `RefundInboxDbRow`
- `RefundInboxDbEventLogRow`
- `RefundInboxDbTransaction`
- `RefundInboxDbClient`
- `DbRefundInboxRepository`

实现方法：

- `receiveNotification()`
- `appendEvent()`
- `markSignatureVerified()`
- `markNormalized()`
- `markGuardChecked()`
- `markManualReviewRequired()`
- `markRuntimeMutationBlocked()`
- `markProcessedForAuditOnly()`
- `markTerminalRejected()`
- `getByIdempotencyKey()`
- `getByProviderRefundId()`

## Covered Cases

Focused tests 覆盖：

- 首次接收退款通知时插入 inbox + `refund_notification_received` event。
- duplicate same digest 返回 `duplicate_same_digest`，并写 `refund_notification_duplicate_seen`。
- duplicate digest conflict 返回 `duplicate_digest_conflict`，并写 `refund_notification_digest_conflict`。
- signature verified / normalized / manual review / runtime blocked / audit-only 状态更新。
- guard checked 和 terminal rejected 只写 blocked / rejected inbox 状态，不写退款业务状态。
- provider refund id 查询和 idempotency key 查询。
- event log 写失败不被吞掉。
- metadata 顶层和嵌套的 raw payload、private key、workflow command、完整手机号被清洗，同时保留安全 audit note。
- metadata denylist 使用 normalized-key 匹配，覆盖 snake_case 和大小写变体。

## Safety Boundary

本轮没有：

- 真实 DB connection。
- env 读取。
- Medusa module registration。
- API route。
- migration 注册。
- provider refund API 或 SDK。
- provider refund request sender。
- payment / refund workflow execution。
- order / payment / refund state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics runtime change。

特别说明：

- `markProcessedForAuditOnly()` 只表示 audit-only 处理，不代表退款完成。
- `markTerminalRejected()` 只表示 inbox terminal rejected，不代表业务退款失败状态。
- duplicate digest conflict 只进入 manual review 语义。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 7 passed, 7 total
```

API typecheck：

```text
bunx tsc --noEmit -p tsconfig.json
PASS
```

Payment notification harness：

```text
Test Suites: 39 passed, 39 total
Tests: 280 passed, 280 total
PASS payment notification idempotency harness completed.
Disposable DB dry-run row count: 2|9
```

Runtime grep：

```text
packages/api/medusa-config.ts: no match for china-payment-notification
High-risk refund keywords in the new adapter only appear in metadata denylist and focused test negative assertions.
No provider refund API, workflow command execution, refund state mutation, route, real DB connection, env read, or runtime registration was added.
```

Diff check：

```text
git diff --check
PASS
```

## 下一步

建议继续：

1. `refund-inbox-repository-disposable-db-dry-run-plan`
   - docs-only 规划 local disposable DB dry-run。
   - 不连接预发或生产。

2. `refund-inbox-repository-disposable-db-dry-run`
   - local disposable DB only。
   - 验证 unique conflict、digest conflict、transaction rollback 和 event log consistency。

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
