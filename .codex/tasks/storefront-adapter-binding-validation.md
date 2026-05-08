# storefront-adapter-binding-validation

## 目标

对 Storefront home / shop / search 三个页面的 adapter 只读绑定阶段做收口验证。

本任务只记录验证结果、风险边界和后续建议，不新增页面绑定，不修改 API，不改变交易链路。

## 允许修改

- `.codex/tasks/storefront-adapter-binding-validation.md`
- `docs/storefront-adapter-binding-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/storefront/**` 页面和组件
- `apps/admin/**`
- `apps/vendor/**`
- `packages/api/**`
- DB / migration / seed
- cart / checkout / order
- payment / refund / settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- 真实微信支付、支付宝、短信、IM、直播、物流或提货卡兑换

## 验证要求

- 汇总 `storefront-home-adapter-binding-readonly`
- 汇总 `storefront-shop-header-adapter-binding-readonly`
- 汇总 `storefront-search-adapter-binding-readonly`
- 汇总 `storefront-home-product-cards-binding-readonly`
- 汇总 `storefront-shop-product-cards-binding-readonly`
- 跑 Storefront build
- 跑 `git diff --check`
- 确认本轮 diff 不包含 `packages/api/**` 或高风险交易目录

## 输出

- `docs/storefront-adapter-binding-validation.md`
- ledger / queue 更新
