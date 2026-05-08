# storefront-product-discovery-client

## 目标

新增 Storefront 侧 `/store/china/product-discovery` 只读 fetcher，为后续页面分 surface 绑定做准备。

## 范围

允许修改：

- `apps/storefront/src/lib/data/china-product-discovery.ts`
- `.codex/tasks/storefront-product-discovery-client.md`
- `docs/storefront-product-discovery-client.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

不允许修改：

- Storefront 页面
- `ProductCard`
- `packages/api/**`
- cart / checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics
- 真实搜索、广告、竞价、推荐、支付、短信、IM、物流或直播 provider

## 验证

- Storefront build。
- `git diff --check`。
- 子智能体只读复核。
