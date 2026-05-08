# Storefront Shop Product Discovery Source Binding

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮把 Storefront 店铺页的“档口今日参考 / 常卖鲜货” adapter 商品字段接到商品发现只读 client：

```text
retrieveChinaProductDiscovery({
  sellerHandle,
  limit: 8
})
```

真实可加购商品区域仍然使用 seller product ids、`listProducts()` 和 `ProductCard`，不由 adapter 改写交易事实。

## Source Order

店铺页 adapter 商品展示输入顺序：

1. `/store/china/product-discovery` 中当前 seller handle 的 `store_product_table` 只读商品发现结果。
2. 店铺页现有静态 `shop.products` fallback。
3. `buildChinaShopViewModel()` 内置兜底商品。

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

- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
  - 并行读取 markets 和 product discovery。
  - 将当前 seller handle 的真实 `store_product_table` discovery items 映射为 shop adapter product input。
  - `sellerId` 优先保留 discovery 返回值，缺失时回退当前 membership seller id。
  - 空结果时通过 `fallback.products` 使用静态 `shop.products`。
  - `ProductCard` 真实商品区继续读取 seller product ids + Store API 结果。
- `apps/storefront/src/app/[locale]/(main)/data/china-shop-view-model.ts`
  - 允许 `products` data source 标记为 `store_product_table`，避免真实商品发现输入被误标为静态 read model。

## Non-goals

本轮不做：

- `ProductCard` 改造。
- 首页或搜索页绑定。
- `packages/api/**` 改造。
- 订单归属、库存占用、加购、购物车、结算、订单、支付、退款、结算、佣金、权限、履约或物流。
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

店铺页存在两个商品区域：

- 真实可加购商品：seller product ids + Store API + `ProductCard`。
- 档口今日参考：adapter 商品展示字段。

本轮只改变第二类展示输入。`priceText`、`stockText`、市场和档口字段都是消费者展示字段，不是交易事实。真实价格、库存、配送、履约、订单归属、结算、佣金、权限和支付状态必须继续由后端业务链路决定。
