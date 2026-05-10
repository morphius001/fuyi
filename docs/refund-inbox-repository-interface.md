# Refund Inbox Repository Interface

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款 inbox repository interface-only 合同和纯 error classifier。

结论：通过。`RefundInboxRepositoryContract` 只定义退款通知 inbox / audit log repository 的方法形状和错误分类；不实现 DB adapter、不接 route、不注册 migration、不调用 provider refund API 或 workflow，不写退款状态。

## 修改范围

- `packages/api/src/modules/china-payment-notification/refund-inbox-repository-contract.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-inbox-repository-contract.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-inbox-repository-interface.md`
- `docs/refund-inbox-repository-interface.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Contract 内容

新增：

- `RefundInboxRecord`
- `ReceiveRefundNotificationInput`
- `RefundInboxReceiveResult`
- `AppendRefundInboxEventInput`
- `RefundInboxRepositoryContract`
- `RefundInboxRepositoryErrorCode`
- `RefundInboxRepositoryErrorKind`
- `refundInboxRepositoryErrorKinds`
- `classifyRefundInboxRepositoryError()`

Receive result 只允许：

- `received`
- `duplicate_same_digest`
- `duplicate_digest_conflict`

所有 receive result 类型都标记：

```text
fixtureOnly: true
executable: false
```

## Error 分类

| Code | Kind |
| --- | --- |
| `REFUND_DB_UNIQUE_CONFLICT` | `duplicate` |
| `REFUND_DB_DIGEST_CONFLICT` | `manual_review` |
| `REFUND_DB_PROVIDER_REFUND_CONFLICT` | `manual_review` |
| `REFUND_DB_LOCK_TIMEOUT` | `retryable` |
| `REFUND_DB_CONNECTION_INTERRUPTED` | `retryable` |
| `REFUND_DB_EVENT_LOG_WRITE_FAILED` | `retryable` |
| `REFUND_DB_INVALID_STATE_TRANSITION` | `terminal` |
| `REFUND_DB_METADATA_REDACTION_FAILED` | `terminal` |

未知错误返回 `unknown`，不能默认进入 processed / success。

## Safety Boundary

本轮没有：

- DB adapter。
- API route。
- migration 注册。
- Medusa workflow execution。
- provider refund API 或 SDK。
- provider refund request sender。
- refund state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics runtime change。

特别说明：

- repository interface 不是退款成功事实表。
- `duplicate_digest_conflict` 只能代表 manual review 语义，不代表退款失败或成功。
- `markProcessedForAuditOnly()` 只能表示 audit-only 处理，不代表业务退款完成。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-inbox-repository-contract.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 6 passed, 6 total
```

API typecheck：

```text
bunx tsc --noEmit -p tsconfig.json
PASS
```

Payment notification harness：

```text
Test Suites: 38 passed, 38 total
Tests: 273 passed, 273 total
PASS payment notification idempotency harness completed.
Disposable DB dry-run row count: 2|9
```

Runtime grep：

```text
packages/api/medusa-config.ts: no match for china-payment-notification
New high-risk refund keyword matches in this PR are limited to focused test negative assertions.
Existing module denylist matches do not indicate runtime execution.
No provider refund API, workflow command execution, refund state mutation, route, DB adapter, or runtime registration was added.
```

Diff check：

```text
git diff --check
PASS
```

## 下一步

建议继续：

1. `refund-inbox-repository-db-adapter-skeleton-plan`
   - docs-only 规划 mocked DB adapter skeleton。
   - 不写 DB adapter，不注册 runtime，不接 route。

2. `refund-inbox-repository-db-adapter-skeleton`
   - 仅在计划通过后做 mocked DB adapter skeleton。
   - 不注册 runtime，不接 route，不连接真实 DB。

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
