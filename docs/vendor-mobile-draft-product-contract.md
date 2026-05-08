# Vendor Mobile Draft Product Contract

更新时间：2026-05-08 18:40 Asia/Shanghai

## 结论

本轮新增的是手机快速上架草稿只读 contract，不是草稿真实 API，也不是商品发布流程。

合同文件：

- `packages/api/src/modules/china-product-drafts/mobile-draft-product-contract.ts`
- `packages/api/src/modules/china-product-drafts/__tests__/mobile-draft-product-contract.unit.spec.ts`

## 覆盖内容

合同覆盖：

- 手机端最小字段。
- 字段来源。
- 是否需要商户确认。
- 草稿阶段。
- 高风险阻塞项。

## 手机字段

必填或建议首屏关注字段：

- 商品名。
- 类目。
- 规格模板。
- 价格。
- 销售单位。
- 库存说明。
- 图片引用。
- 履约提示。

其中类目、规格模板、销售单位应来自只读模板或市场上下文；AI 只能提供 suggestion，不能绕过商户确认。

## 草稿阶段

合同阶段：

- 手机快速录入。
- 草稿已保存。
- AI 建议已生成。
- 商户确认中。
- 待平台审核。
- 可进入商品创建候选。

所有阶段都声明：

- `createsProduct: false`
- `createsInventory: false`

这保证 `ready_for_product_create` 只是候选，不是已发布商品。

## 高风险阻塞项

以下能力继续保持串行高风险：

- 真实商品创建。
- 库存初始化。
- 商品发布。
- 真实 AI Provider。
- 微信入口。
- 订单。
- 支付。
- 退款。
- 结算。
- 佣金。
- 权限。
- 履约。

## 下一步

建议继续做 `shop-decoration-readonly-plan`，先规划商家店铺装修的只读模型，再决定是否需要 contract skeleton。
