# market-membership-db-dry-run-plan

## 目标

规划 market membership migration 的本地/预发 dry-run、rollback、空表兼容和只读 API 验证。

## 允许修改

- `docs/market-membership-db-dry-run-plan.md`
- `.codex/tasks/market-membership-db-dry-run-plan.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
git diff --check
```

## 完成边界

- 只写计划。
- 不运行 migration。
- 不写 seed。
- 不改真实数据库。
- 不启用真实业务流程。
