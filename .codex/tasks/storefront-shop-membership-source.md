# storefront-shop-membership-source

## 目标

让 Storefront 店铺 adapter 先支持 seller membership read model 输入形状，为后续页面从 seller metadata 过渡到结构化 membership 数据源做准备。

本任务不改店铺页页面，不改 `ProductCard`，不改加购、购物车、订单、结算、支付、库存占用、配送或履约逻辑。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/data/china-shop-view-model.ts`
- `docs/storefront-shop-membership-source.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- 店铺页页面布局
- `ProductCard`
- DB / migration / seed
- cart mutation
- checkout shipping options
- order mutation
- payment / refund / settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- 真实直播 / IM
- 真实提货卡兑换
- 真实 Provider 配置

## 实现要求

- 新增 seller membership 输入类型。
- 明确 seller id、handle、market、booth、role、status、main categories 字段。
- membership 只能影响店铺展示 view model，不改变权限、结算主体或 checkout shipping options。
- 保留 seller metadata / static fallback。

## 验证

- `cd apps/storefront && bun run build`
- `git diff --check`
