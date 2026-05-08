# storefront-home-view-model-adapter-skeleton

## 目标

小范围实现 Storefront 首页 view model adapter skeleton。

本任务只新增纯函数 adapter，不改首页页面布局，不把 adapter 接入页面。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/data/china-home-view-model.ts`
- `docs/storefront-home-view-model-adapter-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- Storefront 页面组件和布局
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实搜索、推荐、广告、直播、IM、物流、提货卡兑换或 Provider

## Skeleton 要求

- 定义首页 view model adapter 输入输出类型。
- 输出 `storefront-home-market-shop-v2` 只读 view model。
- 保留 `zh-CN`、`CNY`、`Asia/Shanghai`。
- 保留 static fallback。
- 默认过滤 B-side supplier / procurement / upstream 内容。
- 标记高风险边界为 blocked serial work。
- 不导入后端 `packages/api` 运行时代码。

## 验证

- `cd apps/storefront && bun run build`
- `git diff --check`

## 交付要求

- 不自动改页面。
- 不自动接真实 API。
- 不自动提交，除非用户已授权连续执行队列。
