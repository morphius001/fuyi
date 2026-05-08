# storefront-search-product-discovery-source-binding

## Goal

把 Storefront 搜索页“相关鲜货展示 / 市场样例” adapter 商品字段接到 `retrieveChinaProductDiscovery()`。

## Scope

- 仅修改搜索页 adapter 商品展示输入。
- 真实可加购商品继续走 `listProducts()` 和 `ProductCard`。
- 商品发现 API 有真实 `store_product_table` 结果时优先作为 `buildChinaSearchViewModel()` 的 `products` 输入。
- 商品发现 API 无结果或不可用时回退现有静态 `productResults`。
- 保留现有搜索页布局、市场 / 类目 / 店铺展示和购物车入口。

## Non-goals

- 不修改 `ProductCard`。
- 不修改首页或店铺页。
- 不修改 `packages/api/**`。
- 不接真实搜索排序、广告、竞价、推荐、客服、补货或询价。
- 不改变 cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

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

子智能体只读复核通过，确认真实商品卡路径和交易链路没有被修改。

## Rollback

回滚本 PR 后，搜索页“相关鲜货展示 / 市场样例”恢复为静态 `productResults`，真实 `ProductCard` 区域不受影响。
