# refund-state-mutation-runtime-attempt-persistence-repository-plan

## 目标

规划 runtime attempt persistence repository 的 contract / schema / replay / retry / append-only event log 边界，为后续 disabled / non-executable repository contract 做拆分准备。

## 范围

- `.codex/tasks/refund-state-mutation-runtime-attempt-persistence-repository-plan.md`
- `docs/refund-state-mutation-runtime-attempt-persistence-repository-plan.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## 禁止

- 不修改 `packages/api/**` runtime
- 不新增 migration
- 不新增 repository contract / adapter / route / job / subscriber
- 不执行 workflow
- 不写 production refund success state

## 验证

1. `git diff --check`
2. `git status --short --branch`
