# Refund State Mutation Persistence Gap Plan

## 任务

规划真实退款状态写入前 operator approval、audit write、runtime idempotency 的生产持久化差距。

## 范围

- 新增 `docs/refund-state-mutation-persistence-gap-plan.md`。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不新增 route、job、subscriber、migration。
- 不连接生产 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用真实 provider refund request / query API。
- 不执行生产 workflow。
- 不写生产 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- `git diff --check`。
- 确认无 `apps/**` 或 `packages/**` runtime diff。
