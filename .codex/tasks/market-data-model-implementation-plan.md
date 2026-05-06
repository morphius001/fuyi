# Task: market-data-model-implementation-plan

## 目标

为下一阶段“真实市场/商户/档口数据跑通”制定可执行落地计划，可以写设计文档和拆 PR 清单，但本任务不直接写业务代码。

核心目标：

- 把市场、商户、档口号、跨市场经营、商户类型、营业时间、公告、配送规则从当前 mock/read-only 过渡到可落库的后端模型计划。
- 明确哪些字段先只读展示，哪些字段未来会影响 Storefront 发现、Vendor 工作台、Admin 配置和 checkout。
- 明确 migration、seed、Admin 写接口、Store 读接口、权限审计的拆分顺序。

## 允许修改

- `docs/market-data-model-implementation-plan.md`
- `docs/china-localization-task-list.md`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止修改支付、订单、退款、结算、佣金、权限业务逻辑
- 禁止让市场配送规则真实影响 checkout shipping options
- 禁止接入真实物流、短信、IM、直播、AI、支付或快递打印服务

## 要求

- 先读取 `AGENTS.md`、`.codex/queue.md`、`project-ledger/status.md`、`docs/post-merge-validation-report.md`、`docs/market-model-backend-design.md`。
- 输出 PR 拆分，至少包含：
  - 数据模型/migration 计划
  - seed/demo 数据计划
  - Store 只读查询计划
  - Admin 配置写入计划
  - Vendor 读取/展示计划
  - 回滚和审计计划
- 标清高风险边界：任何影响支付、订单、履约、结算、权限的逻辑都必须另开串行 PR。

## 验证

```bash
git diff --check -- docs/market-data-model-implementation-plan.md docs/china-localization-task-list.md project-ledger .codex/queue.md
git diff --name-status
```

## 输出

- 修改文件
- 验证结果
- 风险点
- 下一步建议
