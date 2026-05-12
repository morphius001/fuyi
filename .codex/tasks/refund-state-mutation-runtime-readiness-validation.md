# Refund State Mutation Runtime Readiness Validation

## 任务

在任何真实退款状态写入 runtime 前做 Go / No-Go 验证。

## 范围

- 记录 readiness、shadow command、operator approval 合同的合并后验证结果。
- 明确真实 refund success state mutation 仍为 No-Go，下一步只能规划 runtime adapter。
- 新增 `docs/refund-state-mutation-runtime-readiness-validation.md`。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不新增 route。
- 不连接 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用真实 provider refund request / query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- Focused readiness / shadow command / operator approval tests。
- API typecheck。
- Payment notification harness。
- Runtime grep。
- `git diff --check`。
- 子智能体只读复核。
