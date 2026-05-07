# market-membership-repository-integration-test

## 目标

使用本地 disposable PostgreSQL 数据库验证 market membership repository reader 的 SQL 合同：ready、seller-owned market filter、missing-table、no-membership fallback。

## 允许修改

- `.codex/scripts/market-membership-repository-integration-test.sh`
- `docs/market-membership-repository-integration-test.md`
- `.codex/tasks/market-membership-repository-integration-test.md`
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
- 真实微信支付、支付宝、短信、IM、物流、直播、AI provider

## 验证命令

```bash
.codex/scripts/market-membership-repository-integration-test.sh
bash -n .codex/scripts/market-membership-repository-integration-test.sh
git diff --check
bun run prettier --check docs/market-membership-repository-integration-test.md .codex/tasks/market-membership-repository-integration-test.md .codex/queue.md
```

## 完成边界

- 只使用 `fuyi_market_membership_dry_run_*` 临时数据库。
- 脚本必须拒绝非 dry-run 前缀数据库名。
- 默认只允许 localhost/127.0.0.1。
- 脚本退出时只删除自己成功创建的临时库。
- 不注册 production migration。
- 不写 production seed。
