# Refund State Mutation Shadow Command Contract

## 任务

实现 `refund-state-mutation-shadow-command-contract` 纯函数，把 readiness decision 映射为不可执行 state shadow command / audit event。

## 范围

- 新增 `packages/api/src/modules/china-payment-notification/refund-state-mutation-shadow-command.ts`。
- 新增 focused tests。
- 导出新合同。
- 将 focused test 纳入 payment notification harness。
- 新增 `docs/refund-state-mutation-shadow-command-contract.md`。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。

## 非目标

- 不新增 route。
- 不连接 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用真实 provider refund request / query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- Focused unit test。
- API typecheck。
- Payment notification harness。
- Runtime grep。
- `git diff --check`。
- 子智能体只读复核。
