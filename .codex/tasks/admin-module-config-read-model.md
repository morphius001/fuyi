# Task: admin-module-config-read-model

## 目标

设计 Admin 模块开关的真实只读配置模型落地方案，为后续“可编辑配置”做准备，但本任务不让任何模块开关真实影响权限、菜单、订单、支付、结算或履约。

核心目标：

- 从当前 `/admin/china/capabilities` 只读 capability contract，演进到可读取的配置模型计划。
- 先定义平台级、市场级、商户类型级、商户覆盖级配置的读取边界。
- 明确 UI 只读展示、草稿、发布、审计和回滚的后续 PR 顺序。

## 允许修改

- `docs/admin-module-config-read-model.md`
- `docs/admin-feature-flag-backend-split.md`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止让模块开关真实生效
- 禁止修改权限、RBAC、菜单真实显隐、支付、订单、退款、结算、佣金、履约逻辑
- 禁止写真实运营配置到生产环境

## 要求

- 先读取 `AGENTS.md`、`.codex/queue.md`、`project-ledger/status.md`、`docs/post-merge-validation-report.md`、`docs/admin-module-config-contract-design.md`。
- 设计只读模型字段和来源，但不要实现 migration。
- 区分 `capability view`、`draft config`、`published config`、`effective config`。
- 明确 Admin 看到配置不等于业务已经生效。
- 给出后续 PR 顺序和验证命令。

## 验证

```bash
git diff --check -- docs/admin-module-config-read-model.md docs/admin-feature-flag-backend-split.md project-ledger .codex/queue.md
git diff --name-status
```

## 输出

- 修改文件
- 验证结果
- 风险点
- 下一步建议
