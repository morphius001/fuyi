# Storefront Discovery Data Inventory

更新时间：2026-05-09 Asia/Shanghai

## Summary

本 inventory 盘点当前 Storefront discovery 只读链路可用字段和缺口。它只基于现有 clients、Store API route 和 read model type，不新增脚本、不读写数据库、不修改运行时代码。

覆盖文件：

- `apps/storefront/src/lib/data/china-markets.ts`
- `apps/storefront/src/lib/data/china-discovery.ts`
- `apps/storefront/src/lib/data/china-product-discovery.ts`
- `packages/api/src/api/store/china/product-discovery/route.ts`
- `packages/api/src/lib/china-product-discovery-read-model.ts`

## Inventory

### Market

当前已具备：

- `id`
- `name`
- `slug`
- `province`
- `city`
- `district`
- `address`
- `status`
- `timezone`
- `metadata`

当前通过 metadata 或 detail 间接读取：

- `hours`
- `notice`
- `delivery_profiles`

缺口：

- `hours` 和 `notice` 还不是强类型 market 字段。
- `delivery_profiles` 在 detail response 中存在，但首页 / 搜索列表仍多处用展示 fallback。
- 市场与 category 的结构化关联还不完整。

### Seller Membership

当前已具备：

- `id`
- `marketId`
- `sellerId`
- `sellerHandle`
- `sellerName`
- `boothNo`
- `stallName`
- `isPrimary`
- `status`
- `mainCategoryIds`
- `metadata`

当前通过 metadata 或页面合成读取：

- `role`
- `mainCategoryNames`
- `summary`

缺口：

- `role` 仍依赖 metadata key，例如 `seller_market_role`、`seller_role`、`business_type`。
- `mainCategoryIds` 到消费者展示类目名的稳定映射仍不完整。
- `summary` 多由页面 fallback 或 shop profile 合成，不是统一 read model 字段。

### Discovery Categories

当前已具备：

- `id`
- `handle`
- `name`
- `description`
- `count`
- `source`

缺口：

- `marketSlug` 缺失，无法稳定表达“某市场下的消费者类目”。
- `count` 仍是展示文案，不是库存、上架数或真实聚合事实。
- B 端类目过滤依赖名称 / 描述关键词，后续应补结构化 role 或 audience 字段。

### Product Discovery

当前已具备：

- `id`
- `title`
- `handle`
- `sellerId`
- `sellerHandle`
- `sellerName`
- `market`
- `booth`
- `priceText`
- `specText`
- `stockText`
- `source`

当前通过 product metadata 或 seller context 合成：

- `sellerHandle`
- `sellerName`
- `market`
- `booth`
- `priceText`
- `specText`
- `stockText`
- `categoryHandle`
- seller role / business type 过滤字段

缺口：

- `priceText` 和 `stockText` 是展示字段，不是交易事实。
- `categoryHandle` 当前存在于 row / metadata 层，但不是 Storefront client item 字段。
- `sellerHandle` 对搜索和店铺展示很关键；缺失时搜索页不会生成进店链接。
- 商品发现没有真实排序、广告、竞价、推荐、距离或库存聚合。

## Cross-surface Gaps

- Source tags 还不够细：页面能区分 `store_product_table` 与 fallback，但缺少统一的 debug-friendly item count / fallback reason。
- Fallback reason 还没有统一字段。
- Storefront QA 仍主要依赖人工 runbook 和 build，不是自动可视化 gate。
- category / seller / product 的 B 端过滤仍有关键词兜底，结构化 audience 字段缺失。

## Safe Next PRs

1. `product-discovery-source-tags`
   - 只补非敏感 source tags、item count、fallback reason。
   - 不接外部日志 provider。

2. `storefront-discovery-data-inventory-validation`
   - docs-only 汇总 inventory、QA runbook 和 observability plan。

3. `storefront-discovery-audience-field-plan`
   - docs-only 规划 consumer / merchant / supplier audience 字段。
   - 不改权限、不改菜单、不改真实可见性 runtime。

## Blocked Work

本 inventory 不允许直接展开：

- 真实 migration。
- Admin 写接口。
- 权限生效或菜单显隐。
- checkout shipping options、运费、履约、物流或面单。
- 库存占用、购物车、订单、支付、退款、结算、佣金、打款。
- 真实搜索排序、广告、竞价、推荐。
- 真实 provider、真实密钥或 webhook runtime。

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
