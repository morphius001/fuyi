# Local Disposable Migration Registration Rehearsal

更新时间：2026-05-07 Asia/Shanghai

## 范围

本任务验证 market membership migration skeleton 进入真实注册前的本地 rehearsal 顺序。

它不会：

- 注册 production migration。
- 修改 `packages/api/medusa-config.ts`。
- 写 production seed。
- 连接预发或生产 DB。
- 修改 `apps/**` 或 `packages/**` 业务代码。
- 改 checkout、购物车、配送方式、订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 脚本

新增脚本：

```bash
.codex/scripts/market-membership-registration-rehearsal.sh
```

脚本执行顺序：

1. 拒绝非本地 PostgreSQL host。
2. 确认 `china-market-membership` 未出现在 `packages/api/medusa-config.ts`，避免误注册运行时。
3. 确认 migration skeleton 存在，并包含 6 张预期表。
4. 用唯一 disposable DB 跑 `.codex/scripts/market-membership-local-dry-run.sh`。
5. 用另一个唯一 disposable DB 跑 `.codex/scripts/market-membership-repository-integration-test.sh`。
6. 查询 `postgres.pg_database`，确认两个 disposable DB 都已清理。

## 本轮验证结果

已执行：

```bash
.codex/scripts/market-membership-registration-rehearsal.sh
```

结果：passed.

覆盖：

- migration skeleton 存在且未注册到 `medusa-config.ts`。
- `china_market`、`china_market_membership`、`china_seller_role`、`china_market_announcement`、`china_market_business_hour`、`china_market_delivery_profile` 六张表存在于 skeleton。
- 本地 up/down dry-run 通过。
- repository integration ready / filter / fallback 通过。
- `checkout_impact = none`。
- `runtime_enabled = false`。
- disposable DB cleanup 通过，无临时库残留。

同时验证：

```bash
git diff --check
bash -n .codex/scripts/market-membership-registration-rehearsal.sh
bunx prettier --check .codex/tasks/local-disposable-migration-registration-rehearsal.md docs/local-disposable-migration-registration-rehearsal.md .codex/queue.md
```

结果：passed.

## 安全边界

本任务仍然只是本地 disposable DB rehearsal。它没有让 migration 进入真实运行路径，也没有让模块开关、市场配置、配送规则或商户类型影响 runtime。

后续如果进入真实 migration 注册，必须先完成：

- Admin authenticated browser QA，或明确记录继续缺口。
- 预发 disposable DB dry-run，且目标库必须由用户确认可丢弃。
- migration registration design review。
- rollback 和关闭开关方案。
