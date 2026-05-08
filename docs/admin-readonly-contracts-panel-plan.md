# Admin Readonly Contracts Panel Plan

更新时间：2026-05-08 21:32 Asia/Shanghai

## 结论

Admin 可以做一个“平台能力只读总览”面板，帮助运营人员理解当前中国本地化能力边界，但它不能成为真实配置页、权限页或业务开关页。

本任务只做规划，不修改 `apps/admin/**`。

## 信息架构

建议页面位置：

```text
平台设置
  -> 能力合同总览
```

页面结构：

1. 总览指标
   - 已定义合同数量。
   - 高风险阻塞项数量。
   - 可展示但未生效能力数量。

2. 商户角色能力
   - 普通商品商户。
   - 物料供应商。
   - 配送供应商。
   - 养殖户/种植户。
   - 种苗供应商。
   - 外地批发商。

3. 商家运营能力
   - 手机快速上架草稿。
   - 店铺装修。
   - 物流/面单。
   - 直播状态。

4. 消费者能力
   - 提货卡消费者流程。
   - 店铺直播状态。
   - 店铺装修公开快照。

5. 高风险边界
   - 支付。
   - 订单。
   - 退款。
   - 结算。
   - 佣金。
   - 打款。
   - 权限。
   - 真实 Provider。

## 展示规则

Admin 面板只展示：

- contract 名称。
- 适用端。
- `readOnly`。
- `runtimeEnabled`。
- 可见性说明。
- blocked boundaries。
- 后续 PR 状态。

Admin 面板不提供：

- 保存按钮。
- 开关按钮。
- 审核通过按钮。
- 发布按钮。
- 删除按钮。
- 真实 Provider 配置入口。

## 数据来源

第一版 UI 可以先使用前端常量或后端只读 contract 聚合，但必须明确：

- 常量不是 runtime 配置。
- contract 不是 RBAC。
- contract 不是 feature flag。
- contract 不是结算或支付配置。

若后续做后端读取：

- 只能新增 GET 只读 route。
- 不允许 POST/PATCH/DELETE。
- route 返回 static/read-only view。
- 未登录访问应返回 401。

## UI PR 边界

后续 UI PR 可修改：

- `apps/admin/**`

但禁止：

- 修改 `packages/api/**`，除非任务明确是后端只读 GET route。
- 修改 payment/order/refund/settlement/commission/payout/permission。
- 增加真实保存逻辑。
- 引入新依赖。

## 验证要求

UI PR 至少验证：

- Admin build。
- Admin lint。
- 登录态页面 200 或人工截图。
- 页面文案明确“只读/未生效”。
- 所有操作型按钮禁用或不存在。

## 下一步

建议继续做 `vendor-readonly-contracts-panel-plan`，规划商户后台如何展示自身能力、草稿、装修、履约和直播边界。
