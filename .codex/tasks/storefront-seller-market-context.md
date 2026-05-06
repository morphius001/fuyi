# storefront-seller-market-context

## 目标

让 Storefront 店铺/档口页读取只读市场详情，把市场营业时间、公告和配送展示能力放到店铺层展示。

本任务只做展示，不改变 checkout shipping options、订单、支付、库存或履约。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
- `.codex/tasks/storefront-seller-market-context.md`
- `.codex/queue.md`

## 禁止修改

- `packages/api/**`
- `apps/admin/**`
- `apps/vendor/**`
- 真实客服、直播、物流、支付、订单、退款、结算、佣金、权限

## 实现要求

- 使用 `retrieveChinaMarkets()` 找到店铺所属市场。
- 使用 `retrieveChinaMarketDetail()` 读取市场详情。
- API 可用时，在店铺页展示市场营业时间、公告和 `deliveryProfiles`。
- API 不可用或空数据时，保留店铺静态/metadata fallback。
- 市场配送能力必须说明为展示信息，不影响结算页配送方式。

## 验证命令

```bash
cd apps/storefront && bun run build
git diff --check
```

## 非目标

- 不接真实物流。
- 不改运费。
- 不改库存和商品发布。
- 不改订单、支付或售后。
