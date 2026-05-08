# template-registry-v2-validation

## 目标

验证 template registry v2、Storefront home mapper、Storefront shop mapper 和既有 China read models 在最新 main 上兼容。

本任务是 validation / docs-only 收口，不改页面、不改 route、不改业务运行时。

## 允许修改

- `docs/template-registry-v2-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/src/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实 Provider、真实密钥、真实外部服务接入

## 验证命令

- `cd packages/api && bun test src/modules/china-template-registry-read-model/__tests__/template-registry-readonly-contract.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/storefront-home-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/storefront-shop-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/china-read-models.unit.spec.ts`
- `./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json`
- `git diff --check`

## 交付要求

- 记录验证结果、风险点和下一步队列。
- 如果 typecheck 触碰 `packages/api/.mercur/index.d.ts` 且内容不属于本轮任务，恢复该生成文件，不纳入 PR。
