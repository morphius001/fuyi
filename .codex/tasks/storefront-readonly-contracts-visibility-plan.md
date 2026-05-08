# Task: storefront-readonly-contracts-visibility-plan

## 目标

规划 Storefront 消费者侧如何读取非支付只读 contracts，并明确哪些状态可以展示、哪些必须隐藏或保持独立入口。

本任务只做 docs-only plan，不修改 Storefront UI，不新增 API route。

## 允许修改

- `.codex/tasks/storefront-readonly-contracts-visibility-plan.md`
- `docs/storefront-readonly-contracts-visibility-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 API route。
- 不新增 migration。
- 不新增依赖。
- 不修改 checkout、cart、order、payment、refund、settlement、commission、payout、permission 或 fulfillment。
- 不把提货卡接入 checkout。
- 不把直播作为首页主入口。
- 不把物料供应商、配送供应商或上游供给默认放进消费者主商品流。

## 验证命令

```bash
git diff --check -- .codex/tasks/storefront-readonly-contracts-visibility-plan.md docs/storefront-readonly-contracts-visibility-plan.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 明确 Storefront 可展示范围。
- 明确 Storefront 必须隐藏或独立入口的能力。
- 明确后续 UI PR 的文件边界和验证要求。
