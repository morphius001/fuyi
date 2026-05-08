# storefront-adapter-binding-sequence-plan

## 目标

规划 Storefront home / shop / search 三个 adapter skeleton 绑定到页面的 PR 顺序。

本任务只写计划，不改页面，不接真实 API，不改变交易链路。

## 允许修改

- `docs/storefront-adapter-binding-sequence-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/storefront/**` 页面组件和布局
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实排序、广告、竞价、推荐、物流、直播、提货卡兑换或 Provider

## 计划要求

- 明确 PR 顺序和每个 PR 的允许文件边界。
- 首页绑定先只接首屏市场 / 类目 / 店铺，不改购物车、订单或结算入口。
- 店铺绑定先只接店铺头部，不改 checkout shipping options。
- 搜索绑定先只接结果展示，不接真实排序、广告、竞价或推荐系统。
- 商品卡绑定必须只读，不占库存、不写 cart、不创建订单。
- 每个绑定 PR 必须包含回滚方式、验证命令和视觉 QA。
