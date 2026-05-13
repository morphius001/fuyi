# Refund State Mutation Isolated Preprod Adapter Implementation Gate Plan

## 任务

规划 refund state mutation 四段 persistence adapter 进入 isolated preprod implementation 前必须满足的统一环境 gate、rollback gate、operator gate 和 fail-closed 前置条件。

## 范围

- 新增 `docs/refund-state-mutation-isolated-preprod-adapter-implementation-gate-plan.md`。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不新增 route、job、subscriber、migration。
- 不连接生产 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用真实 provider refund request / query API。
- 不执行 production workflow。
- 不写 production refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- `git diff --check`。
- 确认无 `apps/**` 或 `packages/**` runtime diff。
