# Task: admin-market-readonly-ui-plan

## 目标

规划 Admin 市场管理页如何接入 Admin 中国市场只读 API。本任务只写计划，不改 UI。

## 允许修改

- `docs/admin-market-readonly-ui-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止修改权限、保存、发布、支付、订单、退款、结算、佣金或履约逻辑

## 验证

```bash
git diff --check -- docs/admin-market-readonly-ui-plan.md .codex/queue.md project-ledger .codex/tasks/admin-market-readonly-ui-plan.md
```
