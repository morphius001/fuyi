# storefront-shop-view-model-adapter-plan

## 目标

以 docs-only 方式细化 Storefront 店铺 / 档口页 view model adapter 的输入、输出、错误处理和验收。

本任务只做 adapter plan，不改页面、不新增 adapter 代码。

## 允许修改

- `docs/storefront-shop-view-model-adapter-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实直播、IM、物流、提货卡兑换、Provider 配置

## 计划要求

- 明确 adapter 文件建议位置和输入输出。
- 明确 seller/product ids/products/market/fallback 数据合成顺序。
- 明确 seller 不存在、无商品、B-side supplier 直达页的处理。
- 明确测试方式。
- 明确不做页面布局、不做 API route、不做真实交易链路。

## 验证

- `git diff --check`
