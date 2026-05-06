# Task: storefront-market-client

## 目标

新增 Storefront 中国市场只读 API client/fetcher。本任务不改页面布局，不接入 UI。

## 允许修改

- `apps/storefront/src/lib/data/china-markets.ts`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止修改 checkout、cart total、shipping options、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止新增依赖
- 禁止重做 Storefront UI

## 验证

```bash
cd apps/storefront && bun run build
git diff --check -- apps/storefront/src/lib/data/china-markets.ts .codex/queue.md project-ledger .codex/tasks/storefront-market-client.md
```
