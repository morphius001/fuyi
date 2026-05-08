# Storefront Home Product Discovery Source Binding

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮把 Storefront 首页的“今日鲜货 / 首页商品展示字段”接到商品发现只读 client：

```text
retrieveChinaProductDiscovery({ limit: 8 })
```

首页仍通过 `buildChinaHomeViewModel()` 输出 `freshProducts`，页面布局和商品入口保持不变。

## Source Order

首页商品展示输入顺序：

1. `/store/china/product-discovery` 的 `store_product_table` 只读商品发现结果。
2. 首页现有静态 `freshProducts` fallback。
3. `buildChinaHomeViewModel()` 内置兜底商品。

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

- `apps/storefront/src/app/[locale]/(main)/page.tsx`
  - 并行读取 markets、discovery 和 product discovery。
  - 将 product discovery items 映射为 home adapter product input。
  - 空结果时通过 `fallback.products` 使用静态鲜货。

## Non-goals

本轮不做：

- `ProductCard` 改造。
- 搜索页或店铺页绑定。
- `packages/api/**` 改造。
- 真实搜索排序、广告、竞价、推荐或搜索 provider。
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

`priceText`、`stockText`、市场和档口字段都是消费者展示字段，不是交易事实。真实价格、库存、配送、履约、订单归属、结算、佣金、权限和支付状态必须继续由后端业务链路决定。
