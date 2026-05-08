# storefront-read-model-source-validation

## 目标

汇总 Storefront read model source 阶段结果，验证 home / search / shop adapter 输入源收束没有混入高风险业务链路。

本任务只做 docs-only 验证和 ledger 更新，不改页面、不改 API、不改交易或履约逻辑。

## 允许修改

- `.codex/tasks/storefront-read-model-source-validation.md`
- `docs/storefront-read-model-source-validation.md`
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

## 验证

- `cd apps/storefront && bun run build`
- `git diff --check`
- `git diff --name-only` 确认本轮仅包含任务、文档、队列和 ledger。
