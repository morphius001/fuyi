# Storefront Product Discovery Binding Validation

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮汇总 Storefront 商品发现只读页面绑定阶段：

- PR #281 `storefront-home-product-discovery-source-binding`
- PR #282 `storefront-search-product-discovery-source-binding`
- PR #283 `storefront-shop-product-discovery-source-binding`

三个 surface 均已接入 `/store/china/product-discovery` 的只读商品发现结果，但只用于消费者展示字段。

## Current State

首页：

- “今日鲜货 / 首页商品展示字段”优先读取 `retrieveChinaProductDiscovery({ limit: 8 })` 的真实 `store_product_table` 结果。
- 空结果或 client fallback 时回退静态 `freshProducts`。
- 页面仍通过 `buildChinaHomeViewModel()` 输出 `freshProducts`。

搜索页：

- “相关鲜货展示 / 市场样例”优先读取 `retrieveChinaProductDiscovery({ query, market, limit: 8 })` 的真实 `store_product_table` 且带 `sellerHandle` 的结果。
- 空结果或 client fallback 时回退静态 `productResults`。
- 真实可加购商品继续走 Store API `listProducts()` 和 `ProductCard`。

店铺页：

- “档口今日参考 / 常卖鲜货”优先读取 `retrieveChinaProductDiscovery({ sellerHandle, limit: 8 })` 的当前店铺真实 `store_product_table` 结果。
- 空结果或 client fallback 时回退静态 `shop.products`。
- 真实可加购商品继续走 seller product ids、Store API `listProducts()` 和 `ProductCard`。

## Verification Already Run

- PR #281: Storefront build、`git diff --check`、子智能体只读复核通过。
- PR #282: Storefront build、`git diff --check`、子智能体只读复核通过。
- PR #283: Storefront build、`git diff --check`、子智能体只读复核通过。
- 本收口 PR: Storefront build、`git diff --check`、子智能体 docs-only 只读复核通过。
- Storefront build 仅保留既有 React Hook dependency warnings。

## Non-goals

本阶段没有：

- 改造 `ProductCard`。
- 替换 Store products API。
- 修改 `packages/api/**`。
- 新增搜索排序、广告、竞价、推荐、客服、补货或询价 runtime。
- 库存占用、加购、购物车、结算、订单、支付、退款、结算、佣金、权限、履约或物流变更。
- 真实微信支付、支付宝、短信、IM、物流或直播 provider。

## Risk Notes

`priceText`、`stockText`、市场、档口、seller handle 和 query / market / seller 过滤都属于展示层 read model 输入。真实价格、库存、配送、履约、订单归属、结算、佣金、权限和支付状态必须继续由后端业务链路决定。

`docs/visual-qa-artifacts/` 仍是本地 QA 产物目录，不纳入本阶段提交。

## Rollback

如需回滚：

1. 回滚 PR #283 后，店铺页参考商品恢复静态 `shop.products`，真实 `ProductCard` 商品不受影响。
2. 回滚 PR #282 后，搜索页“相关鲜货展示 / 市场样例”恢复静态 `productResults`，真实 `ProductCard` 商品不受影响。
3. 回滚 PR #281 后，首页“今日鲜货”恢复静态 `freshProducts`。

三者均不影响 cart、checkout、order、payment、refund、settlement、commission、permission、fulfillment 或 logistics runtime。
