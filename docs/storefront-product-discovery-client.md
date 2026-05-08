# Storefront Product Discovery Client

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮新增 Storefront 侧商品发现只读 fetcher：

```text
apps/storefront/src/lib/data/china-product-discovery.ts
```

Fetcher 调用：

```text
GET /store/china/product-discovery
```

当前没有接入任何页面，不改变 Storefront UI、`ProductCard`、购物车、结算或订单行为。

## Query Mapping

- `query` -> `q`
- `market` -> `market`
- `sellerHandle` -> `seller_handle`
- `categoryHandle` -> `category_handle`
- `limit` -> `limit`

这些字段只用于只读展示过滤。

## Fallback

当 API 不可用时，fetcher 返回空的只读 fallback：

- `mode: "fallback_product_discovery"`
- `source: "storefront_fallback"`
- `readOnly: true`
- `runtimeEnabled: false`
- `canWriteBusinessState: false`

## Non-goals

本轮不做：

- 页面绑定。
- `ProductCard` 改造。
- Store products API 替换。
- 库存占用、加购、购物车、结算、订单、支付、退款、结算、佣金、权限、履约或物流。
- 真实搜索排序、广告、竞价、推荐或 provider runtime。

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
