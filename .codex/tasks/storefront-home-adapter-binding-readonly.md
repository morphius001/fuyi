# storefront-home-adapter-binding-readonly

## 目标

把 Storefront 首页首屏市场 / 类目 / 店铺展示小范围绑定到 `buildChinaHomeViewModel()` 输出。

本任务只做只读展示绑定，不改商品卡交易行为，不改购物车、订单、结算、支付或履约入口。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/page.tsx`
- `docs/storefront-home-adapter-binding-readonly.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- DB / migration / seed
- 商品详情页
- cart mutation
- checkout
- order
- payment
- refund
- settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- 真实 Provider、真实直播、真实物流或真实提货卡兑换

## 绑定要求

- 首页首屏 active market 使用 home view model 的 `marketSelector`。
- 左侧市场类目使用 home view model 的 `categoryNav`。
- 移动端推荐档口使用 home view model 的 `featuredSellers`。
- 保留 static fallback。
- 不把物料供应商、配送供应商、上游供给、种苗批发和外地批发放进消费者首页主路径。
- 不展示 `fallback`、`mock`、`metadata` 或 `API failed` 等内部字段。

## 验证

- `cd apps/storefront && bun run build`
- 首页桌面截图
- 首页移动端截图
- `git diff --check`
