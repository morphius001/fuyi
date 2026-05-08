# Pickup Card Consumer Flow Contract

更新时间：2026-05-08 20:12 Asia/Shanghai

## 结论

本轮新增提货卡消费者流程只读 contract，不新增 API route、不写数据库、不生成真实卡密或兑换记录。

合同文件：

- `packages/api/src/modules/china-pickup-card-read-model/pickup-card-consumer-flow-contract.ts`
- `packages/api/src/modules/china-pickup-card-read-model/__tests__/pickup-card-consumer-flow-contract.unit.spec.ts`

## 覆盖流程

合同覆盖：

- 进入提货入口。
- 输入卡号/卡密或扫码。
- 查看可提权益。
- 确认规格/套餐。
- 补齐联系人和地址。
- 提交提货申请。
- 查看提货进度。

所有步骤都声明：

- `createsPayment: false`
- `createsOrder: false`

## 权益边界

权益模式：

- 固定权益。
- 可选权益。
- 组合权益。

所有权益都声明：

- `allowsCatalogSubstitution: false`
- `convertsToBalance: false`
- `appliesToCartTotal: false`

这确保提货卡不是普通商品任意换购、不是余额、也不是购物车抵扣。

## 履约信息

合同区分：

- 配送到家：需要联系人、大陆手机号、中国大陆地址。
- 市场自提：需要联系人、大陆手机号、自提时间。
- 档口自提：需要联系人、大陆手机号、自提时间。

## 高风险阻塞项

继续保持串行阻塞：

- payment provider。
- coupon/promotion。
- gift card/store credit。
- cart total。
- order paid state。
- refund。
- settlement。
- commission。
- permission。
- fulfillment creation。
- real card secret。
- real QR token。

## 下一步

建议继续做 `live-commerce-readonly-plan`，先明确直播只读占位、直播 Provider、IM 和带货交易的边界。
