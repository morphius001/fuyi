# Product Discovery Source Tags

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮为商品发现只读 read model 增加 `sourceTags`。这些字段只用于 QA、dev-only 调试和后续 validation，不接真实日志 provider，不上报用户行为，不记录用户隐私或交易敏感字段。

## Added Fields

`sourceTags` 包含：

- `responseSource`
- `itemCount`
- `productRowCount`
- `sellerContextCount`
- `fallbackUsed`
- `fallbackReason`
- `filterKeysPresent`
- `displayOnly`

这些字段均为聚合或枚举值，不包含：

- 用户姓名、手机号、地址、OpenID、unionid、email 或会员 id。
- cart id、order id、payment id、refund id、settlement id。
- provider app id、merchant id、secret、token 或 webhook payload。
- 原始搜索词全文的日志。

## Scope

- `packages/api/src/lib/china-product-discovery-read-model.ts`
  - 增加 `ChinaProductDiscoverySourceTags`。
  - 在 `buildChinaProductDiscoveryReadModel()` 返回 `sourceTags`。
- `packages/api/src/lib/__tests__/china-product-discovery-read-model.unit.spec.ts`
  - 覆盖真实商品、seller product filter、B-side filtered empty result 和 fallback source tags。
- `apps/storefront/src/lib/data/china-product-discovery.ts`
  - 补充 Storefront client response type。
  - client fallback 增加 `sourceTags.responseSource=storefront_fallback` 和 `fallbackReason=client_fetch_failed`。
  - client fallback 的 `filterKeysPresent` 只记录当前入参 key 名，不记录 filter 原始值。

## Non-goals

本轮不做：

- Storefront 页面展示或 debug banner。
- 外部日志、analytics、metrics 或 tracing provider。
- API route 行为变更。
- 搜索排序、广告、竞价或推荐。
- cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流。

## Verification

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
cd packages/api
NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --silent --runInBand --forceExit src/lib/__tests__/china-product-discovery-read-model.unit.spec.ts
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
bunx tsc --noEmit -p packages/api/tsconfig.json
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

子智能体只读复核通过。Storefront build 仅保留既有 React Hook dependency warnings。

## Risk Notes

`sourceTags` 只能帮助判断 read model 和 client fallback 状态，不能作为价格、库存、履约、订单、结算、佣金、权限或支付事实来源。
