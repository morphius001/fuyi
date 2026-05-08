# Storefront Home Template V2 Plan

更新时间：2026-05-09 Asia/Shanghai

## 目标

规划消费者首页 v2 模板预览。当前不改页面，只定义下一步实现时的模板 id、模块顺序、移动端策略、隐藏能力和验收方式。

## Template ID

```text
storefront-home-market-shop-v2
```

来源：

- `docs/storefront-template-contract-plan.md`
- `docs/template-preview-backlog.md`
- `packages/api/src/modules/china-template-registry-read-model/template-registry-readonly-contract.ts`

## 读取 View Model

后续实现应只读取稳定展示模型：

```text
market_context
search_state
category_groups
featured_shops
fresh_products
consumer_notices
service_promises
template_slots
```

不能直接读取或改变：

- checkout/cart/order/payment/refund/settlement/commission/payout/permission/fulfillment runtime
- provider config
- real credentials
- 真实支付或真实物流状态

## 桌面布局

建议桌面端按国内采购/本地电商首页组织，但保持简洁：

```text
顶部：市场切换 + 搜索 + 用户/购物车入口
主区第一屏：
  左：市场类目
  中：搜索结果导向 / 运营 banner / 今日市场公告
  右：登录/商家入驻/消费者服务入口
第一屏下方：
  推荐店铺 / 档口
  今日鲜货
  市场公告和服务保障
Footer：
  普通链接，移动端不做大块卡片堆叠
```

必须去掉：

- 重复搜索框。
- 重复“全部类目 / 市场类目”标题。
- 大段无用说明。
- 过多卡片化 footer。
- 把“今日价 / 到货 / 库存 / 先找店，再看今日鲜货”等解释性字样堆在首页。

## 移动端布局

移动端应该更像 App：

```text
固定顶部：
  市场名 + 搜索框
首屏：
  类目横滑 / 常买入口
  店铺/档口推荐
  今日鲜货 2 列卡片
底部：
  Home / 分类 / 购物车 / 我的
```

移动端要求：

- 首页短一些，避免一屏一屏堆说明。
- 商品卡只保留图片、名称、规格、价格、店铺。
- 店铺卡显示档口号、营业状态、配送/自提能力。
- Footer 简化成普通链接或折叠区，不要大块卡片。

## 首页主路径

首页主路径是：

```text
选市场 -> 找店/档口 -> 看今日鲜货 -> 加购/去结算
```

首页可以展示：

- 市场。
- 店铺/档口。
- 商品。
- 消费者服务。
- 提货卡独立入口的小入口。

首页默认隐藏：

- 物料供应商采购入口。
- 配送供应商接单入口。
- 养殖户/种植户对接入口。
- 种苗供应商入口。
- 外地批发商对接入口。
- 内部结算、佣金、权限和履约能力说明。

## 提货卡和直播

提货卡：

- 只保留独立入口。
- 不放成首页核心频道。
- 不进入购物车抵扣。
- 不和优惠券、满减券、储值卡混淆。

直播：

- 最多作为店铺卡片上的“正在直播”状态。
- 不作为首页主入口。
- 不接真实直播、聊天室、打赏或直播交易。

## 验收清单

后续实现 PR 必须验证：

- 桌面截图：首屏能看到市场、搜索、类目、店铺/档口、今日鲜货。
- 移动截图：首屏短、清楚，不堆长页面。
- 不再有重复搜索框。
- 不再有重复类目标题。
- Footer 在移动端不再是大块堆叠卡片。
- 物料供应商、配送供应商和上游供给不在消费者首页主路径。
- 提货卡为独立入口。
- 直播只作为店铺状态。
- `apps/storefront` build 通过。

## 回滚方式

实现时必须保留：

- 旧首页组件或旧模板路径。
- 可切回 `storefront-home-market-shop-v1` 的模板 id。
- 不影响 checkout/cart/order/payment/refund/settlement/commission/payout/permission/fulfillment。

## 本轮结论

消费者首页 v2 的重点不是塞更多模块，而是把路径变清楚：先市场，再店铺/档口，再今日鲜货。物料、配送供应商和上游供给是商户端/平台端能力，不应该抢消费者首页注意力。
