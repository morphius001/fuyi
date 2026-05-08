# Storefront 店铺头部 Adapter 只读绑定

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮把消费者店铺 / 档口页头部信息接到 `buildChinaShopViewModel()` 输出。绑定仍是只读展示，不改变购物车、库存、结算、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

## 修改范围

```text
apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx
```

## 绑定内容

店铺页现在在服务端页面里构造 `shopViewModel`：

- `seller` 用于店铺名称、市场、档口号。
- `marketContext` 用于市场名称和营业时间展示。
- `fulfillmentHint` 用于配送 / 自提展示文案。
- `livePlacement` 仅控制直播状态 badge 是否可作为店铺状态展示。

## 未绑定内容

本轮没有绑定：

- 店铺商品卡 view model
- 商品详情页
- 购物车 mutation
- checkout shipping options
- order
- payment
- fulfillment / logistics / waybill
- 真实直播 / IM
- 真实提货卡兑换

## 安全边界

- `fulfillmentHint.affectsCheckoutShippingOptions=false`，本轮展示不会影响结算页配送选项。
- 提货卡保持独立入口，不作为优惠券、储值卡或支付方式。
- 直播只作为店铺状态 badge，不接推流、IM 或交易事实。
- 页面不展示 `fallback`、`mock`、`metadata`、`API failed` 等内部字段。

## 验证

本轮应验证：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

视觉 QA：

- desktop 1440 x 1000 店铺页截图
- mobile 390 x 844 店铺页截图

截图只放 `docs/visual-qa-artifacts/` 本地 QA 目录，不提交。

## 回滚方式

如出现店铺头部展示异常，可在 `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx` 恢复为直接读取 `shop`、`marketHours`、`marketNotice` 和 `marketDeliveryNames` 的原展示数据。Adapter 文件保留，不影响后续重新绑定。
