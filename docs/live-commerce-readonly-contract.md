# Live Commerce Readonly Contract

更新时间：2026-05-08 20:45 Asia/Shanghai

## 结论

本轮新增直播只读 contract，不新增 API route、不注册模块、不调用 `MockLiveProvider`、不接真实直播。

合同文件：

- `packages/api/src/modules/china-live-commerce-read-model/live-commerce-readonly-contract.ts`
- `packages/api/src/modules/china-live-commerce-read-model/__tests__/live-commerce-readonly-contract.unit.spec.ts`

## 展示位置

允许只读展示：

- 店铺卡片直播标识。
- 店铺主页直播状态。
- Vendor 预告/回放占位。
- Admin 审核/风控占位。

禁止作为：

- 消费者首页主入口。

## 高风险阻塞项

继续保持串行阻塞：

- 真实推流。
- 真实 IM。
- 聊天室。
- 礼物/打赏。
- 直播间下单。
- 支付。
- 退款。
- 结算。
- 佣金。
- 权限。
- 开播通知。
- 履约。

## 下一步

第九十三轮非支付 backlog 已收口到 `live-commerce-readonly-contract`。后续建议新增下一轮 validation 任务，对 PR #201-#211 及本 PR 合并后的 API focused tests、API typecheck、ledger 状态做一次总验证。
