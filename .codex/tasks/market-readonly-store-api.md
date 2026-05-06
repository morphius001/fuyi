# Task: market-readonly-store-api

## 目标

新增 Store 端中国市场只读 API，供 Storefront 后续读取市场、市场详情和市场档口列表。本任务只读，不影响 checkout。

## 允许修改

- `packages/api/src/api/store/china/markets/**`
- `packages/api/.mercur/index.d.ts`，如 build/codegen 更新
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止新增写 API
- 禁止新增 migration
- 禁止修改 checkout、shipping options、cart total、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止新增依赖

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && ./node_modules/.bin/medusa build
git diff --check -- packages/api/src/api/store/china/markets .codex/queue.md project-ledger .codex/tasks/market-readonly-store-api.md packages/api/.mercur/index.d.ts
```
