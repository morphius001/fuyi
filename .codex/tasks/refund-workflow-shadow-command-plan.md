# Refund Workflow Shadow Command Plan

## 任务

规划后续 `refund-workflow-shadow-command-contract`：把 `evaluateRefundStateOwnerHandoffContract()` 的不可执行 decision 映射为 shadow workflow command DTO 和 audit event。

## 范围

- 新增 `docs/refund-workflow-shadow-command-plan.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做 docs-only planning，不改 runtime。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不连接 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 必须覆盖

- Shadow command DTO 字段、idempotency、audit action、redaction 和 failure mapping。
- `shadow_command_prepared`、`manual_review_required`、`query_required`、`reconciliation_required`、`blocked` 的输出语义。
- Workflow execution gate 必须继续 blocked。
- Settlement / commission / payout / fulfillment / logistics 不得由 shadow command 触发。
- 后续 PR 拆分和验证矩阵。

## 验证

- `git diff --check`
- `git status --short --branch`
- 子智能体只读复核。
