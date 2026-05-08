# storefront-adapter-skeleton-validation-v2

## 目标

验证 Storefront 首页、店铺页和搜索页三个本地 view model adapter skeleton 的范围、合同和构建状态。

本任务只生成验证文档和更新队列 / ledger，不改页面，不新增运行时绑定。

## 允许修改

- `docs/storefront-adapter-skeleton-validation-v2.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- Storefront 页面组件和布局
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实排序、广告、竞价、推荐、物流、直播、提货卡兑换或 Provider

## 验证要求

- 验证 home adapter 输出 `storefront-home-market-shop-v2`。
- 验证 shop adapter 输出 `storefront-shop-stall-v2`。
- 验证 search adapter 输出 `storefront-search-market-results-v1`。
- 验证三个 adapter 都是 `zh-CN`、`CNY`、`Asia/Shanghai`、`readOnly=true`、`runtimeEnabled=false`、`canWriteBusinessState=false`。
- 验证没有导入后端 `packages/api` runtime。
- 验证 Storefront build。
- 验证 focused TypeScript check。
- 验证 `git diff --check`。
