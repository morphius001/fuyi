# storefront-product-discovery-api-plan

## 目标

规划 Storefront 商品发现 read model API 的后续拆分，让首页、搜索和店铺页最终能读取统一的只读商品发现数据源。

本任务只做 docs-only 规划，不修改 `apps/**` 或 `packages/**` 运行时代码。

## 背景

当前已具备：

- `/store/china/discovery`：只读市场 / 类目 / 店铺 discovery。
- `/store/china/sellers/:handle/products`：只读 seller -> product ids。
- Storefront adapter 商品发现输入合同：`storefront-product-discovery-input-contract-v1`。

缺口：

- 尚无统一的 `/store/china/product-discovery` 只读 response contract。
- 首页鲜货、搜索商品和店铺商品仍由页面分别拼装 Store products / seller product ids / static fallback。

## 范围

允许修改：

- `.codex/tasks/storefront-product-discovery-api-plan.md`
- `docs/storefront-product-discovery-api-plan.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

不允许修改：

- `apps/**`
- `packages/**`
- `ProductCard`
- cart / checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics
- 真实搜索、广告、竞价、推荐、支付、短信、IM、物流或直播 provider

## 验证

- `git diff --check`
- 子智能体只读复核。

## 后续 PR 建议

1. 先实现纯 TypeScript read model builder 和 focused tests。
2. 再新增只读 Store API route，默认使用 Store product table + seller product ids + fallback。
3. 最后由 Storefront adapter 页面分 surface 接入。
