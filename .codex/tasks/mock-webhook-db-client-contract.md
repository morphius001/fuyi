# Task: mock-webhook-db-client-contract

## 目标

新增 local disposable Postgres adapter skeleton 和 mocked unit tests。

本任务只实现注入式 driver contract，不接 route，不启动真实 DB，不新增依赖。

## 允许修改

- `packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-webhook-db-client-contract.md`
- `docs/mock-webhook-db-client-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不接 neutral route。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
git diff --check
```

## 完成标准

- adapter 只接受注入式 driver。
- local gate 拒绝 production、未启用 local DB、危险 DB 名和远程 host。
- transaction 成功 commit，失败 rollback，始终 release。
- SQL 不写 raw payload、signature、secret 或 database URL。
- 单测纳入 payment notification harness。
- 不接 route、不写真实 DB、不调用 workflow。
