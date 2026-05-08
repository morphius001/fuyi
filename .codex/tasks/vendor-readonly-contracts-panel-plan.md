# Task: vendor-readonly-contracts-panel-plan

## 目标

规划 Vendor 只读合同总览面板，让商户看到自身角色、手机草稿、店铺装修、履约/面单、直播和提货履约相关边界。

本任务只做 docs-only plan，不修改 Vendor UI，不新增 API route。

## 允许修改

- `.codex/tasks/vendor-readonly-contracts-panel-plan.md`
- `docs/vendor-readonly-contracts-panel-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 API route。
- 不新增 migration。
- 不新增依赖。
- 不发布商品。
- 不创建库存、履约单、运单、直播间、提货单。
- 不修改订单、支付、退款、结算、佣金、打款、权限或 Provider runtime。

## 验证命令

```bash
git diff --check -- .codex/tasks/vendor-readonly-contracts-panel-plan.md docs/vendor-readonly-contracts-panel-plan.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 明确 Vendor 面板信息架构。
- 明确商户可见和不可操作的边界。
- 明确后续 UI PR 的文件边界和验证要求。
