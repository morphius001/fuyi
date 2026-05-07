# local-disposable-migration-registration-rehearsal

## 目标

用本地 disposable DB 模拟 market membership migration 注册前的检查顺序，但不注册生产 migration、不连接预发/生产 DB、不改变运行时。

## 允许修改

- `.codex/scripts/market-membership-registration-rehearsal.sh`
- `.codex/tasks/local-disposable-migration-registration-rehearsal.md`
- `docs/local-disposable-migration-registration-rehearsal.md`
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

## 验证命令

```bash
.codex/scripts/market-membership-registration-rehearsal.sh
git diff --check
bash -n .codex/scripts/market-membership-registration-rehearsal.sh
bunx prettier --check .codex/tasks/local-disposable-migration-registration-rehearsal.md docs/local-disposable-migration-registration-rehearsal.md .codex/queue.md
```

## 完成边界

- 只使用本地 PostgreSQL disposable DB。
- DB 名称必须以 `fuyi_market_membership_dry_run_` 开头。
- 执行后必须确认没有临时库残留。
- 不允许把 `china-market-membership` 注册进 `medusa-config.ts`。
- 不允许进入预发/生产库。
