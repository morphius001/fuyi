# Shop Decoration Readonly Plan

更新时间：2026-05-08 18:55 Asia/Shanghai

## 结论

商家主页装修应该先做只读模型和预览合同，不应该直接做装修保存、审核、发布或真实文件上传。

本计划承接 `docs/vendor-shop-decoration-api-design.md`，但范围更小：只规划 read-only view shape 和三端展示边界。

## 产品边界

商家主页装修用于展示：

- 店铺/档口头图。
- 市场名、档口号、营业时间。
- 商家公告。
- 今日鲜货或商品分组。
- 资质展示。
- 配送/自提说明。
- 直播状态占位。

它不负责：

- 商品上架。
- 改价格。
- 改库存。
- 创建订单。
- 改履约。
- 改支付、退款、结算、佣金或权限。

## Storefront 只读展示

消费者侧只读取已发布或 mock published 的公开快照。

展示原则：

- 普通商品商户可以展示店铺主页。
- 物料供应商、配送供应商、上游供给方默认不进入消费者主商品流。
- 直播最多作为店铺状态，不放首页主入口。
- 提货卡保持独立入口，不混入店铺装修主结构。

禁止：

- 消费者侧预览未审核草稿。
- 店铺装修改变商品购买按钮、库存、价格或配送方式。
- 店铺装修成为商户资质审核通过依据。

## Vendor 只读预览

Vendor 侧第一步只展示：

- 当前公开主页快照。
- 草稿/审核/发布状态占位。
- 哪些模块未来可编辑。
- 为什么当前不能编辑或发布。

未来编辑必须单独 PR：

- 草稿保存。
- 模块排序。
- 图片引用。
- 提交审核。
- 复制发布版本为新草稿。

## Admin 只读审核入口

Admin 侧第一步只展示：

- 商家装修状态总览。
- 待审核数量占位。
- 下架/恢复规则说明。
- 高风险模块提示。

未来审核必须单独 PR：

- 审核通过。
- 驳回。
- 平台下架。
- 恢复。
- 审计日志。

## 推荐只读 view shape

```text
ShopDecorationReadonlyView
  mode
  seller
  market
  stall
  status
  hero
  announcements[]
  productGroups[]
  credentials[]
  deliveryNotes[]
  liveStatus
  moduleAvailability[]
  highRiskBoundaries[]
  readOnly
  runtimeEnabled
```

关键要求：

- `readOnly: true`
- `runtimeEnabled: false`
- product groups 只引用商品，不改变商品。
- credentials 只展示脱敏引用，不验证资质真实性。
- liveStatus 只展示 mock/provider 引用，不接真实推流或 IM。

## 后续 PR 顺序

1. `shop-decoration-readonly-contract`
   - 新增纯 TypeScript view shape。
   - 不新增 route。

2. `storefront-shop-decoration-readonly-bridge-plan`
   - 规划 Storefront 店铺页如何读取公开快照。
   - 不改购买链路。

3. `vendor-shop-decoration-preview-plan`
   - 规划 Vendor 预览页。
   - 不保存草稿。

4. `admin-shop-decoration-review-plan`
   - 规划 Admin 审核入口。
   - 不实现审核动作。

## 风险点

- 店铺装修不能绕过商户入驻/资质审核。
- 商品分组不能改变商品发布状态。
- 配送说明不能改变 checkout shipping options。
- 直播状态不能接真实推流、IM 或支付链路。
- 图片上传和 CDN 是单独 Provider/Adapter 任务。
