# storefront-read-model-data-source-plan

## 目标

在 Storefront home / shop / search adapter 页面绑定完成后，规划下一阶段真实 market / seller / product read model 数据源接入顺序。

本任务只做 docs-only 规划，不改页面、不改 API、不新增 route、不新增 migration、不改变交易或履约链路。

## 允许修改

- `.codex/tasks/storefront-read-model-data-source-plan.md`
- `docs/storefront-read-model-data-source-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- DB / migration / seed
- cart / checkout / order
- payment / refund / settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- 真实搜索排序、广告、竞价、推荐
- 真实微信支付、支付宝、短信、IM、直播、物流或提货卡兑换

## 规划要求

- 说明当前 Storefront adapter 绑定后的数据源现状。
- 拆分 market / seller membership / product discovery 三类只读数据源。
- 明确 home / search / shop 三个页面下一步如何接入真实只读数据。
- 保留静态 fallback 和消费者可理解的降级文案。
- 明确不改变价格、库存、配送、订单、支付、退款、结算、佣金、权限或履约事实来源。
- 给出后续小 PR 顺序和验证要求。

## 验证

- `git diff --check`
- `git diff --name-only` 确认仅包含任务、文档、队列和 ledger。
