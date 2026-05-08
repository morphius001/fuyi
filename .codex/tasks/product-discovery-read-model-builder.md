# product-discovery-read-model-builder

## 目标

实现 Storefront 商品发现只读 read model 的纯 TypeScript builder，为后续 `/store/china/product-discovery` API 做准备。

## 范围

允许修改：

- `packages/api/src/lib/china-product-discovery-read-model.ts`
- `packages/api/src/lib/__tests__/china-product-discovery-read-model.unit.spec.ts`
- `.codex/tasks/product-discovery-read-model-builder.md`
- `docs/product-discovery-read-model-builder.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

不允许修改：

- API route
- Storefront 页面
- `ProductCard`
- DB migration / module registration
- cart / checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics
- 真实搜索、广告、竞价、推荐、支付、短信、IM、物流或直播 provider

## 验证

- Focused unit test。
- API typecheck。
- `git diff --check`。
- 子智能体只读复核。
