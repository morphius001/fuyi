# preprod-market-membership-dry-run-checklist

## 目标

把预发 disposable DB dry-run 的执行条件、禁止事项、备份/回滚、验收和退出标准写清楚。当前只做 checklist，不连接、不修改任何真实数据库。

## 允许修改

- `docs/preprod-market-membership-dry-run-checklist.md`
- `.codex/tasks/preprod-market-membership-dry-run-checklist.md`
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
git diff --check
bunx prettier --check docs/preprod-market-membership-dry-run-checklist.md .codex/tasks/preprod-market-membership-dry-run-checklist.md .codex/queue.md
```

## 完成边界

- 不执行 `psql`、`createdb`、`dropdb`、migration、seed 或任何预发 DB 命令。
- checklist 必须明确目标库必须是 disposable，且不能含生产数据。
- checklist 必须要求用户显式确认目标库、备份/无需备份、回滚方式和退出条件。
