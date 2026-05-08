# Storefront 店铺页 View Model Mapper

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮为消费者店铺 / 档口页新增只读 view model mapper，服务后续 `storefront-shop-stall-v2` 页面绑定。它不改 Storefront 页面，不新增 API route，不写数据库，也不改变购物车、结算、支付、订单、退款、结算、佣金、打款、权限或履约逻辑。

## 输出合同

Mapper 输出 `storefront_seller_view`，模板 id 固定为 `storefront-shop-stall-v2`，并带上：

- `locale: zh-CN`
- `currency: CNY`
- `timezone: Asia/Shanghai`
- `readOnly: true`
- `runtimeEnabled: false`
- `canWriteBusinessState: false`

店铺页主职责：

- 展示店铺 / 档口身份、市场、档口号和主营信息。
- 把配送、自提、营业时间、公告等履约提示放在店铺头部。
- 展示当前店铺商品卡，但商品卡不决定真实配送规则。
- 提货卡保持独立入口。
- 直播只作为店铺状态 badge。

## 数据来源

- `seller` 来自 seller discovery read model。
- `marketContext` 来自市场只读合同，找不到时标记 fallback。
- `products` 来自调用方传入的只读商品卡，按 `sellerId` 过滤；无商品时标记 fallback。
- `fulfillmentHint` 优先来自 seller summary，其次市场配送说明，最后静态兜底提示。
- `pickup_card_entry` 和 `live_status` 当前为只读展示位，不启用真实兑换或直播 provider。

## 展示边界

店铺页与首页不同：如果用户直接进入某个 B-side 供应商页面，mapper 可以返回 `role_gated_preview_only` 视图，让后续页面决定是否展示角色化预览；但这类供应商仍不应默认进入消费者首页主路径。

履约信息必须属于店铺 / 档口级展示，不应该写在单个商品卡上作为真实 checkout shipping options。

## 高风险边界

本 mapper 只读展示，不允许决定或写入：

- checkout shipping options
- payment success
- order status
- refund status
- settlement
- commission
- payout
- fulfillment / logistics / waybill
- live provider runtime
- real provider config
- real credentials

支付成功仍必须以后端异步通知为准；提货卡保持独立入口，不作为优惠券、储值卡、支付方式或购物车抵扣。

## 验证

本轮验证重点：

- focused unit test 覆盖店铺模板字段、店铺头部履约提示、商品过滤、B-side role-gated 视图、fallback 标记和高风险边界。
- API lib 既有 read model 单测保持兼容。
- API TypeScript typecheck 通过。
- `git diff --check` 通过。
