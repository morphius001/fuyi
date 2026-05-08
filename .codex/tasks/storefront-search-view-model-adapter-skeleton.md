# storefront-search-view-model-adapter-skeleton

## 目标

小范围实现 Storefront 搜索页 view model adapter skeleton。

本任务只新增纯函数 adapter，不改搜索页面布局，不把 adapter 接入页面。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/data/china-search-view-model.ts`
- `docs/storefront-search-view-model-adapter-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- Storefront 页面组件和布局
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实排序、广告、竞价、推荐、物流、直播、提货卡兑换或 Provider

## Skeleton 要求

- 定义搜索页 view model adapter 输入输出类型。
- 输出 `storefront-search-market-results-v1` 只读 view model。
- 保留 `zh-CN`、`CNY`、`Asia/Shanghai`。
- 支持 query、marketName、discovery、products 和 static fallback。
- 空 query 不报错，可返回默认消费者找货结果。
- 无结果只返回展示提示，不触发询价、补货、客服、购物车或订单。
- 默认过滤物料供应商、配送供应商、上游供给、种苗批发和外地批发等 B-side 内容。
- 标记高风险边界为 blocked serial work。
- 不导入后端 `packages/api` 运行时代码。

## 验证

- `cd apps/storefront && bun run build`
- focused temporary TypeScript check for the adapter files
- `git diff --check`
