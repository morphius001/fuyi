# Task: storefront-connect-market-readonly-api-plan

## 目标

规划 Storefront 何时、如何接入 Store 中国市场只读 API。本任务只写计划，不改 UI。

## 允许修改

- `docs/storefront-connect-market-readonly-api-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止修改 checkout、cart total、shipping options、order、payment、refund、settlement、commission、permission、fulfillment 逻辑

## 验证

```bash
git diff --check -- docs/storefront-connect-market-readonly-api-plan.md .codex/queue.md project-ledger .codex/tasks/storefront-connect-market-readonly-api-plan.md
```
