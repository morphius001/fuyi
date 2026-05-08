# Storefront Discovery Next Data Plan

更新时间：2026-05-09 Asia/Shanghai

## Summary

本计划定义 Storefront discovery 下一轮只读数据质量要求。当前阶段已经具备 market readonly API、seller membership 输入、product discovery readonly API 和首页 / 搜索 / 店铺展示绑定；下一步应先补齐数据质量和验收顺序，而不是直接进入交易、履约或权限 runtime。

本计划不新增 migration、不新增写接口、不修改页面、不接真实 provider。

## Data Domains

### Market

最小字段：

- `id`
- `slug`
- `name`
- `city`
- `district`
- `address`
- `hours`
- `notice`
- `delivery_profiles`
- `source`

质量要求：

- `slug` 稳定，可用于 Storefront 路由或查询参数。
- `name` 与 seller membership 的 `marketName` 能稳定匹配。
- `delivery_profiles` 只做展示，不写 checkout shipping options。
- `notice` 和 `hours` 缺失时必须有静态 fallback。

### Seller Membership

最小字段：

- `sellerId`
- `sellerHandle`
- `sellerName`
- `marketName`
- `boothNo`
- `role`
- `status`
- `mainCategoryNames`
- `summary`
- `source`

质量要求：

- `sellerHandle` 必须可用于 `/sellers/{handle}`。
- `role` 用于消费者展示过滤和 role-gated preview，不是权限事实来源。
- `status` 用于展示，不改变订单归属、结算、佣金或权限。
- B 端供应商默认不进入消费者主路径。

### Category

最小字段：

- `id`
- `handle`
- `name`
- `description`
- `count`
- `marketSlug`
- `source`

质量要求：

- `handle` 可用于 Storefront category links。
- `count` 是展示数字或文案，不是库存聚合事实。
- 消费者 category 默认过滤物料、配送供应商、上游供给、种苗和外地批发。

### Product Discovery

最小字段：

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

质量要求：

- `source=store_product_table` 才能进入真实商品发现展示。
- 搜索页必须要求 `sellerHandle`，避免 seller id 冒充 handle。
- 店铺页必须按当前 `sellerHandle` 过滤。
- `priceText` 和 `stockText` 仍是展示字段，不是交易事实。

## Acceptance Order

1. Data inventory
   - 统计当前 market、seller membership、category、product discovery 各字段缺口。
   - docs-only 或本地只读脚本均可，但不得写库。

2. Readonly source tags
   - 只补 source / fallback / item count 等非敏感字段。
   - 不接第三方日志 provider。

3. Storefront QA
   - 按 `docs/storefront-product-discovery-qa-runbook.md` 验证首页、搜索页、店铺页。
   - 截图产物只保留本地，不纳入 PR。

4. Validation rollup
   - docs-only 汇总数据质量、fallback、风险和下一步。

## Blocked Work

以下工作不得从本计划直接展开：

- 真实 market migration 或 Admin 写接口。
- 真实 seller role 生效、权限生效或菜单显隐。
- checkout shipping options、运费、履约、物流、面单。
- 库存占用、购物车、订单、支付、退款、结算、佣金、打款。
- 真实搜索排序、广告、竞价、推荐。
- 真实微信支付、支付宝、短信、IM、物流或直播 provider。

这些都必须单独高风险串行任务处理。

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
