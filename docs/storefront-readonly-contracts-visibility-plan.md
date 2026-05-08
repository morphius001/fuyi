# Storefront Readonly Contracts Visibility Plan

更新时间：2026-05-08 22:00 Asia/Shanghai

## 结论

Storefront 可以读取一部分只读 contracts 用于消费者展示，但必须非常克制：消费者只应该看到和购买/提货/店铺判断有关的信息，不应该看到平台内部配置、供应商接单、真实 Provider 或高风险交易边界。

本任务只做规划，不修改 `apps/storefront/**`。

## 可展示内容

### 商户角色

消费者侧可展示：

- 普通商品商户。
- 店铺/档口主页。
- 市场名。
- 档口号。
- 主营类目。
- “正在直播”状态徽标。

默认不展示：

- 物料供应商。
- 配送供应商。
- 养殖户/种植户。
- 种苗供应商。
- 外地批发商。

例外：

- 这些角色若额外开通普通商品商户角色，才进入消费者商品流。

### 店铺装修

消费者侧可展示：

- 已发布公开快照。
- 店铺头图。
- 公告。
- 商品分组。
- 脱敏资质。
- 配送/自提说明。
- 直播状态。

消费者侧不展示：

- 未审核草稿。
- 审核驳回原因。
- 内部风控原因。
- 后台操作日志。

### 物流/配送

消费者侧可展示：

- 到档自提。
- 商家自行配送。
- 市场统一配送。
- 冷链/快递提示。

消费者侧不触发：

- 未接入 checkout 的真实配送选择。
- 实时运费。
- 真实运单生成。
- 云打印。
- 物流状态回写。

### 提货卡

消费者侧可展示：

- 独立提货入口。
- 卡号/卡密/扫码入口。
- 权益识别后的可提内容。
- 地址或自提时间补充。
- 提货进度。

消费者侧不展示或不接入：

- 首页主推荐模块。
- checkout payment method。
- coupon 输入框。
- cart total 抵扣。
- store credit / gift card。

### 直播

消费者侧可展示：

- 店铺卡片“正在直播”徽标。
- 店铺主页直播状态。
- 预告/回放占位。

消费者侧不展示：

- 首页主入口。
- 真实直播间。
- 真实 IM。
- 礼物/打赏。
- 直播间下单或支付。

## UI PR 边界

后续 UI PR 可修改：

- `apps/storefront/**`

但禁止：

- 修改 `packages/api/**`，除非任务明确是 Storefront 只读 GET route。
- 修改 checkout、cart、order、payment、refund、settlement、commission、permission 或 fulfillment。
- 把只读 contract 当真实交易事实。
- 引入新依赖。

## 验证要求

UI PR 至少验证：

- Storefront build。
- 首页、搜索页、店铺页、提货入口页面 200。
- 移动端截图。
- 桌面端截图。
- 提货卡保持独立入口。
- 直播不作为首页主入口。
- 物料/配送/上游供应默认不进入消费者商品流。

## 下一步

建议做 `readonly-contracts-ui-planning-validation`，汇总 Admin/Vendor/Storefront 三端面板规划完成状态，然后再决定是否进入真实 UI PR。
