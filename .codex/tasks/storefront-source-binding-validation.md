# storefront-source-binding-validation

## 目标

汇总 Storefront read model source binding 阶段的最后两步：

- `storefront-search-discovery-source-binding`
- `storefront-shop-membership-source-binding`

本任务只做验证文档和 ledger 收口，不修改 `apps/**` 或 `packages/**` 业务代码。

## 范围

允许修改：

- `.codex/tasks/storefront-source-binding-validation.md`
- `docs/storefront-source-binding-validation.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

不允许修改：

- `apps/**`
- `packages/**`
- cart / checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics
- 真实搜索、广告、竞价、推荐、支付、短信、IM、物流或直播 provider

## 验证重点

- 搜索页 source binding 只影响 `buildChinaSearchViewModel()` 输入。
- 店铺页 membership source binding 只影响 `buildChinaShopViewModel()` 输入。
- Store API 真实商品卡仍走原来的 `ProductCard`。
- `market` query、membership role/status 都不能驱动真实配送、权限、结算或订单归属。

## 验证命令

- `cd apps/storefront && /home/codex/.bun/bin/bun run build`
- `git diff --check`
- 子智能体只读复核当前 docs-only diff。

## 回滚

本任务是 docs-only 收口。回滚本 PR 不改变 Storefront runtime。
