# Admin Write API And Runtime Switch Plan

更新时间：2026-05-07 Asia/Shanghai

## 结论

Admin 写接口和 runtime switch 必须分两阶段。

第一阶段只能让平台运营后台保存配置草稿、发布版本和审计记录；第二阶段才允许 runtime 读取 effective config。不能把“保存配置”做成“立即影响前台、商户后台、checkout、订单或权限”。

## 目标对象

后续 Admin 配置可能覆盖：

- 市场配置：市场名称、区域、营业时间、公告、服务范围。
- 商户市场关系：商户属于哪个市场、档口号、跨市场经营。
- 商户类型开关：海鲜水产、水果蔬菜、市场物料、种苗、养殖户、种植户、外地批发商、配送供应商等。
- 模块开关：直播、提货卡、客服、快速上架、店铺装修、物料供应、统一配送能力等。
- 配送能力：商家自配送、市场统一配送、到店自提、配送供应商承接。

## 非目标

本计划不做：

- 写接口实现。
- runtime 生效。
- 权限规则修改。
- checkout、购物车、配送方式、订单、支付、退款、结算、佣金或真实履约修改。
- 真实短信、IM、物流、直播、AI、微信支付或支付宝 provider。

## 数据层建议

未来写接口应拆成三层：

### Draft Config

用途：

- 保存运营编辑中的草稿。
- 可反复修改。
- 不影响 runtime。

要求：

- 带 `version`。
- 带 `updated_by`、`updated_at`。
- 支持校验错误列表。
- 支持 preview。

### Published Config

用途：

- 记录已发布版本。
- 可回滚到旧版本。
- 仍不直接代表 runtime 已使用。

要求：

- 发布动作必须生成审计日志。
- 发布前必须校验依赖，例如市场是否存在、商户类型是否可用、配送能力是否有 fallback。
- 必须记录 `published_by`、`published_at`、`change_reason`。

### Effective Runtime Config

用途：

- runtime 只读读取。
- 与写接口隔离。
- 可以通过 feature flag 控制是否启用。

要求：

- 默认关闭。
- 读取失败时 fallback。
- 不允许直接由 Admin 表单保存动作修改。
- 需要独立 rollout / rollback。

## API 拆分建议

### PR BW1: Admin Config Draft Write API Design

Scope:

- docs-only 或类型合同。
- 设计 draft save / validate / preview。

Non-goals:

- 不实现 route。
- 不写 DB。

### PR BW2: Admin Config Write API Skeleton

Scope:

- 新增写接口 skeleton。
- 所有写入只进入 draft。
- 需要权限和审计 placeholder。

Non-goals:

- 不发布。
- 不影响 runtime。
- 不影响权限、checkout、订单、履约或支付。

### PR BW3: Publish And Rollback Design

Scope:

- 设计发布、回滚、版本 diff、审批和审计。

Non-goals:

- 不让 runtime 生效。

### PR BW4: Runtime Effective Config Readonly

Scope:

- 新增 runtime effective config 只读 reader。
- 默认 disabled。
- 读取失败 fallback。

Non-goals:

- 不接入 checkout。
- 不影响菜单权限。

### PR BW5: Runtime Switch Rollout

Scope:

- 小范围让某个低风险 UI 读取 effective config。
- 必须有 feature flag 和 rollback。

Non-goals:

- 不从支付、订单、退款、结算、佣金、权限开始。

## 安全规则

所有写接口必须：

- 只允许 Admin operator 权限。
- 写入前做 schema validation。
- 使用 idempotency key 或版本号防止重复提交。
- 记录 request id、operator id、before/after diff、reason。
- 不写真实密钥。
- 不保存 provider credentials。
- 不把模块开关直接用于资金、订单或权限判断。

所有 runtime 读取必须：

- 默认关闭。
- 读取异常 fallback。
- 区分 draft / published / effective。
- 暴露 `source` 和 `version` 供排障。
- 保留手动回滚路径。

## 风险拆分

低风险：

- docs-only 设计。
- draft schema/type。
- preview 不保存。
- read-only effective config disabled。

中风险：

- Admin draft write API。
- publish / rollback。
- 审计日志。

高风险：

- runtime switch 生效。
- 影响商户入驻、商品发布、配送承接、直播、提货卡等可见功能。

最高风险，必须单独串行：

- checkout。
- 订单。
- 支付。
- 退款。
- 对账。
- 商家结算。
- 佣金。
- 权限。
- 真实履约。

## Rollback

最低 rollback 方案：

1. 关闭 runtime feature flag。
2. runtime reader fallback 到 static/default config。
3. Admin draft/published 数据保留，不删除。
4. 如发布版本有误，发布 rollback version。
5. 若写接口 bug 导致脏数据，另起 data correction 任务，不直接手工删库。

## 验收标准

后续实现前必须确认：

- 写接口和 runtime 生效分离。
- draft 保存不会改变任何用户可见行为。
- published 版本不会自动影响 checkout、订单、支付、退款、结算、佣金、权限或真实履约。
- effective config 默认关闭并可回滚。
- 每个任务都有单测或手动验证。

## 本轮验证

本任务只做 docs-only 计划：

```bash
git diff --check
bunx prettier --check .codex/tasks/admin-write-api-runtime-switch-plan.md docs/admin-write-api-runtime-switch-plan.md .codex/queue.md
```

结果：passed.
