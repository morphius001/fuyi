# Refund Provider Query Reconciliation Plan

## 任务

规划 provider query snapshot 如何进入 reconciliation / manual review，而不是直接写平台退款成功状态。

## 范围

- 新增 `docs/refund-provider-query-reconciliation-plan.md`。
- 明确 query snapshot owner、reconciliation decision、manual review 输入和后续 PR 顺序。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不新增 route。
- 不连接 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用真实 provider refund request / query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- `git diff --check`。
- `git status --short --branch`。
- 子智能体只读复核。
