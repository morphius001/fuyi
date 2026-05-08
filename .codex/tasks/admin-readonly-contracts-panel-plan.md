# Task: admin-readonly-contracts-panel-plan

## 目标

规划 Admin 只读合同总览面板，用于平台运营后台查看商户角色、店铺装修、物流/面单、提货卡、直播等能力边界。

本任务只做 docs-only plan，不修改 Admin UI，不新增 API route。

## 允许修改

- `.codex/tasks/admin-readonly-contracts-panel-plan.md`
- `docs/admin-readonly-contracts-panel-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 API route。
- 不新增 migration。
- 不新增依赖。
- 不新增权限逻辑。
- 不修改支付、订单、退款、结算、佣金、打款、履约或 Provider runtime。

## 验证命令

```bash
git diff --check -- .codex/tasks/admin-readonly-contracts-panel-plan.md docs/admin-readonly-contracts-panel-plan.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 明确 Admin 面板信息架构。
- 明确哪些合同可展示、哪些不可作为真实开关。
- 明确后续 UI PR 的文件边界和验证要求。
