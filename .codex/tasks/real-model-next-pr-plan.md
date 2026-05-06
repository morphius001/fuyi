# Task: real-model-next-pr-plan

## 目标

整理下一轮真实 migration/API route 的拆分顺序和风险门禁。只写计划，不写业务代码。

## 允许修改

- `docs/real-model-next-pr-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止新增 migration 或 API route
- 禁止修改支付、订单、退款、结算、佣金、权限、履约逻辑

## 验证

```bash
git diff --check -- docs/real-model-next-pr-plan.md .codex/queue.md project-ledger .codex/tasks/real-model-next-pr-plan.md
```
