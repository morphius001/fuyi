# Task: mock-webhook-db-backed-route-runtime-gate-plan

## 目标

规划 neutral mock webhook route 从 local disposable DB inbox smoke 进入未来 runtime gate 的前置条件。

本任务只写文档，不修改 runtime，不执行 workflow。

## 允许修改

- `.codex/tasks/mock-webhook-db-backed-route-runtime-gate-plan.md`
- `docs/mock-webhook-db-backed-route-runtime-gate-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。
- 不调用 payment workflow。

## 计划必须覆盖

- 当前 local smoke 已完成什么。
- 进入 runtime gate 前必须补哪些合同。
- feature flag / env gate。
- DB migration 注册前置条件。
- workflow execution 前置条件。
- 回滚策略。
- 观测与审计。
- PR 拆分顺序。

## 验证命令

```bash
git diff --check
```

## 完成标准

- 文档明确 runtime gate 的 Go/No-Go。
- queue 和 ledger 更新。
- 未修改 `packages/**` 或 `apps/**`。
