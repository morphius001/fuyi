# storefront-shop-header-adapter-binding-readonly

## 目标

把 Storefront 店铺 / 档口页头部展示小范围绑定到 `buildChinaShopViewModel()` 输出。

本任务只做只读展示绑定，不改商品卡交易行为，不改购物车、订单、结算、支付或履约入口。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
- `docs/storefront-shop-header-adapter-binding-readonly.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- DB / migration / seed
- checkout shipping options
- cart mutation
- order mutation
- payment、refund、settlement、commission、payout
- permission / RBAC
- fulfillment / logistics / waybill
- 真实 Provider、真实直播、真实物流或真实提货卡兑换

## 绑定要求

- 店铺名称、市场、档口号读取 shop view model 的 `seller`。
- 店铺履约提示读取 `fulfillmentHint`，并保持 `affectsCheckoutShippingOptions=false`。
- 直播只作为 `seller_status_badge` 展示，不接真实直播或 IM。
- 提货卡只提示独立入口，不作为优惠券、储值卡或支付方式。
- 商品列表和购物车入口不在本轮改造。

## 验证

- `cd apps/storefront && bun run build`
- 店铺页桌面截图
- 店铺页移动端截图
- `git diff --check`
