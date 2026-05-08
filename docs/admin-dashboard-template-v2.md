# Admin Dashboard Template V2

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮落地平台运营首页 v2 的第一版展示层。首页继续只使用前端展示数据，不接真实后端指标，不改变任何权限、审计或交易事实来源。

## 本轮改动

- KPI 卡高度收紧，避免一张指标卡占据过多首屏空间。
- 在 KPI 下方新增数据来源条，明确当前指标为展示数据。
- 保留运营待办和风险提醒两列首屏结构。
- 快捷入口新增“能力合同”，仍为只读禁用入口。
- 新增“近期重点模块”列表，聚焦商品审核、市场配送、提货卡和服务通知。
- 中英文 i18n 同步补齐，避免 key 泄漏。

## 未做内容

- 不接真实订单、支付、库存、结算、权限或履约接口。
- 不新增 API route。
- 不修改 RBAC、audit、order、payment、refund、settlement、commission、payout、permission 或 fulfillment runtime。
- 不执行审核、退款、结算、打款、发货、冻结或配置生效操作。

## 验证结果

- `cd apps/admin && bun run lint` 通过。
- `cd apps/admin && bun run build` 通过。
- `git diff --check` 通过。
- `http://127.0.0.1:7000/dashboard/cn` 返回 200。

## 风险

- 本页仍是展示数据，不是运营真实报表。
- 快捷入口仍是禁用只读按钮，不能代表真实权限或审计链路。
- 后续接真实数据时必须单独做后端 read model、权限、审计和可回滚配置。

## 回滚方式

本轮只改 Admin 首页展示组件、展示常量、i18n 和任务/ledger 文档。回滚本 PR 即可恢复上一版首页，无需数据迁移或服务回滚。
