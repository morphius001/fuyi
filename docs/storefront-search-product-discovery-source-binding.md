# Storefront Search Product Discovery Source Binding

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮把 Storefront 搜索页的“相关鲜货展示 / 市场样例” adapter 商品字段接到商品发现只读 client：

```text
retrieveChinaProductDiscovery({
  query,
  market,
  limit: 8
})
```

真实可加购商品区域仍然使用 `listProducts()` 和 `ProductCard`，不由 adapter 改写交易事实。

## Source Order

搜索页 adapter 商品展示输入顺序：

1. `/store/china/product-discovery` 的 `store_product_table` 只读商品发现结果。
2. 搜索页现有静态 `productResults` fallback。
3. `buildChinaSearchViewModel()` 内置兜底商品。

商品发现结果只映射展示字段：

- `id`
- `title`
- `handle`
- `sellerId`
- `sellerName`
- `market`
- `booth`
- `priceText`
- `specText`
- `stockText`
- `source`

## Scope

- `apps/storefront/src/app/[locale]/(main)/search/page.tsx`
  - 并行读取 discovery、markets、Store products 和 product discovery。
  - 将真实 `store_product_table` discovery items 映射为 search adapter product input。
  - 只使用带 `sellerHandle` 的 discovery items 生成“进店”链接，避免 seller id 冒充 handle。
  - 无搜索词时页面仍显示“今日鲜货”，但 adapter 不用默认文案做二次过滤。
  - 空结果时通过 `fallback.products` 使用静态 `productResults`。
  - `ProductCard` 真实商品区继续读取 Store API 结果。

## Non-goals

本轮不做：

- `ProductCard` 改造。
- 首页或店铺页绑定。
- `packages/api/**` 改造。
- 真实搜索排序、广告、竞价、推荐、客服、补货或询价。
- 库存占用、加购、购物车、结算、订单、支付、退款、结算、佣金、权限、履约或物流。
- 真实微信支付、支付宝、短信、IM、物流或直播 provider。

## Verification

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

子智能体只读复核通过。Storefront build 仅保留既有 React Hook dependency warnings。

## Risk Notes

搜索页存在两个商品区域：

- 真实可加购商品：Store API + `ProductCard`。
- 相关鲜货展示：adapter 商品展示字段。

本轮只改变第二类展示输入。`priceText`、`stockText`、市场和档口字段都是消费者展示字段，不是交易事实。真实价格、库存、配送、履约、订单归属、结算、佣金、权限和支付状态必须继续由后端业务链路决定。
