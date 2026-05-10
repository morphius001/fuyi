# Refund Inbox Repository Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

规划退款通知 inbox DB-backed repository 的 owner、事务边界、幂等冲突、event log 一致性和后续 PR 顺序。

结论：下一步可以进入 repository contract / interface，但仍不能实现真实 DB runtime、route、provider refund API、workflow 或退款状态写入。repository 只能作为 refund notification inbox / audit log 的持久化 owner，不是退款成功事实表。

## 当前前置状态

已具备：

- `refund-amount-guard-contract`。
- `refund-request-idempotency-contract`。
- `refund-notification-verifier-contract`。
- `refund-notification-normalizer-contract`。
- `refund-manual-review-audit-contract`。
- `refund-audit-event-allowlist-contract`。
- `refund-inbox-state-transition-contract`。
- `payment_notification_inbox` migration skeleton 预留 `refund.succeeded` / `refund.failed` event type 和 `provider_refund_id` 字段。

仍未具备：

- refund-specific repository interface。
- DB-backed refund repository runtime。
- production migration registration。
- refund webhook route。
- provider refund request sender。
- refund workflow execution。
- settlement / commission / payout adjustment。

## Repository Owner Boundary

Refund inbox repository owns：

- receive verified / normalized refund notification input。
- store idempotency key、provider、event id、event type、providerRefundId、merchant order ref、payment session id、amount、currency、signature status、raw payload digest。
- detect duplicate replay。
- detect digest conflict。
- append event log。
- map repository / DB errors to retryable、duplicate、terminal、manual_review。
- keep sanitized metadata only。

Refund inbox repository does not own：

- provider signature verification。
- provider refund request sending。
- amount / ownership / RBAC guard decisions。
- manual review decision finality。
- order / payment / refund state mutation。
- settlement / commission / payout adjustment。
- permission policy。
- fulfillment / logistics state。

## Proposed Method Contract

后续 interface 建议：

```ts
type RefundInboxReceiveResult =
  | { status: "received"; record: RefundInboxRecord }
  | { status: "duplicate_same_digest"; record: RefundInboxRecord }
  | { status: "duplicate_digest_conflict"; record: RefundInboxRecord };

interface RefundInboxRepositoryContract {
  receiveNotification(input: ReceiveRefundNotificationInput): Promise<RefundInboxReceiveResult>;
  appendEvent(input: AppendRefundInboxEventInput): Promise<void>;
  markSignatureVerified(idempotencyKey: string): Promise<RefundInboxRecord>;
  markNormalized(idempotencyKey: string): Promise<RefundInboxRecord>;
  markGuardChecked(input: MarkRefundGuardCheckedInput): Promise<RefundInboxRecord>;
  markManualReviewRequired(input: MarkRefundManualReviewRequiredInput): Promise<RefundInboxRecord>;
  markRuntimeMutationBlocked(input: MarkRefundRuntimeMutationBlockedInput): Promise<RefundInboxRecord>;
  markProcessedForAuditOnly(idempotencyKey: string): Promise<RefundInboxRecord>;
  markTerminalRejected(input: MarkRefundTerminalRejectedInput): Promise<RefundInboxRecord>;
  getByIdempotencyKey(idempotencyKey: string): Promise<RefundInboxRecord | null>;
  getByProviderRefundId(provider: string, providerRefundId: string): Promise<RefundInboxRecord[]>;
}
```

所有方法必须只返回 repository / inbox 状态，不返回可执行 provider request、workflow command 或 refund state mutation。

## Transaction Boundary

同一事务内必须完成：

- insert / update refund inbox row。
- append event log。
- persist sanitized metadata digest / summary。

receive notification 时：

1. insert inbox row with `received`。
2. insert `refund_notification_received` event。
3. unique conflict 时读取已有 row。
4. 如果 digest 相同，append `refund_notification_duplicate_seen`。
5. 如果 digest 不同，append `refund_notification_digest_conflict` 并转入 manual review。

guard / manual review transition 时：

- update inbox state。
- append corresponding audit action。
- forbid partial update without event log。

禁止：

- inbox row update 成功但 event log 失败。
- event log 成功但 inbox state 未更新。
- duplicate conflict 被吞掉后继续推进 state owner。
- repository 内调用 provider API 或 workflow。

## Idempotency And Conflict Rules

建议唯一约束：

```text
unique(provider, idempotency_key)
```

建议 secondary index：

- `(provider, event_id)`
- `(provider, provider_refund_id)`
- `(merchant_order_ref)`
- `(payment_session_id)`
- `(processing_status, received_at)`
- `(raw_payload_digest)`

冲突处理：

