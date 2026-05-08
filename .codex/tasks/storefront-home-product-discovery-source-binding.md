# storefront-home-product-discovery-source-binding

## Goal

把 Storefront 首页“今日鲜货 / 首页商品展示字段”的只读输入接到 `retrieveChinaProductDiscovery()`。

## Scope

- 仅修改消费者首页商品展示输入。
- 首页继续通过 `buildChinaHomeViewModel()` 输出 `freshProducts`。
- 商品发现 API 有真实 `store_product_table` 结果时优先使用 `/store/china/product-discovery` 的只读展示字段。
- 商品发现 API 无结果或不可用时回退到现有静态 `freshProducts`。
- 保留现有页面布局、入口和搜索跳转。

## Non-goals

- 不修改 `ProductCard`。
- 不修改搜索页或店铺页。
- 不修改 `packages/api/**`。
- 不接真实搜索排序、广告、竞价或推荐。
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

子智能体只读复核通过，确认 tracked diff 没有越界修改交易、履约或权限链路。

## Rollback

回滚本 PR 后，首页商品展示输入恢复为静态 `freshProducts`，不会影响商品详情、购物车、结算或订单链路。
