# Refund State Mutation Terminal Conflict Contract

## 任务

新增 terminal conflict lock / evidence digest 的 disabled / non-executable 纯函数合同。

## 范围

- 新增 `packages/api/src/modules/china-payment-notification/refund-state-mutation-terminal-conflict.ts`。
- 新增 focused unit tests。
- 从 `packages/api/src/modules/china-payment-notification/index.ts` 导出。
- 更新 payment notification harness。
- 新增 `docs/refund-state-mutation-terminal-conflict-contract.md`。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。

## 非目标

- 不修改 `apps/**`。
- 不新增 route、job、subscriber 或真实 workflow 调用点。
- 不新增 migration。
- 不连接生产 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用真实 provider refund request / query API。
- 不执行生产 workflow。
- 不写 production refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- focused unit test。
- API typecheck。
- payment notification idempotency harness。
- runtime grep。
- `git diff --check`。
