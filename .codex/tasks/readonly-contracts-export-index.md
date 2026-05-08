# Task: readonly-contracts-export-index

## 目标

建立非支付只读 contracts 索引，说明后续 Admin、Vendor、Storefront 可以读取哪些 view shape，以及哪些字段或边界不能被当成真实业务生效。

## 允许修改

- `.codex/tasks/readonly-contracts-export-index.md`
- `docs/readonly-contracts-export-index.md`
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
git diff --check -- .codex/tasks/readonly-contracts-export-index.md docs/readonly-contracts-export-index.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 列出当前只读 contracts。
- 标明 Admin/Vendor/Storefront 可读范围。
- 标明禁止把 contract 当真实 runtime 开关或业务事实。
- 给出下一步三端面板规划任务。
