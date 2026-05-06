# market-membership-local-migration-dry-run

## 目标

新增并执行本地可丢弃 PostgreSQL dry-run 脚本，验证 market membership migration skeleton 的 up/down、约束和最小测试数据。

## 允许修改

- `.codex/scripts/market-membership-local-dry-run.sh`
- `docs/market-membership-local-migration-dry-run.md`
- `.codex/tasks/market-membership-local-migration-dry-run.md`
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
.codex/scripts/market-membership-local-dry-run.sh
git diff --check
```

## 完成边界

- 只使用 `fuyi_market_membership_dry_run_*` 临时数据库。
- 脚本必须拒绝非 dry-run 前缀数据库名。
- 脚本退出时必须清理临时数据库。
- 不运行生产 migration。
- 不写生产 seed。
