# storefront-shop-view-model-adapter-skeleton

## 目标

小范围实现 Storefront 店铺 / 档口页 view model adapter skeleton。

本任务只新增纯函数 adapter，不改店铺页面布局，不把 adapter 接入页面。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/data/china-shop-view-model.ts`
- `docs/storefront-shop-view-model-adapter-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- Storefront 页面组件和布局
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实直播、IM、物流、提货卡兑换或 Provider

## Skeleton 要求

- 定义店铺 view model adapter 输入输出类型。
- 输出 `storefront-shop-stall-v2` 只读 view model。
- 保留 `zh-CN`、`CNY`、`Asia/Shanghai`。
- 保留 static fallback。
- B-side supplier 直达页标记 `role_gated_preview_only`。
- 店铺履约提示放在 `shop_header`，且 `affectsCheckoutShippingOptions=false`。
- 标记高风险边界为 blocked serial work。
- 不导入后端 `packages/api` 运行时代码。

## 验证

- `cd apps/storefront && bun run build`
- focused temporary TypeScript check for the adapter file
- `git diff --check`
