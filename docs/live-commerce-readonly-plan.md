# Live Commerce Readonly Plan

更新时间：2026-05-08 20:28 Asia/Shanghai

## 结论

直播第一阶段只能做只读状态和占位，不做真实直播。

直播在本地生鲜/海鲜平台里的位置应该是：

- 店铺/档口主页上的状态。
- 商户后台里的预告/回放/审核占位。
- Admin 后台里的审核、风控和暂停展示入口。

不应该：

- 放到消费者首页主入口。
- 直接接真实推流。
- 直接接真实 IM 聊天室。
- 直接接礼物、打赏、支付或结算。
- 直接触发订单、库存或佣金。

## Storefront 边界

消费者侧可以展示：

- 店铺正在直播。
- 直播预告时间。
- 回放占位。
- 直播关联商品的只读引用。

消费者侧当前不能做：

- 打开真实直播间。
- 进入真实 IM 聊天。
- 直播间直接下单。
- 直播间支付。
- 礼物/打赏。
- 直播优惠券。

首页规则：

- 直播不要放在首页主模块。
- 最多在店铺/档口卡片上显示“正在直播”状态。

## Vendor 边界

Vendor 侧可以规划：

- 直播预告标题。
- 关联商品引用。
- 预告时间。
- 直播状态。
- 回放占位。
- 提交审核。

Vendor 侧当前不能做：

- 获取真实推流地址。
- 创建真实直播房间。
- 创建真实 IM 群。
- 发送真实开播通知。
- 直播带货下单。
- 查看真实打赏或交易。

## Admin 边界

Admin 侧可以规划：

- 直播审核列表。
- 风控状态。
- 暂停展示。
- 违规原因。
- 运营备注。

Admin 侧当前不能做：

- 管理真实推流密钥。
- 管理真实 IM 房间密钥。
- 处理直播支付、退款、结算或佣金。

## Provider 边界

已有 `MockLiveProvider`，但当前计划不调用它。

后续真实 Provider 必须单独拆分：

1. `live-commerce-readonly-contract`
   - 纯 TypeScript 只读 view shape。
   - 不调用 provider。

2. `mock-live-provider-contract-validation`
   - 验证 mock provider 边界。
   - 不接真实服务。

3. `live-room-runtime-gate-plan`
   - 规划 runtime gate。
   - 默认关闭。

4. `real-live-provider-plan`
   - 规划真实直播/IM/回放 Provider。
   - 必须包含密钥管理、审核、风控、限流、日志、回滚。

## 高风险阻塞项

以下全部保持串行高风险：

- 真实推流。
- 真实 IM。
- 直播聊天室。
- 直播商品交易。
- 直播下单。
- 直播支付。
- 礼物/打赏。
- 退款。
- 结算。
- 佣金。
- 权限。
- 开播通知。

## 下一步

建议继续做 `live-commerce-readonly-contract`，先把直播状态、预告、回放占位和高风险边界做成纯 TypeScript view shape。
