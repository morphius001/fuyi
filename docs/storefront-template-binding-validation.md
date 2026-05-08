# Storefront Template Binding Validation

更新时间：2026-05-08 Asia/Shanghai

## 验证范围

本轮验证 PR #246、#247、#248 合并后的 Storefront 搜索 mapper 与首页 / 店铺页绑定计划。

覆盖内容：

- Template registry readonly contract
- Storefront home view model mapper
- Storefront shop view model mapper
- Storefront search view model mapper
- China read model builders
- API TypeScript typecheck
- diff check

## 验证命令

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
bun test src/modules/china-template-registry-read-model/__tests__/template-registry-readonly-contract.unit.spec.ts
bun test src/lib/__tests__/storefront-home-view-model-mapper.unit.spec.ts
bun test src/lib/__tests__/storefront-shop-view-model-mapper.unit.spec.ts
bun test src/lib/__tests__/storefront-search-view-model-mapper.unit.spec.ts
bun test src/lib/__tests__/china-read-models.unit.spec.ts

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 结果

- Template registry readonly contract：6 passed。
- Storefront home mapper：4 passed。
- Storefront shop mapper：4 passed。
- Storefront search mapper：4 passed。
- China read model builders：5 passed。
- API TypeScript typecheck：通过。
- `git diff --check`：通过。

## 边界确认

本轮没有新增或修改：

- `apps/**`
- API route
- DB / migration / seed
- checkout / cart
- inventory reservation
- order
- payment
- refund
- settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- real provider config
- real credentials

`packages/api/.mercur/index.d.ts` 在 typecheck 过程中可能被本地工具触碰；本轮验证后已恢复，没有纳入 diff。

## 风险说明

- 三个 mapper 仍是只读合同，页面尚未真正绑定。
- B-side 过滤当前仍是关键词启发式，真实数据接入前应补结构化 `audience` / `business_type` 字段。
- 首页 / 店铺页绑定计划只是分步说明，不能替代真实实现验证。
- 页面绑定阶段必须保留静态 fallback，并且每次只改一个 surface。

## 下一步

建议继续 docs-only adapter plan，再进入真实页面绑定：

1. `storefront-home-view-model-adapter-plan`
2. `storefront-shop-view-model-adapter-plan`
3. `storefront-search-view-model-adapter-plan`

adapter plan 完成后，再拆小 PR 实现首页 / 店铺 / 搜索页面绑定。
