# Storefront Read Model Source Phase Rollup

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮汇总 Storefront read model source 阶段 PR #267 到 PR #274 的完成状态。当前阶段已经把消费者首页、搜索页和店铺页的 adapter 输入从纯静态展示继续收束到只读 read model source，但仍不改变任何交易、履约、权限或 provider runtime。

## Completed PRs

- PR #267 `storefront-home-adapter-real-source`
- PR #268 `storefront-search-read-model-input-contract`
- PR #269 `storefront-shop-membership-source`
- PR #270 `storefront-read-model-source-validation`
- PR #271 `storefront-search-discovery-source-binding`
- PR #272 `storefront-shop-membership-source-binding`
- PR #273 `storefront-source-binding-validation`
- PR #274 `storefront-product-discovery-input-contract`

## Current State

首页：

- `buildChinaHomeViewModel()` 输入优先来自 markets API 和 discovery API。
- 首页鲜货商品展示有共享商品发现输入合同约束。
- 静态 fallback 保留，防止只读 source 不可用时页面失去基础展示。

搜索：

- `buildChinaSearchViewModel()` 输入已有 query / market / discovery / product 合同。
- 搜索页 source binding 已读取 discovery、markets 和 Store products。
- `market` query 只作为展示筛选，不影响配送、履约或 checkout shipping options。

店铺：

- `buildChinaShopViewModel()` 支持 membership 输入。
- 店铺页 source binding 已从 market detail memberships / seller metadata / static profile 合成 membership。
- 真实商品仍由 seller products API + Store products + `ProductCard` 渲染。

商品发现：

- 共享合同覆盖首页鲜货、搜索真实商品、店铺真实商品和店铺参考商品。
- `priceText` / `stockText` 只是展示字段，不是交易事实。

## Non-goals

本阶段没有实现：

- 真实搜索排序、广告、竞价或推荐。
- 距离排序、配送覆盖、库存聚合或销量聚合。
- membership 驱动权限、结算主体、订单归属或菜单显隐。
- cart、checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。
- 真实微信支付、支付宝、短信、IM、物流或直播 provider。

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

并进行子智能体只读复核。

## Next Boundary

后续不能把高风险能力顺手塞进 Storefront adapter PR。可继续的低风险方向包括：

- docs-only 规划真实 product discovery read model API。
- 只读 UI 文案收口或验证。
- adapter 合同测试和导出整理。

需要单独高风险串行拆分的方向包括：

- checkout shipping options 生效。
- 商品库存占用、真实价格事实、订单归属。
- 支付、退款、结算、佣金、权限、履约、物流和真实 provider runtime。
