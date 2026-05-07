# mock-webhook-local-route-inmemory-plan

## 目标

规划 mock webhook local route 的 in-memory smoke 接入。此任务只写文档，不修改 route。

## 允许修改

- `.codex/tasks/mock-webhook-local-route-inmemory-plan.md`
- `docs/mock-webhook-local-route-inmemory-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 必须覆盖

- 为什么先 in-memory，不直接 DB。
- route env gate。
- in-memory repository 生命周期。
- 幂等 replay 预期。
- 安全限制。
- local smoke 命令。
- 后续 disposable DB 前置条件。

## 验证

```bash
git diff --check
```
