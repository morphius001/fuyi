# Refund State Mutation Audit Persistence Adapter Plan

## 任务

规划 audit persistence repository adapter 在 isolated preprod 中的写入边界、查询边界、fail-closed 规则和回滚门槛。

## 范围

- 新增 `docs/refund-state-mutation-audit-persistence-adapter-plan.md`。
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
