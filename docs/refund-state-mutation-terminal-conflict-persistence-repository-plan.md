# Refund State Mutation Terminal Conflict Persistence Repository Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 terminal conflict evidence / lock snapshot 的 repository contract、schema 和 replay-safe read model，不实现 DB write、不新增 migration、不注册 route / job / subscriber、不执行生产 workflow、不写 production refund success state。

runtime attempt persistence 已经覆盖 approval / audit / feature flag snapshot 的只读引用；在进入任何真实执行链路前，还必须补齐 terminal conflict 自身的持久化边界，确保终态冲突判断可追溯、可复核、可 fail closed。

## Required Repository Inputs

未来 terminal conflict persistence repository 至少需要接收以下去敏输入：

- `terminal_marker_key`
- `terminal_marker_version`
- `current_refund_state`
- `incoming_target_state`
- `provider_evidence_digest`
- `provider_evidence_digest_version`
- `approval_persistence_key`
- `audit_persistence_key`
- `runtime_attempt_persistence_key`
- `feature_flag_snapshot_key`
- `state_owner_evidence_key`
- `actor_reference`
- `reviewer_reference`
- `conflict_decision`
- `conflict_code`
- `conflict_detected_at`

禁止输入：

- raw provider payload
- 未去敏的 operator note
- 前端 return URL 状态
- metadata 中的 `refundSuccessState`、`stateMutationAllowed`、`productionWriteAllowed`
- 可被 request body 覆盖的 current / target state

## Required Repository Records

建议拆分两类只读优先的记录：

1. **terminal conflict snapshot record**
   - 保存当前平台状态、incoming target、digest、decision、version、actor refs。
   - 采用 append-only 或 immutable-upsert 语义，禁止静默覆盖旧冲突判断。

2. **terminal conflict event log**
   - 保存 `duplicate_noop`、`terminal_digest_conflict`、`terminal_state_conflict`、`lock_unavailable`、`owner_evidence_missing`、`manual_review_enqueued` 等动作。
   - 每条 event 必须包含 conflict snapshot reference、event version、redacted metadata。

No-Go：

- 用单个 mutable row 覆盖历史冲突证据。
- 仅保存最新 digest，不保留冲突演进。
- event log 缺少 approval / audit / runtime attempt cross-reference。

## Required Uniqueness And Replay Rules

- `(terminal_marker_key, provider_evidence_digest, incoming_target_state)` 需要有 replay-safe 唯一规则。
- duplicate notification / replay 命中相同 terminal marker + digest 时，只能返回 operator-visible duplicate result，不能继续 workflow。
- digest 相同但 target state 不同，必须强制 `terminal_state_conflict`。
- target state 相同但 digest 不同，必须强制 `terminal_digest_conflict`。
- lock acquisition 失败或 terminal marker 缺失时，必须 fail closed，并持久化 blocked event。

## Required Read Models

未来 operator review 至少需要三类查询能力：

1. 按 refund / payment collection / provider refund reference 查询最新 terminal conflict snapshot。
2. 按 approval / audit / runtime attempt key 反查关联冲突事件。
3. 按 conflict code / terminal state / detected time 查询待人工复核列表。

查询结果必须包含：

- current platform state
- incoming target state
- terminal marker version
- provider evidence digest and version
- approval / audit / runtime attempt references
- conflict decision and block codes
- first detected / latest replay timestamps

## Required Failure Behavior

- repository 不可用时，terminal conflict decision 必须 fail closed。
- event log 写入失败时，不能继续 workflow execution。
- snapshot record 写入失败时，不能降级为内存判断。
- replay query 超时时，必须返回 operator-visible blocked reason。

## Proposed Next PR Sequence

1. `refund-state-mutation-terminal-conflict-persistence-repository-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-terminal-conflict-persistence-repository-contract`：新增 disabled / non-executable repository contract、record/event 类型和 focused tests。
3. `refund-state-mutation-terminal-conflict-persistence-repository-contract-validation`：验证合同仍不可执行。
4. `refund-state-mutation-preprod-dry-run-plan`：继续收束 disposable / preprod rehearsal 所需的只读证据链。

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
