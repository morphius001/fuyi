# Market Membership Repository Integration Test

更新时间：2026-05-07 Asia/Shanghai

## 目标

新增本地 disposable DB 脚本，验证 market membership repository reader 的 SQL 合同。它不连接预发或生产数据库，不注册 production migration，不写 production seed。

## 脚本

```bash
.codex/scripts/market-membership-repository-integration-test.sh
```

默认连接：

- host: `127.0.0.1`
- port: `15432`
- user: 当前 WSL 用户
- database: `fuyi_market_membership_dry_run_repo_<timestamp>`

安全保护：

- 数据库名必须以 `fuyi_market_membership_dry_run_` 开头。
- 默认拒绝非 `127.0.0.1` / `localhost` host。
- 只有脚本成功创建的数据库才会在退出时自动删除。
- 不写真实商户、真实手机号、真实证照、真实订单、真实 provider credential。

## 覆盖内容

1. Missing table
   - migration up 前确认 required table 不存在。

2. Repository ready
   - 创建两个市场。
   - 当前 seller 拥有两个 market membership。
   - 按 membership market ids 查询 market 时使用 `china_market.id`。
   - 验证 markets / memberships / roles / announcements / business hours / delivery profiles 行数。

3. Seller-owned market filter
   - 使用当前 seller 拥有的 secondary market。
   - 只返回该 market 的 market row 和 membership。
   - 没有该 market 的 announcement / delivery profile 时返回空。

4. No-membership fallback
   - 当前 seller 没有 membership 时，membership 和 market rows 为 0。

5. Safety flags
   - `checkout_impact` 保持 `none`。
   - `runtime_enabled` 保持 `false`。

6. Rollback
   - 执行 down SQL。
   - 6 张表全部删除。
   - 临时数据库自动清理。

## 验证结果

已验证：

- `.codex/scripts/market-membership-repository-integration-test.sh`: passed.
- ready row counts: `2|2|2|2|2|2`.
- seller-owned market filter row counts: `1|1|0|0`.
- no-membership fallback row counts: `0|0`.
- checkout impact: `none`.
- runtime enabled: `false`.
- down migration removed 6 tables.
- disposable database cleanup enabled.
- `bash -n .codex/scripts/market-membership-repository-integration-test.sh`: passed.
- `git diff --check`: passed.
- `prettier --check` for docs/task/queue markdown files: passed.

## 安全边界

本轮没有：

- 修改 `apps/**` 或 `packages/**`。
- 修改 migration SQL。
- 写 production seed。
- 连接预发或生产数据库。
- 接入真实支付、短信、IM、物流、直播或 AI provider。
- 改变 checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。
