# Task: market-read-model-module-skeleton

## 目标

新增中国市场 read model skeleton，为后续真实市场/商户/档口数据模型做准备。本任务不注册运行时模块、不新增 migration、不新增 API route、不影响 checkout。

## 允许修改

- `packages/api/src/modules/china-market-read-model/**`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止新增 migration
- 禁止新增 API route
- 禁止修改 checkout、shipping options、cart total、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止新增依赖

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/modules/china-market-read-model/__tests__/market-read-model-service.unit.spec.ts --runInBand
cd packages/api && ./node_modules/.bin/medusa build
git diff --check -- packages/api/src/modules/china-market-read-model .codex/queue.md project-ledger .codex/tasks/market-read-model-module-skeleton.md
```
