# admin-readonly-contracts-panel-ui

## 目标

在 `apps/admin` 增加“能力合同总览”只读页面，让平台运营人员能看到中国本地化能力的可见端、运行边界、高风险阻塞项和后续 PR 状态。

## 允许修改

- `apps/admin/**`
- `.codex/tasks/admin-readonly-contracts-panel-ui.md`
- `.codex/queue.md`
- `docs/admin-readonly-contracts-panel-ui.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- `apps/vendor/**`
- `apps/storefront/**`
- 支付、订单、退款、结算、佣金、打款、权限、checkout、真实履约或真实 Provider runtime
- 真实保存、发布、审核通过、删除、开关生效或 Provider 配置入口
- 新依赖、真实密钥、真实商户号

## UI 要求

- 菜单位置：平台设置 / 能力合同总览。
- 页面必须明确“只读”“不生效”“不是 feature flag / RBAC / 支付或结算配置”。
- 展示商户角色、商家运营能力、消费者可见能力和高风险串行边界。
- 所有按钮必须禁用或仅作为占位，不产生业务动作。
- 不新增后端 route，第一版使用前端静态 read-only data。

## 验证

- `cd apps/admin && bun run lint`
- `cd apps/admin && bun run build`
- `git diff --check`
- 人工检查页面路径 `/dashboard/cn/operations/capability-contracts` 可作为 Admin 登录态 smoke 目标。
