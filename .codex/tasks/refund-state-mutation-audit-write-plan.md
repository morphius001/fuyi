# Refund State Mutation Audit Write Plan

## 任务

规划 operator approval candidate 到 audit write 的 local-only / disabled 边界。

## 范围

- 新增 `docs/refund-state-mutation-audit-write-plan.md`。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不新增 route。
- 不新增 migration。
- 不连接 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用真实 provider refund request / query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- `git diff --check`。
- 子智能体只读复核。
