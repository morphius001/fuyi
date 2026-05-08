# product-discovery-readonly-validation

## 目标

汇总商品发现只读阶段：

- `product-discovery-read-model-builder`
- `product-discovery-store-api-readonly`
- `storefront-product-discovery-client`

本任务只做 docs / ledger 验证收口，不修改 `apps/**` 或 `packages/**` 运行时代码。

## 范围

允许修改：

- `.codex/tasks/product-discovery-readonly-validation.md`
- `docs/product-discovery-readonly-validation.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

不允许修改：

- `apps/**`
- `packages/**`
- Storefront 页面
- `ProductCard`
- cart / checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics
- 真实搜索、广告、竞价、推荐、支付、短信、IM、物流或直播 provider

## 验证

- `git diff --check`
- 子智能体只读复核。

## 下一步边界

页面绑定必须另拆单 surface PR。任何库存、购物车、checkout、订单、支付、退款、结算、佣金、权限或履约生效都必须单独高风险串行。
