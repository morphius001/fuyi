# Storefront Product Discovery API Plan

更新时间：2026-05-09 Asia/Shanghai

## Summary

本计划定义 Storefront 商品发现 read model API 的后续拆分。目标是让首页、搜索页和店铺页最终能消费统一的只读商品发现 response，而不是在每个页面里分别拼装 Store products、seller product ids 和 static fallback。

本轮只做规划，不修改 `apps/**` 或 `packages/**` 运行时代码。

## Current State

已具备：

- `/store/china/discovery` 返回市场、类目和店铺的只读 discovery。
- `/store/china/sellers/:handle/products` 返回已开放 seller 和 product ids。
- Storefront `storefront-product-discovery-input-contract-v1` 已定义商品卡展示字段、source order 和 blocked runtime。
- Storefront 搜索和店铺真实商品卡仍走 Store API / `ProductCard`。

缺口：

- 没有统一的 `/store/china/product-discovery` 只读 API。
- 首页鲜货、搜索结果、店铺真实商品和店铺参考商品的 source composition 仍散在页面或 adapter 输入里。
- 商品发现还没有单独记录 fallback、consumer visible、market filter、seller filter 和 query filter 的 response metadata。

## Proposed Read Model

建议新增纯 builder：

```text
packages/api/src/lib/china-product-discovery-read-model.ts
```

建议 response shape：

```ts
type ChinaProductDiscoveryReadModel = {
  mode: "read_only_product_discovery"
  source: "store_product_table" | "seller_products_api" | "static_fallback"
  note: string
  filters: {
    query?: string
    market?: string
    sellerHandle?: string
    categoryHandle?: string
  }
  items: Array<{
    id: string
    title: string
    handle?: string
    sellerId?: string
    sellerName?: string
    market?: string
    booth?: string
    priceText?: string
    specText?: string
    stockText?: string
    source: "store_product_table" | "static_fallback"
  }>
  readOnly: true
  runtimeEnabled: false
  canWriteBusinessState: false
}
```

## Proposed API

建议后续新增：

```text
GET /store/china/product-discovery
```

只读 query params：

- `q`：展示层搜索词，只用于 read model 过滤。
- `market`：展示层市场筛选，不影响 checkout shipping options。
- `seller_handle`：店铺页商品过滤。
- `category_handle`：类目展示过滤。
- `limit`：只读展示数量，必须有上限。

返回：

```json
{
  "product_discovery": {
    "mode": "read_only_product_discovery",
    "source": "store_product_table",
    "note": "Display-only product discovery. It does not reserve inventory or mutate checkout.",
    "filters": {},
    "items": []
  }
}
```

## Source Order

首页鲜货：

1. Store product table 中 C 端可见商品。
2. Adapter static read model。
3. Static fallback。

搜索商品：

1. Store products with query / market display filters。
2. Static fallback only for empty or unavailable read model display。

店铺真实商品：

1. Seller products API product ids。
2. Store products by ids。
3. Empty state，不用 static 商品冒充真实商品。

店铺参考商品：

1. Adapter static read model。
2. Static fallback。

## Safety Boundaries

该 API 不能：

- 预留库存。
- 写购物车。
- 改 checkout shipping options。
- 创建或修改订单。
- 决定支付成功。
- 改退款、结算、佣金、打款或权限。
- 创建履约、物流、运单或面单。
- 接真实搜索排序、广告、竞价或推荐 provider。

`priceText` 和 `stockText` 只能是展示字段。真实价格、库存、配送和履约必须以后续商品详情、cart、checkout、order 和后端状态为准。

## PR Split

建议拆分：

1. `product-discovery-read-model-builder`
   - 新增纯 TypeScript builder 和 focused tests。
   - 不新增 route。
   - 不读 DB。

2. `product-discovery-store-api-readonly`
   - 新增 `/store/china/product-discovery` GET。
   - 只读查询 Store product table、seller product ids 和 category data。
   - 不写库、不接 provider、不改变 Store API 原有商品 route。

3. `storefront-product-discovery-client`
   - 新增 Storefront fetcher。
   - 不改页面。

4. `storefront-product-discovery-source-binding`
   - 按首页、搜索、店铺分 surface 接入。
   - 保留 `ProductCard` 和现有 Store API 商品详情路径。

## Verification Plan

每个后续实现 PR 至少运行：

- API focused unit tests。
- `bunx tsc --noEmit -p packages/api/tsconfig.json`。
- Storefront build。
- `git diff --check`。
- 子智能体只读 / 高风险边界复核。

如果新增 route，还需要本地 HTTP smoke，确认：

- 200 response shape。
- 无结果 fallback / empty state。
- query、market、seller_handle、category_handle 都只影响展示过滤。
- 不出现 cart、checkout、order、payment、refund、settlement、commission、permission、fulfillment 或 logistics mutation。

## Rollback

Docs-only 本轮回滚不影响 runtime。后续 route PR 回滚时，应只移除 product discovery route / fetcher / binding，不能影响原 Store products API 和 `ProductCard`。
