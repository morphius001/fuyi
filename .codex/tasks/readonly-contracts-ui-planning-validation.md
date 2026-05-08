# Task: readonly-contracts-ui-planning-validation

## 目标

汇总 Admin、Vendor、Storefront 三端只读合同面板/可见性规划完成状态，确认下一步是否可以进入 UI PR。

## 允许修改

- `.codex/tasks/readonly-contracts-ui-planning-validation.md`
- `docs/readonly-contracts-ui-planning-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 API route。
- 不新增 migration。
- 不新增依赖。
- 不修改 checkout、订单、支付、退款、结算、佣金、打款、权限或履约逻辑。

## 验证命令

```bash
git diff --check -- .codex/tasks/readonly-contracts-ui-planning-validation.md docs/readonly-contracts-ui-planning-validation.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 记录 Admin/Vendor/Storefront 规划已完成。
- 记录下一轮 UI PR 建议顺序。
- 记录仍然禁止真实写接口和交易链路改动。
