# Refund State Mutation Shadow Command Plan

## 任务

规划 refund state mutation shadow command 的边界和后续 PR 顺序，明确 shadow command 不执行 workflow、不写退款成功状态。

## 范围

- 新增 `docs/refund-state-mutation-shadow-command-plan.md`。
- 规划 readiness decision 到 shadow state command 的输入、输出、审计和阻断条件。
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
