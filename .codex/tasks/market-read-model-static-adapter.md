# Task: market-read-model-static-adapter

## 目标

把当前静态市场配置和 seller metadata discovery 语义包装成 China market read model seed。只做 adapter，不新增 route、不新增 migration。

## 允许修改

- `packages/api/src/modules/china-market-read-model/**`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止新增 migration
- 禁止新增 API route
- 禁止修改 checkout、shipping options、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止新增依赖

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/modules/china-market-read-model/__tests__/market-read-model-service.unit.spec.ts --runInBand
cd packages/api && ./node_modules/.bin/medusa build
git diff --check -- packages/api/src/modules/china-market-read-model .codex/queue.md project-ledger .codex/tasks/market-read-model-static-adapter.md
```
