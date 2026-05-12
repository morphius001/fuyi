# Refund State Mutation Runtime Attempt Persistence Repository Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本轮只规划 runtime attempt persistence repository 的 contract / schema / replay / retry / append-only event log 边界，不实现 repository、不新增 migration、不连接 production DB、不执行 workflow、不写 production refund success state。

## Repository Scope

未来 `runtime attempt persistence repository` 只负责持久化 disabled / non-executable runtime attempt 证据，不负责：

- 创建 provider request
- 执行 workflow
- 写平台退款成功状态
- 触发财务、权限、履约或物流副作用

建议后续 contract 至少拆出：

1. `RefundStateMutationRuntimeAttemptPersistenceRecord`
2. `RefundStateMutationRuntimeAttemptPersistenceEventRecord`
3. `RefundStateMutationRuntimeAttemptPersistenceRepositoryContract`
4. `mapRuntimeAttemptToRepositoryIntent()`

## Required Record Fields

repository record 第一版建议至少包含：

- `runtime_attempt_persistence_id`
- `runtime_attempt_idempotency_key`
- `workflow_idempotency_key`
- `platform_refund_id`
- `provider_name`
- `provider_refund_reference`
- `merchant_order_reference`
- `refund_request_reference`
- `target_state`
- `target_state_audit_label`
- `attempt_status`
- `attempt_number`
- `provider_evidence_digest`
- `digest_version`
- `approval_persistence_idempotency_key`
- `audit_persistence_idempotency_key`
- `terminal_conflict_decision_key`
- `feature_flag_snapshot_key`
- `environment`
- `failure_code`
- `failure_reason_redacted`
- `operator_visible_reason`
- `created_at`
- `started_at`
- `finished_at`
- `next_retry_at`

## Repository Event Log

append-only event log 第一版建议动作：

- `attempt_persistence_requested`
- `attempt_persistence_recorded`
- `attempt_duplicate_noop_recorded`
- `attempt_manual_review_recorded`
- `attempt_retry_scheduled`
- `attempt_blocked`
- `manual_review_handoff`

事件 metadata 仍必须 redacted，不得包含：

- raw provider payload
- provider secret / certificate / API key
- DB URL
- workflow command body
- 完整手机号 / 地址 / 身份证 / 银行卡
- settlement / commission / payout mutation payload

## Replay And Retry Boundaries

repository 层必须能表达：

- same idempotency key + same digest => duplicate no-op
- same idempotency key + different digest => digest conflict / manual review
- `processing` / `planned` in-progress replay => return existing intent，不创建新 attempt
- `retryable_failed` + retry window 未到 => retry-later
- `retryable_failed` + retry window 已到 => 新 attempt number，但仍只记录 disabled intent
- `manual_review_required` / `terminal_conflict` / `blocked` => fail closed，等待新 persisted approval / terminal conflict decision

## Schema Notes

后续 migration 如需落地，必须单独 PR，至少包含：

- unique index on `runtime_attempt_idempotency_key`
- index on `workflow_idempotency_key`
- index on `platform_refund_id`
- index on `provider_name, provider_refund_reference`
- attempt status check
- positive amount check
- CNY-only constraint for first China-local scope
- metadata redaction check or write-path sanitizer
- append-only event log foreign key and action allowlist

当前阶段不新增 migration，因为真实生产写入仍 No-Go。

## Ordering Constraints

runtime attempt persistence repository 必须排在以下 gate 之后：

1. approval persistence
2. audit persistence
3. terminal conflict
4. production feature flag decision

仍必须排在以下执行前：

1. workflow execution
2. refund success state mutation
3. settlement / commission / payout
4. permission / fulfillment / logistics side effects

## Proposed Next PR Sequence

1. `refund-state-mutation-runtime-attempt-persistence-repository-validation`
   只验证本计划文件范围和 No-Go。
2. `refund-state-mutation-runtime-attempt-persistence-repository-contract`
   新增 disabled / non-executable repository contract 和 focused tests。
3. `refund-state-mutation-runtime-attempt-persistence-repository-contract-validation`
   只验证 contract 仍未接入 runtime。
4. `refund-state-mutation-runtime-attempt-persistence-schema-plan`
   如仍需要，再单独规划 migration / schema / local dry-run。

## Verification

本计划 PR 运行：

```bash
git diff --check
git status --short --branch
```

复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `packages/api/**` 或 `apps/**` runtime。
- 未新增 migration、repository、route、job、subscriber、workflow execution。
- 未写 production refund success state。
- 未触发 settlement、commission、payout、permission、fulfillment 或 logistics。
