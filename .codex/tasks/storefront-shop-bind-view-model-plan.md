# storefront-shop-bind-view-model-plan

## 目标

以 docs-only 方式规划 Storefront 店铺 / 档口页后续如何绑定 `storefront-shop-stall-v2` view model mapper。

本任务只做绑定计划和风险拆分，不改页面。

## 允许修改

- `docs/storefront-shop-bind-view-model-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实直播、IM、物流、提货卡兑换、Provider 配置

## 计划要求

- 明确店铺页绑定输入：seller view、market context、product cards、static fallback。
- 明确配送、自提、营业时间、公告属于店铺头部，不属于商品卡。
- 明确提货卡独立入口、直播 status badge。
- 明确 B-side supplier shop 的 role-gated preview。
- 明确验收和回滚。

## 验证

- `git diff --check`

## 交付要求

- docs-only。
- 不自动修改页面。
- 不自动提交，除非用户已授权连续执行队列。
