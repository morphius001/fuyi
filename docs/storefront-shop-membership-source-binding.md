# Storefront Shop Membership Source Binding

## Summary

Storefront 店铺页现在会把市场详情里的 seller membership 转成 `buildChinaShopViewModel()` 的 `membership` 输入。

合成顺序：

1. 当前店铺匹配到 `marketDetail.memberships` 中的 `sellerHandle` 或 `sellerId`。
2. 匹配成功时，使用 membership 的 `sellerId`、`sellerHandle`、`sellerName`、`boothNo`、`status` 和 metadata role。
3. 匹配失败时，继续使用 seller metadata 和静态店铺 profile 生成只读 membership fallback。

## Files Changed

- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
- `.codex/tasks/storefront-shop-membership-source-binding.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Scope

本轮只做店铺页 adapter 输入绑定：

- 读取 `retrieveChinaMarketDetail()` 已返回的只读 memberships。
- 传入 `membership` 给 `buildChinaShopViewModel()`。
- 保留原 `seller` 输入、market 输入和商品展示输入。
- 真实商品卡仍然走 seller products API、Store products API 和 `ProductCard`。

## Non-goals

- 不修改 `packages/api/**`。
- 不新增市场、商户、权限、订单或结算模型。
- 不改变 `ProductCard`。
- 不改变 cart、checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。
- 不接真实搜索排序、广告、竞价、推荐、短信、IM、物流或直播 provider。

## Verification

- Storefront build。
- `git diff --check`。
- 子智能体只读复核。

## Risk Notes

`membership.status` 和 `membership.role` 只作为消费者店铺页展示输入。它们不能在当前阶段驱动真实权限、结算主体、订单归属、checkout shipping options 或履约选择。

回滚本改动后，店铺页会回到 seller metadata / 静态 profile 输入路径。
