# Refund State Mutation Runtime Idempotency Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 production runtime idempotency / replay / terminal conflict evidence，不实现 DB write、不新增 migration、不注册 route / job / subscriber、不执行生产 workflow、不写 production refund success state。

Runtime idempotency 的第一目标不是“允许写状态”，而是为未来 Go / No-Go 决策定义必须存在的防重、重放和终态冲突证据。当前阶段仍只能形成设计约束和后续 PR 拆分。

## Required Evidence Before Runtime Mutation

未来任何 production refund state mutation 前，必须同时具备：

1. **workflow execution idempotency key**：由 provider evidence、approval persistence、audit persistence 和 target state 共同派生，重复请求必须命中同一 key。
2. **provider evidence replay key**：provider refund notification / query snapshot 必须可去敏回放，且不能由 route / query job 直接绕过 state owner。
3. **approval / audit / workflow cross-reference**：approval record、append-only audit log、workflow attempt 必须可双向追踪。
4. **execution attempt record**：每次 workflow attempt 必须记录 status、attempt number、startedAt、finishedAt、failureCode、retryAfter 和 operator-visible reason。
5. **duplicate no-op rule**：相同 idempotency key 已成功或已终态阻断时，后续请求只能返回 no-op / replay result，不能再次写 refund success state。
6. **terminal conflict lock**：平台退款记录进入 terminal state 后，任何不同 target state 或不同 evidence digest 的请求必须阻断并进入人工复核。
7. **retry-safe state machine**：retry 只能从 retryable failure 回到 pending / processing，不得从 blocked / terminal conflict 回到 executable。
8. **operator replay view**：平台操作员必须能看到 replay source、previous attempt、current decision 和人工处理入口。

## Proposed Attempt State Machine

```text
planned -> pending_audit -> pending_workflow -> processing
processing -> succeeded
processing -> retryable_failed -> pending_workflow
processing -> non_retryable_failed
processing -> terminal_conflict
processing -> manual_review_required
```

No-Go transitions:

- `succeeded` -> any mutation state。
- `terminal_conflict` -> `pending_workflow`。
- `manual_review_required` -> executable state without a new persisted approval。
- `non_retryable_failed` -> retry without operator decision。

## Idempotency Key Inputs

Future idempotency key 必须至少包含：

- provider name and provider refund reference。
- merchant order reference and refund request reference。
- normalized amount and currency。
- provider evidence digest。
- approval persistence idempotency key。
- audit persistence idempotency key。
- target state audit label。
- environment and runtime feature flag version。

禁止仅使用：

- 前端 request id。
- provider payload 原文。
- operator note。
- timestamp-only key。
- metadata 中可被调用方覆盖的字段。

## Replay And Conflict Rules

- 同 key / 同 evidence digest / 已成功：返回 duplicate no-op，不再次执行 workflow。
- 同 key / 不同 evidence digest：阻断为 `idempotency_digest_conflict`，进入人工复核。
- 不同 key / 同 provider refund reference / target state 相同：返回 replay review，不自动执行。
- 不同 key / 同 provider refund reference / target state 不同：阻断为 `terminal_state_conflict`。
- audit write 缺失或失败：fail closed，不允许进入 workflow execution。
- approval persistence 缺失或 reviewer / permission evidence 不可信：fail closed。

## Runtime Boundaries

未来 runtime adapter 仍必须遵守：

- provider route 只负责 inbox / evidence，不是 refund state owner。
- provider query job 只产生 snapshot / reconciliation evidence，不直接执行 workflow。
- operator approval persistence 和 audit persistence 成功后才允许规划 workflow attempt。
- settlement、commission、payout 是后续独立 gate。
- fulfillment、logistics 是后续独立 gate。
- permission、ownership、reviewer separation 必须由服务端可信来源重新校验，不能依赖 metadata。

## Proposed Next PR Sequence

1. `refund-state-mutation-runtime-idempotency-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-terminal-conflict-plan`：细化 terminal conflict lock / evidence digest / operator review 边界。
3. `refund-state-mutation-terminal-conflict-contract`：新增不可执行终态冲突纯函数合同和 focused tests。
4. `refund-state-mutation-runtime-attempt-plan`：规划 workflow attempt persistence schema，不实现生产写入。
5. `refund-state-mutation-production-execution-go-no-go`：只有前置 gate 全过后，才重新评估生产执行。

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
