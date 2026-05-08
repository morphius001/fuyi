# storefront-home-bind-view-model-plan

## 目标

以 docs-only 方式规划 Storefront 首页后续如何绑定 `storefront-home-market-shop-v2` view model mapper。

本任务只做绑定计划和风险拆分，不改页面。

## 允许修改

- `docs/storefront-home-bind-view-model-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑

## 计划要求

- 明确首页绑定输入：discovery read model、product cards、static fallback。
- 明确首页不展示 B-side 供应商主路径。
- 明确静态 UI 数据如何逐步退场，不能一次性大改。
- 明确桌面、移动端和空状态验收。
- 明确回滚方式。

## 验证

- `git diff --check`

## 交付要求

- docs-only。
- 不自动修改页面。
- 不自动提交，除非用户已授权连续执行队列。
