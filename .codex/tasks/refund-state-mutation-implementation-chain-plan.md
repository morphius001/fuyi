# Refund State Mutation Implementation Chain Plan

## 任务

在 launch readiness 明确 No-Go 之后，建立一条新的 implementation 级高风险串行任务链，明确第一批真实代码任务的顺序、门禁和非目标。

## 范围

- 新增 `docs/refund-state-mutation-implementation-chain-plan.md`。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。
- 必要时补充第一批 implementation 任务文件入口。

## 非目标

- 本轮不直接修改 `packages/api/**` runtime。
- 不新增 route、job、subscriber、migration。
- 不连接生产 DB。
- 不执行 production workflow。
- 不写 production refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。
- 不把 docs-only 队列和 implementation 链混在同一轮里偷偷越界。

## 验证

- `git diff --check`。
- 确认本轮仍无 `apps/**` 或 `packages/**` runtime diff。
