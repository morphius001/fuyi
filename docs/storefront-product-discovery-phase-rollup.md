# Storefront Product Discovery Phase Rollup

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮汇总 Storefront 商品发现 read model 阶段，从 API builder 到 Store API、Storefront client，再到首页、搜索页和店铺页只读绑定。

覆盖 PR：

- PR #277 `product-discovery-read-model-builder`
- PR #278 `product-discovery-store-api-readonly`
- PR #279 `storefront-product-discovery-client`
- PR #280 `product-discovery-readonly-validation`
- PR #281 `storefront-home-product-discovery-source-binding`
- PR #282 `storefront-search-product-discovery-source-binding`
- PR #283 `storefront-shop-product-discovery-source-binding`
- PR #284 `storefront-product-discovery-binding-validation`

## Completed Chain

API builder:

- `buildChinaProductDiscoveryReadModel()` 作为纯 TypeScript builder。
- 支持 query、market、seller、category 和 seller product ids 展示过滤。
- 默认排除物料、配送供应商、上游供给、种苗、外地批发等 B 端内容。

Store API:

- `GET /store/china/product-discovery`
- 只读读取 open seller、seller product links 和 published products。
- 支持 `q`、`market`、`seller_handle`、`category_handle` 和 `limit`。
- 不新增写接口、migration 或 provider runtime。

Storefront client:

- `retrieveChinaProductDiscovery()`
- 封装 `/store/china/product-discovery`。
- API 不可用时返回空只读 fallback，不抛到页面造成购物链路变化。

Storefront pages:

- 首页“今日鲜货 / 首页商品展示字段”优先使用真实 `store_product_table` 商品发现结果，空结果回退静态鲜货。
- 搜索页“相关鲜货展示 / 市场样例”优先使用真实 `store_product_table` 且带 seller handle 的商品发现结果；真实可加购商品仍走 Store API / `ProductCard`。
- 店铺页“档口今日参考 / 常卖鲜货”优先使用当前 seller handle 的真实 `store_product_table` 商品发现结果；真实可加购商品仍走 seller product ids + Store API / `ProductCard`。

## Verification Summary

已完成：

- Product discovery builder focused unit test。
- Product discovery Store API helper focused unit test。
- API typecheck。
- Storefront build。
- `git diff --check`。
- 每个 PR 的子智能体只读复核。
- 本 rollup PR 的 Storefront build、`git diff --check` 和子智能体 docs-only 只读复核。

Storefront build 仅保留既有 React Hook dependency warnings。

## What Still Is Not Done

当前阶段仍没有：

- 真实搜索排序、广告、竞价或推荐系统。
- 真实库存聚合、距离计算、店铺运营配置或市场运营配置。
- `ProductCard` 交易事实改造。
- checkout shipping options、购物车、订单、支付、退款、结算、佣金、权限、履约或物流变更。
- 真实微信支付、支付宝、短信、IM、物流或直播 provider。

## Next Safe Options

后续低风险方向只能继续拆小 PR：

1. Storefront 商品发现 QA runbook
   - 只记录首页、搜索页、店铺页在 API 可用 / API fallback / 无商品结果下的人工验证清单。
   - 不改运行时代码。

2. Product discovery observability plan
   - 只规划未来日志、source tag、fallback ratio 和运营排查字段。
   - 不接真实日志 provider，不上报用户隐私，不改变 API runtime。

3. Storefront discovery next-data plan
   - 规划真实 market、seller membership、category 和 product discovery 的下一轮 read model 数据质量要求。
   - 不新增 migration 或写接口。

任何真实搜索排序、广告、竞价、推荐、库存占用、购物车、checkout、订单、支付、退款、结算、佣金、权限、履约或物流改造，都必须单独高风险串行任务处理。

## Rollback

可按 PR 粒度回滚：

- 回滚 PR #284 / 本 rollup 只影响文档。
- 回滚 PR #283 恢复店铺页参考商品静态输入。
- 回滚 PR #282 恢复搜索页市场样例商品静态输入。
- 回滚 PR #281 恢复首页今日鲜货静态输入。
- 回滚 PR #279 移除 Storefront client。
- 回滚 PR #278 移除 Store API readonly route。
- 回滚 PR #277 移除 builder。

上述回滚均不应影响 cart、checkout、order、payment、refund、settlement、commission、permission、fulfillment 或 logistics runtime。
