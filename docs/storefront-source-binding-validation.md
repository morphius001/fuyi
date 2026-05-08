# Storefront Source Binding Validation

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮汇总 Storefront read model source binding 阶段的最后两步：

- PR #271 `storefront-search-discovery-source-binding`
- PR #272 `storefront-shop-membership-source-binding`

这两个 PR 已把搜索页和店铺页的 adapter 输入从静态拼装继续收束到只读 read model source：

- 搜索页：discovery、markets、Store products 和 static fallback 分层进入 `buildChinaSearchViewModel()`。
- 店铺页：market detail membership、seller metadata 和 static profile 分层进入 `buildChinaShopViewModel()`。

## 验证结论

当前阶段仍然是展示层只读绑定：

- 搜索页 `market` query 只作为展示筛选，不影响配送、履约、运费或 checkout shipping options。
- 店铺页 membership `role` / `status` 只作为 adapter 展示输入，不影响权限、结算主体、订单归属或履约选择。
- 真实商品仍由 Store API 和 `ProductCard` 渲染。
- static fallback 仍保留，避免只读 API 不可用时页面失去基本展示。

## Files Reviewed

- `apps/storefront/src/app/[locale]/(main)/search/page.tsx`
- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
- `apps/storefront/src/app/[locale]/(main)/data/china-search-view-model.ts`
- `apps/storefront/src/app/[locale]/(main)/data/china-shop-view-model.ts`
- `apps/storefront/src/lib/data/china-discovery.ts`
- `apps/storefront/src/lib/data/china-markets.ts`
- `apps/storefront/src/lib/data/china-sellers.ts`

## Verification

计划运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

并进行子智能体只读复核，确认本 PR 只包含 docs / ledger 收口。

## Non-goals

本轮不做：

- 真实搜索排序、广告、竞价、推荐或 Algolia 切换。
- 市场距离、配送覆盖、库存聚合或销量聚合。
- membership 驱动权限、结算、订单归属、履约或菜单显隐。
- cart、checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。
- 真实微信支付、支付宝、短信、IM、物流或直播 provider。

## Risk Notes

Source binding 当前只能说明“页面展示输入来自更接近真实 read model 的只读 source”。它仍不是价格、库存、配送、排序、广告、权限、结算或订单事实来源。

下一阶段若继续推进，应优先做只读 product discovery 输入合同或市场 read model source 验证；任何会影响 checkout、订单、支付、退款、结算、佣金、权限或履约的工作必须单独串行拆 PR。
