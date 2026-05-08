# Product Discovery Observability Plan

更新时间：2026-05-09 Asia/Shanghai

## Summary

本计划定义商品发现只读链路未来可观测性的最小字段和排查方式。当前阶段只做规划，不接真实日志 provider、不新增埋点 SDK、不改变 API 或页面 runtime。

覆盖链路：

```text
buildChinaProductDiscoveryReadModel()
  -> GET /store/china/product-discovery
  -> retrieveChinaProductDiscovery()
  -> Storefront home/search/shop display inputs
```

## Goals

- 判断页面展示来自真实 `store_product_table` 还是 static fallback。
- 判断 query / market / seller / category filter 是否过窄。
- 判断 API fallback 是否频繁发生。
- 帮助运营排查“有商品但页面没展示”的只读展示问题。

## Proposed Fields

只允许记录低风险聚合字段：

- `surface`: `home` / `search` / `shop`
- `request_source`: `storefront_home` / `storefront_search` / `storefront_shop`
- `read_model_mode`: `read_only_product_discovery` / `fallback_product_discovery`
- `source`: `store_product_table` / `static_fallback` / `storefront_fallback`
- `item_count`
- `filter_keys_present`: `query` / `market` / `seller_handle` / `category_handle`
- `fallback_used`
- `blocked_runtime_count`
- `api_status`: `success` / `client_fallback` / `empty_result`

不记录：

- 用户姓名、手机号、地址、OpenID、unionid、email 或会员 id。
- 购物车 id、订单 id、支付单 id、退款 id、结算 id。
- 真实 provider app id、merchant id、secret、token 或 webhook payload。
- 原始搜索词全文的长期日志；若未来需要观测 query，只记录是否存在或做短期脱敏采样并单独评审。

## Surface Notes

首页：

- 重点看 `item_count` 和 `fallback_used`。
- 如果真实商品为 0，首页应回退静态 `freshProducts`。

搜索页：

- 重点看 `filter_keys_present` 和 `empty_result`。
- 无搜索词时不应把默认展示文案当作真实 query 过滤。
- `sellerHandle` 缺失的商品发现项不应生成进店链接。

店铺页：

- 重点看 `seller_handle` filter 和 `item_count`。
- 当前店铺参考商品只展示当前 seller handle 的 items。
- 真实可加购商品仍由 seller product ids + Store API + `ProductCard` 验证。

## Debug Flow

1. 确认 Storefront build 是否通过。
2. 确认 `/store/china/product-discovery` 是否返回 `readOnly=true`、`runtimeEnabled=false`。
3. 检查 `item_count` 是否大于 0。
4. 如果 `item_count=0`，检查 filter 是否包含 query / market / seller handle / category handle。
5. 如果 `api_status=client_fallback`，检查 Store API 可达性和 client fallback 文案。
6. 如果页面有真实 `ProductCard` 但参考展示为空，确认这是展示输入 fallback 问题，不是交易链路故障。
7. 禁止通过修改 cart、checkout、order、payment、fulfillment 或 permission 来修复展示问题。

## PR Split

后续如果进入实现，必须拆小 PR：

1. `product-discovery-source-tags`
   - 只在 read model response 中补充非敏感 source tags。
   - 不接外部日志 provider。

2. `storefront-product-discovery-debug-banner-devonly`
   - 仅本地或开发环境可见。
   - 显示 source、item count、fallback used。
   - 不向消费者生产页面暴露工程字段。

3. `product-discovery-observability-validation`
   - docs-only 汇总验证和边界。

任何真实 metrics provider、日志平台、用户行为埋点、搜索词采样、支付/订单/履约字段关联，都必须单独隐私和安全评审。

## Non-goals

当前计划不做：

- 真实日志 provider。
- 第三方 analytics SDK。
- 用户行为追踪。
- 搜索排序、广告、竞价或推荐系统。
- cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流变更。

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
