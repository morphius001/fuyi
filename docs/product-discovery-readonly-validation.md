# Product Discovery Readonly Validation

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮汇总商品发现只读阶段的三个 PR：

- PR #277 `product-discovery-read-model-builder`
- PR #278 `product-discovery-store-api-readonly`
- PR #279 `storefront-product-discovery-client`

当前已具备从 API builder、Store 只读 route 到 Storefront fetcher 的最小链路，但尚未接入页面。

## Current State

API builder：

- `buildChinaProductDiscoveryReadModel()` 接受已查询出的商品行、seller context、seller product ids 和只读 filters。
- 输出 `read_only_product_discovery`，固定 `readOnly=true`、`runtimeEnabled=false`、`canWriteBusinessState=false`。
- 默认过滤物料、配送供应商、上游、种苗、外地批发等 B 端内容。

Store API：

- `GET /store/china/product-discovery`
- 只读读取 open seller、seller product links 和 published products。
- 支持 `q`、`market`、`seller_handle`、`category_handle`、`limit` 展示过滤。
- `limit` 上限 24。

Storefront client：

- `retrieveChinaProductDiscovery()` 封装 `/store/china/product-discovery`。
- 支持 query、market、sellerHandle、categoryHandle 和 limit 映射。
- API 不可用时返回空只读 fallback。

## Verification Already Run

- Product discovery builder focused unit test: passed.
- Product discovery Store API helper focused unit test: passed.
- API typecheck: passed.
- Storefront build: passed for client PR.
- `git diff --check`: passed for each PR.
- 子智能体只读复核：passed for each PR.

## Non-goals

当前阶段没有：

- 接入首页、搜索页或店铺页。
- 修改 `ProductCard`。
- 替换 Store products API。
- 新增写接口、migration、module registration 或后台配置。
- 库存占用、加购、购物车、结算、订单、支付、退款、结算、佣金、权限、履约或物流。
- 真实搜索排序、广告、竞价、推荐或 provider runtime。

## Next Split

建议后续按单 surface 拆 PR：

1. `storefront-home-product-discovery-source-binding`
   - 首页鲜货展示读取 `retrieveChinaProductDiscovery()`。
   - 保留 static fallback。
   - 不改商品详情、加购、购物车或结算。

2. `storefront-search-product-discovery-source-binding`
   - 搜索页只把 adapter 商品展示输入接到 product discovery client。
   - 真实 `ProductCard` 路径仍可保留 Store products API，不能接真实排序、广告、竞价或推荐。

3. `storefront-shop-product-discovery-source-binding`
   - 店铺页只把展示输入 / seller_handle read model 接到 product discovery client。
   - `ProductCard` 和 seller products API 路径必须保持稳定，不能改订单归属或 checkout。

## Risk Notes

`priceText`、`stockText`、query filter、market filter、seller filter 和 category filter 都只是展示层 read model 输入。真实价格、库存、配送、履约、订单归属、结算、佣金、权限和支付状态必须继续由后端业务链路决定。