| 场景 | Repository result | 后续 |
| --- | --- | --- |
| 新 idempotency key | `received` | 继续 verifier / normalizer / guard |
| 相同 key + 相同 digest | `duplicate_same_digest` | no-op + audit |
| 相同 key + 不同 digest | `duplicate_digest_conflict` | manual review + runtime blocked |
| providerRefundId 指向多个 local request | `manual_review_required` | 阻断 runtime |
| provider event id 缺失 | `received` with risk flag | 后续 guard / review |
| DB unique conflict readback 失败 | retryable error | 不改变状态 |

## Event Log Consistency

允许的 refund audit actions 只能来自 allowlist：

- `refund_notification_received`
- `refund_notification_verified`
- `refund_notification_normalized`
- `refund_notification_duplicate_seen`
- `refund_notification_digest_conflict`
- `refund_guard_manual_review_required`
- `refund_runtime_mutation_blocked`
- `refund_settlement_blocked`

commission / payout block 当前不新增可执行 action，只能作为 blocked metadata、manual review reason 或 settlement blocked 的上下文。

repository 层不得写：

- `refund_state_mutated`
- `refund_workflow_executed`
- `provider_refund_request_sent`
- `settlement_adjusted`
- `commission_adjusted`
- `payout_adjusted`

## Error Mapping

| Code | Kind | 说明 |
| --- | --- | --- |
| `REFUND_DB_UNIQUE_CONFLICT` | duplicate | 幂等唯一约束命中 |
| `REFUND_DB_DIGEST_CONFLICT` | manual_review | 同 key 不同 digest |
| `REFUND_DB_PROVIDER_REFUND_CONFLICT` | manual_review | providerRefundId 指向冲突 |
| `REFUND_DB_LOCK_TIMEOUT` | retryable | 锁等待超时 |
| `REFUND_DB_CONNECTION_INTERRUPTED` | retryable | 连接中断 |
| `REFUND_DB_EVENT_LOG_WRITE_FAILED` | retryable | event log 同事务失败 |
| `REFUND_DB_INVALID_STATE_TRANSITION` | terminal | 非法状态流转 |
| `REFUND_DB_METADATA_REDACTION_FAILED` | terminal | metadata 脱敏失败 |

未知错误必须返回 `unknown` 或 retry-safe failure，不能默认进入 processed / success。

## Metadata Redaction

允许：

- provider。
- event id。
- idempotency key。
- providerRefundId。
- merchant order ref。
- payment session id。
- amount minor / currency。
- raw payload digest。
- decision type。
- block code / risk flags。
- retryable。
- sanitized reason。

禁止：

- raw provider payload。
- complete signature。
- private key / certificate / APIv3 key / app secret。
- provider SDK request object。
- workflow command / workflow execution。
- refund state mutation payload。
- full phone、identity number、bank card、full address。

metadata 必须沿用 `refund-inbox-state-transition-contract` 的顶层和嵌套 denylist 思路。

## Manual Review And Settlement Block

repository 一旦检测到以下情况，必须只写 manual review / blocked 状态：

- duplicate digest conflict。
- providerRefundId conflict。
- amount / currency mismatch。
- missing local request context。
- seller / market ownership mismatch。
- settlement batch locked。
- payout irreversible。
- reconciliation mismatch。

repository 不得自行判定 manual review 通过，也不得解除 settlement / commission / payout block。

## 后续 PR 顺序

1. `refund-inbox-repository-interface`
   - interface-only / types / pure error classifier。
   - 不连接 DB，不接 route。

2. `refund-inbox-repository-db-adapter-skeleton-plan`
   - docs-only 规划 mocked DB adapter skeleton。
   - 不写 DB adapter，不注册 runtime，不接 route。

3. `refund-inbox-repository-db-adapter-skeleton`
   - mocked DB adapter skeleton。
   - 不注册 runtime，不接 route。

4. `refund-inbox-repository-disposable-db-dry-run`
   - local disposable DB only。
   - 验证 unique conflict、digest conflict、event log transaction 和 rollback。

5. `refund-inbox-route-plan`
   - docs-only route gate plan。
   - 默认 disabled，mock-only / sandbox-only。

## Go / No-Go

Go：

- interface-only。
- docs-only DB adapter plan。
- local disposable DB dry-run。
- focused tests with fake data。

No-Go：

- 不新增真实 refund route。
- 不注册 migration 到 production runtime。
- 不接支付宝 / 微信支付 refund API。
- 不发送 provider refund request。
- 不执行 workflow。
- 不写退款成功 / 失败业务状态。
- 不改变 settlement、commission、payout、permission、fulfillment、logistics。

## 验证记录

本轮已执行：

```text
git diff --check
git diff --name-only
git ls-files --others --exclude-standard
```

并安排子智能体只读复核：

- diff 是否 docs-only。
- repository plan 是否保持 owner 边界。
- 是否没有把 inbox repository 写成退款成功事实表。
- 是否禁止 route、DB runtime、migration 注册、provider API、workflow 和交易 / 结算 / 履约 runtime。
