# Market Membership Local Migration Dry-Run

更新时间：2026-05-07 Asia/Shanghai

## 目标

提供一个只针对本地可丢弃数据库的 dry-run 脚本，验证 market membership migration skeleton 的 SQL up/down、基础约束和最小测试数据。

## 脚本

```bash
.codex/scripts/market-membership-local-dry-run.sh
```

默认连接：

- host: `127.0.0.1`
- port: `15432`
- user: 当前 WSL 用户
- database: `fuyi_market_membership_dry_run_<timestamp>`

脚本只允许使用 `fuyi_market_membership_dry_run_` 前缀的临时数据库名，并在退出时自动删除该数据库。

安全保护：

- 只会删除本次脚本成功创建的临时库。
- 如果同名 dry-run 库已经存在，脚本会失败退出，但不会删除已有库。
- 默认只允许连接 `127.0.0.1` 或 `localhost`。如果确实要连接预发 disposable DB，必须显式设置 `CODEX_ALLOW_REMOTE_DRY_RUN=1`。

## 验证内容

- 从 `packages/api/src/modules/china-market-membership/migrations/Migration20260507000100.ts` 提取 `this.addSql` SQL blocks。
- 在临时数据库执行 up SQL。
- 检查 6 张表存在：
  - `china_market`
  - `china_market_membership`
  - `china_seller_role`
  - `china_market_announcement`
  - `china_market_business_hour`
  - `china_market_delivery_profile`
- 插入 dry-run fixture，不使用真实商户、真实手机号、真实证照、真实订单或真实 provider credential。
- 验证 `checkout_impact = 'none'` 和 announcement audience check constraint 会拒绝错误值。
- 执行 down SQL。
- 确认 6 张 dry-run 表已删除。

## 本地执行结果

已在 MyCustomWSL 本地 PostgreSQL `127.0.0.1:15432` 执行：

```bash
.codex/scripts/market-membership-local-dry-run.sh
```

结果：

- Migration up SQL: passed.
- Table existence check: passed.
- Fixture inserts: passed.
- Constraint rejection checks: passed.
- Row counts: `1|1|1|1|1|1`.
- Migration down SQL: passed.
- Rollback table removal check: passed.
- Disposable database cleanup: passed; no `fuyi_market_membership_dry_run_*` database remained after the run.
- Bad database name refusal check: passed.
- Existing same-name dry-run database safety check: passed.
- Non-local PostgreSQL host refusal check: passed.
- `git diff --check`: passed.
- `prettier --check` for the new task/doc/queue markdown files: passed.

## 安全边界

本任务没有：

- 修改真实业务数据库。
- 写入生产 seed。
- 接入真实支付、短信、IM、物流、直播或 AI provider。
- 修改 checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。
- 修改 Admin、Vendor、Storefront UI。

## 下一步

下一轮可以拆：

1. `market-membership-seed-fixture`: 只做测试 fixture，不进生产 seed。
2. `vendor-market-context-db-qa`: 用 dry-run fixture 验证 Vendor route repository/fallback 三态。
3. `admin-market-membership-browser-qa`: 用 dry-run fixture 验证 Admin 市场详情 ready/empty/fallback。
