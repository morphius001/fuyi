# Local Preprod Simulation Dry-Run

更新时间：2026-05-07 13:05 Asia/Shanghai

## 结论

本地 disposable preprod 模拟 dry-run 已通过。

本轮没有连接真实预发或生产数据库。执行目标为本机 WSL PostgreSQL `127.0.0.1:15432` 上临时创建的可丢弃数据库：

```text
fuyi_market_membership_dry_run_preprod_sim_20260507130339
```

该临时库已在脚本退出时自动删除，复查无残留。

## 执行命令

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
source ~/.nvm/nvm.sh
nvm use 24
CODEX_DRY_RUN_DB=fuyi_market_membership_dry_run_preprod_sim_20260507130339 \
  .codex/scripts/market-membership-local-dry-run.sh
```

## 执行输出摘要

```text
CREATE disposable dry-run database: fuyi_market_membership_dry_run_preprod_sim_20260507130339
APPLY migration up SQL
CHECK tables and constraints
CHECK row counts
1|1|1|1|1|1
APPLY migration down SQL
CHECK rollback removed dry-run tables
PASS market membership local dry-run completed and disposable database will be dropped.
```

## 已验证

- migration up SQL 可执行。
- 6 张 dry-run 表创建成功：
  - `china_market`
  - `china_market_membership`
  - `china_seller_role`
  - `china_market_announcement`
  - `china_market_business_hour`
  - `china_market_delivery_profile`
- 最小 fixture 插入成功。
- row count 为 `1|1|1|1|1|1`。
- `checkout_impact` 非 `none` 的错误值被约束拒绝。
- announcement audience 错误值被约束拒绝。
- migration down SQL 可执行。
- down 后 6 张表均不存在。
- 临时数据库自动 drop。
- 复查 `pg_database` 无 `fuyi_market_membership_dry_run_preprod_sim_%` 残留。

## 未执行

本轮没有：

- 连接真实预发 DB。
- 连接生产 DB。
- 注册真实 migration。
- 运行 production seed。
- 写入真实手机号、证照、订单、支付、退款、物流或 provider credential。
- 修改 `apps/**` 或 `packages/**`。
- 修改 checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 与真正 preprod dry-run 的关系

这次只是本地模拟，不等于真正预发 dry-run。

它证明：

- migration skeleton 的 SQL up/down 在可丢弃库中可执行。
- 基础约束能拦住明显错误数据。
- rollback 能清理表结构。

它不能证明：

- 真实预发网络、权限、备份和回滚路径可用。
- 真实预发只读 API 在目标库上三态全通过。
- 真实 deployment / migration registration 安全。

## 下一步边界

`preprod-disposable-db-dry-run-execution` 仍为 `blocked-external`。

要进入真正预发 dry-run，仍需要用户提供：

- disposable preprod DB host / port / database / user。
- 密码只在本地 shell session 输入，不写仓库。
- 备份或无需备份确认。
- rollback 方式。
- 执行窗口。
- 可删除、可重建、无生产数据确认。
