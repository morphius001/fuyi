# productdetails-related-products-store-api-guard

## 目标

修复 ProductCard 上线审计发现的阻断点：商品详情页“同档口更多鲜货”不能把 `prod.seller?.products` 这种可能缺少 `variants.calculated_price` 的 `Product[]` 直接传给 ProductCard。

本任务让 `HomeProductsCarousel` 只把 Store API 回查到、且带 calculated price 的商品传给 ProductCard。sellerProducts 仅作为 handle 查询条件；如果回查不到完整商品，则展示空态，不伪装为可加购商品卡。

## 范围

- `apps/storefront/src/components/organisms/HomeProductsCarousel/HomeProductsCarousel.tsx`
- docs / task / ledger 更新

## 非目标

- 不改变 ProductCard add-to-cart 语义。
- 不修改商品详情页规格选择、购物车、checkout、订单、支付、退款、结算、佣金、权限、履约或物流。
- 不新增 API route、不改 packages/api、不接库存占用。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `HomeProductsCarousel` Store API guard
- `docs/productdetails-related-products-store-api-guard.md`
- ledger / queue 更新

