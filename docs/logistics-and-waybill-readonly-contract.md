# Logistics And Waybill Readonly Contract

更新时间：2026-05-08 19:38 Asia/Shanghai

## 结论

本轮新增物流/面单只读 contract，不新增 API route、不注册模块、不调用 MockLogisticsProvider、不接真实物流。

合同文件：

- `packages/api/src/modules/china-logistics-read-model/logistics-waybill-readonly-contract.ts`
- `packages/api/src/modules/china-logistics-read-model/__tests__/logistics-waybill-readonly-contract.unit.spec.ts`

## 覆盖能力

履约方式：

- 到档自提。
- 商家自行配送。
- 市场统一配送。
- 配送供应商。
- 冷链/快递。

面单能力：

- mock 运单号。
- mock 面单预览。
- 真实报价。
- 云打印。
- 取消面单。
- 重打面单。

## 输出边界

合同输出：

- `readOnly: true`
- `runtimeEnabled: false`
- `checkoutImpact: "none"`
- `createsRealShipment: false`
- `printsRealLabel: false`

## 高风险阻塞项

继续保持串行阻塞：

- checkout shipping options。
- cart total。
- fulfillment creation。
- shipment confirmation。
- 真实运单号。
- 真实面单。
- 云打印。
- 订单物流状态回写。
- 支付。
- 退款。
- 结算。
- 佣金。
- 权限。

## 下一步

建议继续做 `pickup-card-consumer-flow-plan`，重新梳理消费者拿提货卡来提货的真实流程，避免把提货卡误当优惠券或支付方式。
