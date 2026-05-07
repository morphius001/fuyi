# local-preprod-sim-dry-run

## 目标

在本机 WSL PostgreSQL 上创建一个可丢弃的 preprod 模拟 dry-run 数据库，执行 market membership migration skeleton 的 up/down 演练，并确认无残留。

这是本地 disposable DB 演练，不连接真实预发或生产数据库。

## 允许修改

- `docs/local-preprod-sim-dry-run.md`
- `.codex/tasks/local-preprod-sim-dry-run.md`
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

## 执行命令

```bash
CODEX_DRY_RUN_DB=fuyi_market_membership_dry_run_preprod_sim_$(date +%Y%m%d%H%M%S) \
  .codex/scripts/market-membership-local-dry-run.sh
```

## 验证命令

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_market_membership_dry_run_preprod_sim_%'"

git diff --check -- docs/local-preprod-sim-dry-run.md .codex/tasks/local-preprod-sim-dry-run.md .codex/queue.md project-ledger
```

## 完成边界

- dry-run DB 必须自动清理。
- 不连接预发或生产 DB。
- 不注册真实 migration。
- 不改变 runtime、权限、checkout、订单、支付、退款、结算、佣金或履约。
