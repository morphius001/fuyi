# Product Discovery Read Model Builder

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮新增 Storefront 商品发现只读 read model builder：

```text
packages/api/src/lib/china-product-discovery-read-model.ts
```

它把已查询出的商品行、seller context、seller product ids 和只读 filters 合成为 `read_only_product_discovery` response shape。当前没有新增 API route，没有读 DB，也没有改变 Storefront 页面。

## Behavior

Builder 支持：

- `query` 展示搜索词过滤。
- `market` 展示市场过滤。
- `sellerHandle` 店铺页展示过滤。
- `categoryHandle` 类目展示过滤。
- `sellerProductIds` 店铺商品 id 限定。
- C 端默认可见过滤，排除物料、配送供应商、上游、种苗、外地批发等 B 端内容。
- 无商品行时使用 static fallback。

输出始终包含：

- `readOnly: true`
- `runtimeEnabled: false`
- `canWriteBusinessState: false`
- `blockedRuntime`

## Non-goals

本轮不做：

- 新增 `/store/china/product-discovery` route。
- 读取 Store product table。
- 改 Storefront fetcher 或页面。
- 改 `ProductCard`。
- 库存占用、加购、购物车、结算、订单、支付、退款、结算、佣金、权限、履约或物流。
- 真实搜索排序、广告、竞价、推荐或 provider runtime。

## Verification

计划运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
/home/codex/.bun/bin/bun run test:unit -- china-product-discovery-read-model
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

并进行子智能体只读复核。

## Risk Notes

`priceText` 和 `stockText` 仍是展示字段。真实价格、库存、配送、订单归属、结算和履约必须由后续商品详情、购物车、checkout、订单和后端状态决定。
