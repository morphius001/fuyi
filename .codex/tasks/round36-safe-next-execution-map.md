# round36-safe-next-execution-map

## 目标

在自动队列已经只剩 `blocked-external` 的情况下，整理下一阶段安全执行图，明确哪些任务可以继续 docs-only，哪些必须等待外部预发 DB，哪些属于高风险串行。

本任务只做文档和 ledger 更新，不修改业务代码。

## 允许修改

- `docs/round36-safe-next-execution-map.md`
- `.codex/tasks/round36-safe-next-execution-map.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- migration SQL
- production seed
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
git diff --check -- docs/round36-safe-next-execution-map.md .codex/tasks/round36-safe-next-execution-map.md .codex/queue.md project-ledger
```

## 完成边界

- 不执行 DB 命令。
- 不注册真实 migration。
- 不实现 Admin 写接口或 runtime switch。
- 不推进支付、退款、对账、结算、佣金、权限或真实履约。
