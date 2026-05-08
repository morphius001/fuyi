# Storefront Adapter Plan Validation

更新时间：2026-05-08 Asia/Shanghai

## 验证范围

本轮验证 PR #250、#251 合并后的首页 / 店铺 adapter plan，以及现有 Storefront template registry 和 home / shop / search mapper。

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

## 结论

首页和店铺 adapter plan 已经具备进入 skeleton 的条件，但建议先补搜索 adapter plan，让 home / shop / search 三个消费者入口的 adapter 边界统一，再进入真实代码实现。

下一步建议：

1. `storefront-search-view-model-adapter-plan`
2. `storefront-home-view-model-adapter-skeleton`
3. `storefront-shop-view-model-adapter-skeleton`

adapter skeleton 仍应只新增纯函数和轻量验证，不直接改页面布局。
