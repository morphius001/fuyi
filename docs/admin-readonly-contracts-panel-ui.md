# Admin Readonly Contracts Panel UI

更新时间：2026-05-08 22:42 Asia/Shanghai

## 结论

Admin 已新增“能力合同总览”只读页面，用于平台运营人员查看中国本地化能力合同、可见端、运行边界、高风险阻塞项和后续 PR 状态。

页面路径：

```text
/dashboard/cn/operations/capability-contracts
```

## 范围

本轮只修改 Admin 前端展示：

- 新增平台设置菜单项：能力合同总览。
- 新增只读面板组件和前端静态合同数据。
- 补齐 zh-CN / en 翻译。
- 不新增后端 route。
- 不新增保存、发布、审核、删除或开关生效动作。

## 展示内容

- 商户与供应方角色：普通商户、物料供应商、配送供应商、养殖户 / 种植户、种苗供应商、外地批发商。
- 商家运营能力：手机快速上架、店铺装修、快递打印 / 电子面单、店铺直播状态。
- 消费者可见能力：提货卡消费者流程、店铺直播标识、店铺公开快照。
- 高风险串行边界：支付、订单、退款、结算、佣金、打款、权限、真实 Provider。

## 安全边界

该页面不是：

- feature flag。
- RBAC。
- 支付配置。
- 结算配置。
- 真实 Provider 配置。
- 订单、退款、履约或资金流的事实来源。

支付、订单、退款、结算、佣金、打款、权限和真实 Provider 仍必须作为高风险串行任务单独推进。

## 验证

- Admin lint。
- Admin build。
- `git diff --check`。
- 后续可登录 Admin 人工访问 `/dashboard/cn/operations/capability-contracts` 做视觉 smoke。
