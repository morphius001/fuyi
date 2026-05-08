# storefront-search-discovery-source-binding

## 目标

把 Storefront 搜索页 adapter 输入构造收束为 discovery / markets / products + static fallback，并支持 market query 作为只读展示筛选。

本任务不接真实搜索 provider，不改 `ProductCard`，不改变购物车、订单、结算、支付、库存、配送或履约逻辑。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/search/page.tsx`
- `docs/storefront-search-discovery-source-binding.md`
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
- 真实搜索排序、广告、竞价或推荐
- 真实微信支付、支付宝、短信、IM、直播、物流或提货卡兑换

## 实现要求

- 搜索页并行读取 discovery、markets 和 Store products。
- 静态市场 / 类目 / 店铺数据作为 adapter fallback，不先混入 discovery。
- `market` query param 只作为展示筛选输入。
- 真实商品卡仍走 Store API + `ProductCard`。

## 验证

- `cd apps/storefront && bun run build`
- `git diff --check`
