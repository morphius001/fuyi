# Refund State Mutation Readiness Plan

## 任务

规划平台退款状态写入前的 readiness / Go-No-Go gate，明确在当前阶段仍不得实现真实 refund success mutation。

## 范围

- 新增 `docs/refund-state-mutation-readiness-plan.md`。
- 汇总 provider inbox、handoff、shadow command、query follow-up、query reconciliation 和 fixtures 后，进入真实状态写入前必须满足的前置条件。
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
