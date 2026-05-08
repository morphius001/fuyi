# storefront-search-read-model-input-contract

## 目标

明确 Storefront 搜索 adapter 的 query / market / category / seller / product 输入合同，为后续搜索数据源收束做准备。

本任务不改搜索页行为，不接真实搜索 provider，不改 API，不改变购物车、订单、结算、支付、库存、配送或履约逻辑。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/data/china-search-view-model.ts`
- `docs/storefront-search-read-model-input-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- 搜索页面布局
- DB / migration / seed
- cart mutation
- checkout shipping options
- order mutation
- payment / refund / settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- 真实搜索排序、广告、竞价、推荐
- 真实微信支付、支付宝、短信、IM、直播、物流或提货卡兑换

## 实现要求

- 导出搜索输入合同。
- 说明 query 来源和 normalized 规则。
- 说明 market 只作为展示筛选，不写 checkout shipping options。
- 说明 categories / sellers 只展示消费者可见结果。
- 说明 products 只作为只读卡片，不占库存。
- 保留 B-side 供应商过滤边界。

## 验证

- `cd apps/storefront && bun run build`
- `git diff --check`
