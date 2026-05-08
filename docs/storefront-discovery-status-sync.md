# Storefront Discovery Status Sync

更新时间：2026-05-09 Asia/Shanghai

## Summary

本文件同步 Storefront discovery / product discovery 当前主线状态。PR #277-#291 已完成并合并，商品发现只读链路已经从 API builder 走到 Storefront 页面展示绑定、QA runbook、observability plan、data inventory、sourceTags 和 sourceTags validation。

## Merged Scope

已合并：

- PR #277 `product-discovery-read-model-builder`
- PR #278 `product-discovery-store-api-readonly`
- PR #279 `storefront-product-discovery-client`
- PR #280 `product-discovery-readonly-validation`
- PR #281 `storefront-home-product-discovery-source-binding`
- PR #282 `storefront-search-product-discovery-source-binding`
- PR #283 `storefront-shop-product-discovery-source-binding`
- PR #284 `storefront-product-discovery-binding-validation`
- PR #285 `storefront-product-discovery-phase-rollup`
- PR #286 `storefront-product-discovery-qa-runbook`
- PR #287 `product-discovery-observability-plan`
- PR #288 `storefront-discovery-next-data-plan`
- PR #289 `storefront-discovery-data-inventory`
- PR #290 `product-discovery-source-tags`
- PR #291 `product-discovery-source-tags-validation`

## Current Safe State

- Store API has a readonly `/store/china/product-discovery` route.
- Storefront has a readonly `retrieveChinaProductDiscovery()` client.
- 首页、搜索页、店铺页 only consume product discovery fields as display input.
- Real purchasable products continue to use Store API / `ProductCard`.
- `sourceTags` are non-sensitive and display-only.
- QA / observability / data inventory / validation docs are in place.

## Still Blocked

Do not continue automatically into:

- real search ranking, ads bidding, recommendation runtime
- inventory reservation
- cart mutation
- checkout shipping options
- order mutation
- payment, refund, reconciliation
- settlement, commission, payout
- permission or seller role enforcement
- fulfillment, logistics, waybill
- real WeChat Pay, Alipay, SMS, IM, logistics, live provider
- Admin write APIs or real migrations
- analytics/log/metrics/tracing provider runtime

## Next Safe Options

Only small, separately reviewed tasks are safe:

1. `storefront-product-discovery-dev-debug-banner-plan`
   - docs-only plan for a development-only banner.
   - Must remain behind local env or explicit debug flag.

2. `storefront-discovery-audience-field-plan`
   - docs-only plan for `consumer` / `merchant` / `supplier` audience fields.
   - Must not change permissions or real visibility runtime.

3. `product-discovery-source-tags-validation-v2`
   - docs-only follow-up if sourceTags are later consumed by a dev-only surface.

## Verification

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

子智能体 docs-only 只读复核通过。Storefront build 仅保留既有 React Hook dependency warnings。
