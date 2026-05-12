# Refund State Mutation Runtime Attempt Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 workflow attempt persistence schema / retry / replay 边界，不实现 DB write、不新增 migration、不注册 route / job / subscriber、不执行生产 workflow、不写 production refund success state。

Runtime attempt 的目标是让未来任何 workflow execution 都有可审计、可幂等、可重试、可人工复核的持久化证据。当前阶段只定义设计约束，不写入数据库。

## Required Attempt Record

未来 production workflow attempt record 必须至少包含：

- `attempt_id`：平台内部 attempt id。
- `workflow_idempotency_key`：唯一且可重放。
- `platform_refund_id`。
- `provider_name`。
- `provider_refund_reference`。
- `merchant_order_reference`。
- `refund_request_reference`。
- `target_state`。
- `amount_minor` and `currency`。
- `provider_evidence_digest` and `digest_version`。
- `approval_persistence_idempotency_key`。
- `audit_persistence_idempotency_key`。
- `terminal_conflict_decision_key`。
- `runtime_feature_flag_version`。
- `environment`。
- `status`。
- `attempt_number`。
- `started_at`、`finished_at`、`next_retry_at`。
- `failure_code`、`failure_reason_redacted`。
- `operator_visible_reason`。

禁止把 raw provider payload、真实密钥、DB URL、完整手机号、完整地址或银行卡/身份信息写入 attempt metadata。

## Attempt Status Model

建议第一版 status：

```text
planned
pending_audit
pending_terminal_conflict_check
pending_workflow
processing
succeeded
retryable_failed
non_retryable_failed
terminal_conflict
manual_review_required
blocked
rolled_back
```

No-Go transitions:

- `succeeded` -> any executable state。
- `terminal_conflict` -> `pending_workflow`。
- `manual_review_required` -> executable state without new persisted approval。
- `blocked` -> executable state without a new Go decision。
- `rolled_back` -> `succeeded`。

Retry 只能从 `retryable_failed` 回到 `pending_workflow`，且必须增加 attempt number、保留 previous failure evidence。

## Idempotency And Replay

- 同 `workflow_idempotency_key` + same evidence digest + `succeeded`：返回 duplicate no-op。
- 同 `workflow_idempotency_key` + different evidence digest：阻断为 digest conflict。
- 不同 key + same provider refund reference + terminal state：进入 terminal conflict review。
- 同 key + `processing` 未超时：返回 in-progress replay，不创建新 attempt。
- 同 key + `retryable_failed` 且 retry window 未到：返回 wait / retry-later。
- audit persistence 缺失：fail closed。
- terminal conflict contract blocked：fail closed。

## Schema Planning Notes

未来 migration 必须单独 PR，并至少包含：

- unique index on `workflow_idempotency_key`。
- index on `platform_refund_id`。
- index on `provider_name, provider_refund_reference`。
- status check constraint。
- positive amount check。
- CNY-only constraint for first China-local scope。
- metadata redaction check or write-path sanitizer。
- immutable append-only attempt event log。

当前不新增 migration，因为真实生产写入仍 No-Go。

## Runtime Boundaries

- provider route 不创建 workflow attempt。
- provider query job 不创建 executable attempt。
- attempt creation 必须在 approval persistence、audit persistence 和 terminal conflict check 之后。
- workflow execution 仍需单独 Go / No-Go。
- settlement、commission、payout 是后续独立 gate。
- fulfillment、logistics 是后续独立 gate。
- permission、ownership、reviewer separation 必须在 runtime 重新校验。

## Proposed Next PR Sequence

1. `refund-state-mutation-runtime-attempt-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-runtime-attempt-contract`：新增不可执行 attempt decision 纯函数合同和 focused tests。
3. `refund-state-mutation-runtime-attempt-contract-validation`：验证合同仍不可执行。
4. `refund-state-mutation-production-execution-go-no-go`：重新评估生产执行前置条件。

## Verification Plan

本计划 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

本计划 PR 已验证：

```text
git diff --check passed
No apps/** or packages/** runtime diff
```

复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 未新增 route、job、subscriber、migration、DB、SDK、provider request / query、workflow execution、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
