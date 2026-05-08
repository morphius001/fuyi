# storefront-shop-product-discovery-source-binding

## Goal

把 Storefront 店铺页“档口今日参考 / 常卖鲜货” adapter 商品字段接到 `retrieveChinaProductDiscovery()`。

## Scope

- 仅修改店铺页参考商品展示输入和 shop adapter 的只读来源标记。
- 真实可加购商品继续走 seller product ids、`listProducts()` 和 `ProductCard`。
- 商品发现 API 有当前 `sellerHandle` 的真实 `store_product_table` 结果时优先作为 `buildChinaShopViewModel()` 的 `products` 输入。
- 商品发现 API 无结果或不可用时回退现有静态 `shop.products`。
- 保留现有店铺页布局、店铺头部、履约提示、直播 badge 和购物车入口。

## Non-goals

- 不修改 `ProductCard`。
- 不修改首页或搜索页。
- 不修改 `packages/api/**`。
- 不改变 seller product ids、订单归属、购物车、结算、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

## Verification

已完成：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

子智能体只读复核通过，确认真实商品卡路径和交易链路没有被修改；复核建议的 sellerId 审计映射已修正为优先使用 discovery 返回值。

## Rollback

回滚本 PR 后，店铺页参考商品恢复为静态 `shop.products`，真实 `ProductCard` 区域不受影响。
