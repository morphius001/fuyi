# Pickup Card Consumer Flow Plan

更新时间：2026-05-08 19:52 Asia/Shanghai

## 结论

提货卡对消费者来说是“我已经拿到一张实体/电子提货凭证，现在来领取对应权益”，不是“我用这张卡在商城买东西”。

因此消费者流程应该是：

```text
进入提货入口
  -> 输入卡号/卡密或扫码
  -> 系统识别可提权益
  -> 用户确认规格/数量/地址/自提时间
  -> 提交提货申请
  -> 生成提货单
  -> 商家或平台履约
```

## 明确不是

提货卡不是：

- 优惠券。
- 满减券。
- 折扣券。
- 储值卡。
- 余额。
- 支付方式。
- 普通购物车抵扣。
- 普通订单支付成功来源。

## 消费者入口

入口应该是独立页面，例如：

- `/pickup-card`
- 二维码扫码落地页。
- 我的提货单查询页。

不建议：

- 放在商城首页主推荐区。
- 混入商品卡片购买按钮。
- 混入 checkout payment method。
- 混入 coupon 输入框。

## 权益识别

用户输入：

- 卡号。
- 卡密。
- 二维码 token。

系统返回：

- 卡种名称。
- 可提内容摘要。
- 有效期。
- 履约方式。
- 可选规格或套餐。
- 是否需要地址。
- 是否需要自提时间。

安全要求：

- 错误卡号/卡密返回统一安全文案。
- 不暴露“卡号存在但卡密错”。
- 失败次数、IP、手机号、设备指纹后续进入风控。
- 卡密和二维码 token 永远不明文落日志。

## 固定权益与可选权益

固定权益：

- 例如“端午鲜果礼盒 1 份”。
- 用户只补齐收货地址或自提时间。

可选权益：

- 例如“海鲜礼盒 A/B 二选一”。
- 用户在允许范围内选择规格、套餐、发货批次或自提门店。

禁止：

- 用户把权益换成商城任意商品。
- 用户把权益折算成余额。
- 用户把权益抵扣普通订单金额。

## 提货申请

提交提货申请时应保存：

- 卡凭证引用。
- 权益快照。
- 用户确认的规格/套餐。
- 联系人。
- 大陆手机号。
- 中国大陆地址或自提门店/时间。
- 幂等键。
- 风控结果。

提交成功后生成：

- `PickupRedemption`。
- `PickupFulfillmentOrder`。

注意：

- `PickupFulfillmentOrder` 不是普通已支付订单。
- 后续可以关联普通履约能力，但不能继承支付语义。

## 履约状态

消费者可见状态建议：

- 待确认。
- 备货中。
- 待发货。
- 已发货。
- 待自提。
- 已核销。
- 已签收。
- 异常处理中。
- 已关闭。

这些状态不等于支付状态。

## 后续 PR 顺序

1. `pickup-card-consumer-flow-contract`
   - 新增纯 TypeScript 消费者提货 flow view shape。
   - 不新增 API route。

2. `pickup-card-credential-security-plan`
   - 梳理卡号、卡密、二维码 token、hash、pepper、频控和日志脱敏。

3. `pickup-card-redemption-readonly-contract`
   - 定义权益识别、提货申请、提货单状态的只读 contract。

4. `pickup-card-storefront-entry-plan`
   - 规划 Storefront 独立入口。
   - 不接真实兑换 API。

5. `pickup-card-admin-risk-plan`
   - 规划 Admin 卡种、批次、风控、操作日志。

## 高风险边界

提货卡后续实现不得顺带修改：

- payment provider。
- coupon/promotion。
- gift card/store credit。
- cart total。
- order paid state。
- refund。
- settlement。
- commission。
- permission。
- fulfillment。
