# migration-registration-design-review

## 目标

对 market membership 真实 migration 注册做 docs-only 设计评审，明确注册点、部署顺序、回滚策略、验证证据和禁止事项。

## 允许修改

- `.codex/tasks/migration-registration-design-review.md`
- `docs/migration-registration-design-review.md`
- `.codex/queue.md`

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

## 必须覆盖

- 当前 migration skeleton 仍然未注册运行时。
- 注册前必须完成 local rehearsal、repository integration、Admin/Store/Vendor read-only fallback 证据。
- 预发 disposable DB dry-run 必须单独执行，不能在本任务连接外部 DB。
- 真实 migration 注册 PR 必须小范围，只注册 migration，不写 seed、不切 runtime、不加 Admin 写接口。
- rollback 必须至少覆盖 down SQL、部署回退、read-only fallback 和 feature flag。

## 验证命令

```bash
git diff --check
bunx prettier --check .codex/tasks/migration-registration-design-review.md docs/migration-registration-design-review.md .codex/queue.md
```

## 完成边界

- 只输出评审文档和队列状态。
- 不执行 DB 命令。
- 不注册 migration。
- 不修改业务代码。
