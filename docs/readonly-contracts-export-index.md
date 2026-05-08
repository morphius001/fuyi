# Readonly Contracts Export Index

更新时间：2026-05-08 21:18 Asia/Shanghai

## 结论

当前新增的一批 China read-only contracts 只能作为三端后续展示和规划的稳定 view shape，不能作为真实业务开关、权限判断、订单事实、支付事实、履约事实或结算事实。

它们的共同边界：

- `readOnly: true`
- `runtimeEnabled: false`
- 不新增 API route。
- 不新增 migration。
- 不注册 runtime module。
- 不修改 checkout、订单、支付、退款、结算、佣金、打款、权限或履约逻辑。

## 合同索引

| Contract | 文件 | 后续用途 |
| --- | --- | --- |
| 商户角色能力 | `packages/api/src/modules/china-market-read-model/merchant-role-capability-contract.ts` | Admin/Vendor 展示商户角色、能力、消费者可见性和高风险边界 |
| 手机草稿商品 | `packages/api/src/modules/china-product-drafts/mobile-draft-product-contract.ts` | Vendor 手机快速上架字段、草稿阶段、AI suggestion 边界 |
| 店铺装修 | `packages/api/src/modules/china-shop-decoration-read-model/shop-decoration-readonly-contract.ts` | Storefront 店铺页、Vendor 预览、Admin 审核占位 |
| 物流/面单 | `packages/api/src/modules/china-logistics-read-model/logistics-waybill-readonly-contract.ts` | Storefront 履约提示、Vendor 配送配置说明、Admin 供应商/面单边界 |
| 提货卡消费者流程 | `packages/api/src/modules/china-pickup-card-read-model/pickup-card-consumer-flow-contract.ts` | Storefront 独立提货入口流程、Admin/Vendor 后续提货履约认知 |
| 直播只读 | `packages/api/src/modules/china-live-commerce-read-model/live-commerce-readonly-contract.ts` | 店铺/档口直播状态、Vendor 预告/回放占位、Admin 审核占位 |

## 三端可读范围

### Admin

Admin 后续可以读取：

- 商户角色能力 contract。
- 店铺装修 contract。
- 物流/面单 contract。
- 提货卡流程 contract。
- 直播只读 contract。

Admin 不得把这些 contract 当成：

- 权限规则。
- 审核通过事实。
- 结算规则。
- 佣金规则。
- 支付或退款开关。
- 真实 Provider 配置。

### Vendor

Vendor 后续可以读取：

- 商户角色能力 contract。
- 手机草稿商品 contract。
- 店铺装修 contract。
- 物流/面单 contract。
- 直播只读 contract。
- 提货卡流程中与履约认知相关的只读状态。

Vendor 不得把这些 contract 当成：

- 商品发布 API。
- 库存初始化 API。
- 真实发货 API。
- 真实快递打印 API。
- 真实开播 API。
- 订单或结算操作权限。

### Storefront

Storefront 后续可以读取：

- 商户角色消费者可见性。
- 店铺装修公开快照。
- 物流/配送展示提示。
- 提货卡消费者流程。
- 店铺直播状态。

Storefront 不得展示或触发：

- 物料供应商/配送供应商进入消费者主商品流，除非额外开通普通商品商户角色。
- 未审核装修草稿。
- 未接 checkout 的真实配送选择。
- 提货卡作为支付方式或优惠券。
- 直播作为首页主入口或真实交易入口。

## 禁止误用

这些 contract 不能被用作：

- Feature flag 生效来源。
- RBAC 权限来源。
- 支付成功来源。
- 普通订单已支付来源。
- 真实履约状态来源。
- 真实物流/直播/AI Provider 配置来源。
- 结算、佣金、打款规则来源。

## 下一步

建议按三端做面板规划：

1. `admin-readonly-contracts-panel-plan`
   - Admin 只读合同总览。

2. `vendor-readonly-contracts-panel-plan`
   - Vendor 能力、草稿、装修、履约、直播总览。

3. `storefront-readonly-contracts-visibility-plan`
   - Storefront 消费者侧可见性和隐藏规则。
