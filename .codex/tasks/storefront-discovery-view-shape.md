# Task: storefront-discovery-view-shape

## 目标

定义 Storefront 首页、搜索页、店铺页的 discovery view shape，让后续前端读取稳定合同。本任务不重做 UI，不新增真实搜索或交易行为。

## 允许修改

- `packages/api/src/lib/china-read-models.ts`
- `packages/api/src/lib/__tests__/**`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止新增真实 API route
- 禁止修改 checkout、cart total、shipping options、payment、order、refund、settlement、commission、permission 逻辑
- 禁止接入真实搜索、客服、直播、物流、AI 或支付服务

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/lib/__tests__/china-read-models.unit.spec.ts --runInBand
cd packages/api && ./node_modules/.bin/medusa build
git diff --check -- packages/api/src/lib .codex/queue.md project-ledger .codex/tasks/storefront-discovery-view-shape.md
```
