# storefront-search-view-model-adapter-plan

## 目标

以 docs-only 方式细化 Storefront 搜索页 view model adapter 的输入、输出、错误处理和验收。

本任务只做 adapter plan，不改页面、不新增 adapter 代码。

## 允许修改

- `docs/storefront-search-view-model-adapter-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实搜索排序、广告、竞价、推荐系统、Provider 配置

## 计划要求

- 明确 adapter 文件建议位置和输入输出。
- 明确 query/discovery/products/market/fallback 数据合成顺序。
- 明确空搜索、B-side 过滤、无结果和 market context 缺失处理。
- 明确测试方式。
- 明确不做页面布局、不做 API route、不做真实交易链路。

## 验证

- `git diff --check`
