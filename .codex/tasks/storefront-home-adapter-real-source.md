# storefront-home-adapter-real-source

## 目标

把 Storefront 首页 `buildChinaHomeViewModel()` 的输入从“markets API + 静态类目/档口”收束为“markets API + discovery API + 静态 fallback”。

本任务只调整首页只读 adapter 输入构造，不改视觉布局，不改商品详情、购物车、订单、结算、支付、库存占用、配送或履约逻辑。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/page.tsx`
- `docs/storefront-home-adapter-real-source.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- DB / migration / seed
- cart mutation
- checkout shipping options
- order mutation
- payment / refund / settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- 真实搜索排序、广告、竞价或推荐 runtime
- 真实微信支付、支付宝、短信、IM、直播、物流或提货卡兑换

## 实现要求

- 首页继续构造 `buildChinaHomeViewModel()`。
- 首页 market 输入优先读取 `retrieveChinaMarkets()`。
- 首页 category / seller 输入优先读取 `retrieveChinaDiscovery()`。
- 静态 `home-market` 数据必须保留为 fallback。
- 页面不展示 `fallback`、`mock`、`metadata`、`API failed`、`source`、`highRisk` 等内部字段。

## 验证

- `cd apps/storefront && bun run build`
- 首页 desktop smoke 或截图
- 首页 mobile smoke 或截图
- `git diff --check`
