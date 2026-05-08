# Storefront Shop Template V2 Plan

更新时间：2026-05-09 Asia/Shanghai

## 目标

规划消费者端店铺/档口主页 v2 模板预览。店铺页是本地生鲜海鲜平台的核心页面：消费者先认市场和档口，再看今日鲜货和规格。

当前不改页面，只定义后续实现验收。

## Template ID

```text
storefront-shop-stall-v2
```

## 读取 View Model

后续实现应只读取稳定展示模型：

```text
shop_profile
market_memberships
booth
business_hours
announcements
fulfillment_options
decoration_snapshot
live_status
product_sections
service_notes
```

不能直接读取或改变：

- checkout shipping options
- order fulfillment
- payment/refund/settlement/commission/payout
- permission
- provider config
- real credentials

## 页面结构

建议店铺页按以下顺序：

```text
店铺头部：
  店铺名 / 市场名 / 档口号 / 营业状态
  公告
  配送方式：市场统一配送、商家自配送、自提
  正在直播状态（如果有）
店铺装修：
  头图 / 推荐分组 / 资质 / 服务说明
商品区：
  今日鲜货
  常卖商品
  规格和价格
  库存或供应状态
售后和保障：
  配送说明
  售后规则
  联系与客服入口
```

## 配送方式位置

配送方式属于店铺/档口能力，不应作为商品核心卖点。

店铺头部应明确：

- 支持市场统一配送。
- 支持商家自行配送。
- 支持自提。
- 哪些方式由商家开启或关闭。
- 最终以结算页可选项为准。

商品卡可以轻提示：

- 支持配送。
- 支持自提。
- 今日到货。

商品卡不应写成：

- “提供统一配送能力”。
- “配送供应商可接单”。
- 任何会让消费者以为商品自己决定配送规则的措辞。

## 商品卡边界

商品卡主要展示：

- 图片。
- 商品名。
- 规格/单位。
- 价格。
- 店铺或档口。
- 库存/供应状态。
- 加购入口。

商品卡不展示：

- 结算规则。
- 佣金。
- 商户供应链内部关系。
- 配送供应商接单状态。
- 支付 provider 信息。

## 店铺装修和直播

店铺装修：

- 可展示头图、公告、推荐分组、资质和服务说明。
- 不改变商品、库存、价格、订单、支付、退款、结算、佣金、权限或履约。

直播：

- 只作为店铺状态或局部入口。
- 可以放在店铺头部或推荐分组附近。
- 不作为首页主入口。
- 不接真实推流、IM、礼物、打赏或直播交易。

## 移动端布局

移动端店铺页建议：

```text
顶部粘性：
  店铺名 + 市场/档口 + 收藏/分享
店铺信息：
  营业状态 + 配送/自提方式 + 公告
商品分类：
  横向 tab
商品列表：
  2 列或紧凑列表
底部：
  联系商家 / 购物车 / 去结算
```

移动端重点：

- 店铺信息要靠前。
- 配送方式一行或两行说清楚。
- 商品列表不要被大段说明打断。
- 底部操作清楚，不要被 footer 卡片淹没。

## 验收清单

后续实现 PR 必须验证：

- 桌面截图：店铺头部包含市场、档口号、营业状态、配送/自提方式。
- 移动截图：首屏能看到店铺和配送/自提方式。
- 商品卡不再把配送方式当商品核心卖点。
- 直播只作为店铺状态。
- 店铺装修不影响商品、库存、价格、订单和履约。
- `apps/storefront` build 通过。
- 不修改 checkout、order、payment、refund、settlement、commission、payout、permission 或 fulfillment runtime。

## 回滚方式

实现时必须保留：

- 可切回 `storefront-shop-stall-v1` 的模板 id。
- 旧店铺页或旧布局入口。
- 不改变 Store API contract。
- 不改变 checkout 或 fulfillment runtime。

## 本轮结论

店铺页 v2 的核心是把“档口能力”和“商品信息”分清楚。配送、自提、营业时间和公告属于店铺/档口头部；商品卡只负责帮消费者判断买不买这个商品。
