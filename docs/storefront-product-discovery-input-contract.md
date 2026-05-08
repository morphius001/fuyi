# Storefront Product Discovery Input Contract

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮为 Storefront 商品发现展示输入新增共享只读合同：

- `home_fresh_products`
- `search_product_results`
- `shop_real_products`
- `shop_reference_products`

合同文件位于：

```text
apps/storefront/src/app/[locale]/(main)/data/china-product-discovery-input-contract.ts
```

## Scope

合同只描述 adapter 可以消费的商品卡展示字段：

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

真实商品卡继续走 Store API 和 `ProductCard`。Adapter reference 商品只用于首页或店铺页展示，不创建库存占用、购物车、订单或履约状态。

## Source Order

- 首页鲜货展示：`store_products` -> `adapter_static_read_model` -> `static_fallback`
- 搜索真实商品结果：`store_products` -> `static_fallback`
- 店铺真实商品：`seller_products_api` -> `store_products`
- 店铺参考商品：`adapter_static_read_model` -> `static_fallback`

## Non-goals

本轮不做：

- 页面布局绑定或视觉改版。
- `ProductCard` 改造。
- `packages/api/**` 改造。
- 真实搜索排序、广告、竞价或推荐。
- 库存占用、加购、购物车、结算、订单、支付、退款、结算、佣金、权限、履约或物流。
- 真实微信支付、支付宝、短信、IM、物流或直播 provider。

## Verification

计划运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

并进行子智能体只读复核。

## Risk Notes

`priceText` 和 `stockText` 是消费者展示字段，不是交易事实。真实价格、库存、配送和履约仍必须以后续商品详情、购物车、checkout shipping options、订单和后端异步状态为准。
