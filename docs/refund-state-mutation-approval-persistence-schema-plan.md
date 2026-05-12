# Refund State Mutation Approval Persistence Schema Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 approval persistence schema / uniqueness / reviewer separation / replay read model，不新增 migration、不连接生产 DB、不写 approval record、不执行生产 workflow、不写 production refund success state。

## Required Tables

未来 migration 应拆独立 PR，至少包含：

1. `china_refund_state_mutation_approval`
2. `china_refund_state_mutation_approval_event`

第一版 approval 主表建议字段：

- `id`
- `approval_idempotency_key`
- `platform_refund_id`
- `provider_name`
- `provider_refund_reference`
- `merchant_order_reference`
- `refund_request_reference`
- `target_state`
- `target_state_audit_label`
- `amount_minor`
- `currency`
- `request_actor_id`
- `request_actor_type`
- `reviewer_actor_id`
- `reviewer_role`
- `permission_evidence_id`
- `ownership_evidence_id`
- `readiness_decision_key`
- `shadow_command_key`
- `runtime_adapter_decision_key`
- `feature_flag_snapshot_key`
- `status`
- `decision_reason_redacted`
- `created_at`
- `decided_at`
- `expires_at`

事件表建议字段：

- `id`
- `approval_id`
- `action`
- `actor_id`
- `actor_type`
- `metadata_redacted`
- `created_at`

## Constraints

必须具备：

- unique `approval_idempotency_key`。
- positive `amount_minor`。
- first-phase `currency='CNY'` check。
- `reviewer_actor_id != request_actor_id`。
- allowed reviewer role check。
- allowed status check。
- append-only event log。
- redacted metadata check or write-path sanitizer。
- index on `platform_refund_id`。
- index on `provider_name, provider_refund_reference`。

## Approval Rules

- vendor actor 不能批准平台退款状态写入。
- reviewer 与 request actor 不能相同。
- permission evidence 必须来自服务端可信来源。
- ownership evidence 必须来自服务端可信来源。
- approval 必须引用 readiness / shadow command / runtime adapter / feature flag snapshot。
- expired approval 不能进入 workflow attempt。
- rejected approval 只能进入 manual review / replay，不得执行 workflow。

## Replay Read Model

操作员至少要能看到：

- approval status and reviewer。
- source provider / refund references。
- target state audit label。
- permission / ownership evidence。
- linked audit write / terminal conflict / runtime attempt。
- duplicate approval replay result。
- rejection / expiry reason。

## Proposed Next PR Sequence

1. `refund-state-mutation-approval-persistence-schema-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-approval-persistence-migration-plan`：规划 migration skeleton / local disposable DB rehearsal。
3. `refund-state-mutation-approval-persistence-migration-skeleton`：新增未注册 migration skeleton 和 dry-run 脚本。
4. `refund-state-mutation-approval-persistence-repository-contract`：新增 disabled repository contract，不接生产 DB。

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
