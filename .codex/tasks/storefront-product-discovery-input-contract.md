# storefront-product-discovery-input-contract

## 目标

为 Storefront home / search / shop 三个 adapter 的商品展示输入补一个共享只读合同，明确商品发现输入只负责展示，不负责库存、购物车、结算、订单、支付、履约或推荐排序。

## 范围

允许修改：

- `apps/storefront/src/app/[locale]/(main)/data/china-product-discovery-input-contract.ts`
- `.codex/tasks/storefront-product-discovery-input-contract.md`
- `docs/storefront-product-discovery-input-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

不允许修改：

- Storefront 页面布局
- `ProductCard`
- `packages/api/**`
- cart / checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics
- 真实搜索、广告、竞价、推荐、短信、IM、物流、直播或支付 provider

## 验证

- `cd apps/storefront && /home/codex/.bun/bin/bun run build`
- `git diff --check`
- 子智能体只读复核。

## 回滚

回滚本 PR 只会移除合同和文档，不影响页面运行时。
