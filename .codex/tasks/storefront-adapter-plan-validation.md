# storefront-adapter-plan-validation

## 目标

验证 Storefront home/shop adapter plan 与现有 template registry、home/shop/search mapper 在最新 main 上兼容。

本任务是 validation / docs-only 收口，不改页面、不改 route、不改业务运行时。

## 允许修改

- `docs/storefront-adapter-plan-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑

## 验证命令

- `cd packages/api && bun test src/modules/china-template-registry-read-model/__tests__/template-registry-readonly-contract.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/storefront-home-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/storefront-shop-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/storefront-search-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/china-read-models.unit.spec.ts`
- `./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json`
- `git diff --check`
