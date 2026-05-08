# Product Discovery Store API Readonly

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮新增 Store 端商品发现只读 API：

```text
GET /store/china/product-discovery
```

API 只读取 open seller、seller product links 和 published products，并调用 `buildChinaProductDiscoveryReadModel()` 生成只读展示 response。

## Query Params

- `q`：展示搜索词过滤。
- `market`：展示市场过滤。
- `seller_handle`：店铺页展示过滤。
- `category_handle`：类目展示过滤。
- `limit`：展示数量，上限 24。

这些参数只影响 response 中的展示项，不写 cart、checkout、order、payment、refund、settlement、commission、permission、fulfillment 或 logistics。

## Response

```json
{
  "product_discovery": {
    "mode": "read_only_product_discovery",
    "source": "store_product_table",
    "readOnly": true,
    "runtimeEnabled": false,
    "canWriteBusinessState": false,
    "items": []
  }
}
```

## Non-goals

本轮不做：

- 修改 Storefront 页面或 `ProductCard`。
- 替换 Store products API。
- 新增写接口、migration、module registration 或后台配置。
- 库存占用、加购、购物车、结算、订单、支付、退款、结算、佣金、权限、履约或物流。
- 真实搜索排序、广告、竞价、推荐或 provider runtime。

## Verification

计划运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
PATH=/home/codex/.nvm/versions/node/v24.15.0/bin:$PATH NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --silent --runInBand --forceExit src/api/store/china/product-discovery/__tests__/helpers.unit.spec.ts src/lib/__tests__/china-product-discovery-read-model.unit.spec.ts
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
PATH=/home/codex/.nvm/versions/node/v24.15.0/bin:$PATH bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

并进行子智能体只读复核。

## Rollback

回滚本 PR 会移除 `/store/china/product-discovery` route 和 helpers，不影响现有 Store products API、seller products API、Storefront 页面或 `ProductCard`。
