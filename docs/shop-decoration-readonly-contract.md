# Shop Decoration Readonly Contract

更新时间：2026-05-08 19:10 Asia/Shanghai

## 结论

本轮新增商家主页装修只读 contract，不新增 API route、不写数据库、不保存草稿、不发布版本。

合同文件：

- `packages/api/src/modules/china-shop-decoration-read-model/shop-decoration-readonly-contract.ts`
- `packages/api/src/modules/china-shop-decoration-read-model/__tests__/shop-decoration-readonly-contract.unit.spec.ts`

## 输出内容

只读 view shape 包含：

- seller。
- market / booth。
- status。
- hero。
- announcements。
- productGroupTitles。
- credentialLabels。
- deliveryNotes。
- liveStatus。
- moduleAvailability。
- highRiskBoundaries。

所有模块均为：

- `editable: false`

整体合同为：

- `readOnly: true`
- `runtimeEnabled: false`

## 高风险阻塞项

继续保持串行阻塞：

- 商品发布。
- 库存。
- checkout shipping options。
- 订单。
- 支付。
- 退款。
- 结算。
- 佣金。
- 权限。
- 真实文件上传 / CDN。
- 真实直播 Provider。
- 真实 IM Provider。
- 履约。

## 下一步

建议继续做 `logistics-and-waybill-boundary-plan`，把统一配送、自配送、配送供应商和快递面单边界先拆清楚，再决定是否做只读 contract。
