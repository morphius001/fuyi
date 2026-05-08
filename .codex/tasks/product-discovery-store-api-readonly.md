# product-discovery-store-api-readonly

## 目标

新增 Store 端商品发现只读 API：

```text
GET /store/china/product-discovery
```

该 API 只读取 open seller、seller product links 和 published products，然后调用 `buildChinaProductDiscoveryReadModel()` 返回只读展示 response。

## 范围

允许修改：

- `packages/api/src/api/store/china/product-discovery/route.ts`
- `packages/api/src/api/store/china/product-discovery/helpers.ts`
- `packages/api/src/api/store/china/product-discovery/__tests__/helpers.unit.spec.ts`
- `.codex/tasks/product-discovery-store-api-readonly.md`
- `docs/product-discovery-store-api-readonly.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

不允许修改：

- Storefront 页面
- `ProductCard`
- DB migration / write API / module registration
- cart / checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics
- 真实搜索、广告、竞价、推荐、支付、短信、IM、物流或直播 provider

## 验证

- Focused helper unit test。
- Product discovery builder unit test。
- API typecheck。
- `git diff --check`。
- 子智能体只读复核。
