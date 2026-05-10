# Refund Schema Constraint Migration Rehearsal

更新时间：2026-05-10 Asia/Shanghai

## 结论

已新增本地 disposable PostgreSQL rehearsal 脚本：

```bash
.codex/scripts/refund-schema-constraint-migration-rehearsal.sh
```

脚本只在本地一次性 DB 中验证当前 refund schema / constraint migration skeleton 的 SQL 语义。它不注册 module，不新增 route，不连接预发 / 生产，不调用 provider refund API，不执行 workflow，也不改变退款成功、结算、佣金、打款、权限、履约或物流状态。

## Disposable DB Guard

默认 DB 名：

```text
fuyi_refund_schema_constraint_dry_run_<timestamp>
```

脚本会拒绝：

- unsafe DB name。
- 非 `localhost` / `127.0.0.1` / `::1` host。
- production / prod / preprod / staging env hint。
- 已注册 `china-payment-notification` 的 `medusa-config.ts`。
- staged files 中任何不在 migration rehearsal allowlist 内的路径。
- 缺少 `psql`、`createdb`、`dropdb` 或 Node。
- PostgreSQL 未就绪。

## Rehearsal Coverage

脚本从当前 shared inbox migration skeleton 提取 up / down SQL，在 disposable DB 内验证 migration 自带约束：

- 应用 base schema。
- `processing_status` constraint 保留 payment statuses 并支持 refund-only statuses。
- event log `action` constraint 保留 payment actions 并支持 refund audit actions。
- `actor_type` 支持 `system_job`、`admin`、`vendor` 等 refund audit actor。
- positive amount check 生效。
- 递归 metadata redaction helper / constraint 生效。
- `(provider, provider_refund_id)` 普通索引存在，避免误设 unique。

脚本验证：

- existing payment statuses 可写入 / 更新。
- existing payment event actions 可写入。
- refund-only statuses 可写入 / 更新。
- refund audit actions 可写入。
- `system`、`provider`、`operator`、`system_job`、`admin`、`vendor` actor 可写入。
- forbidden refund status 被拒绝。
- forbidden runtime action 被拒绝。
- unknown actor 被拒绝。
- zero / negative amount 被拒绝。
- non-CNY 被拒绝。
- `provider + idempotency_key` duplicate 被拒绝。
- top-level sensitive / executable metadata 被拒绝。
- nested sensitive / executable metadata 被拒绝。
- down SQL 移除 tables。
- down SQL 移除 metadata helper。
- drop DB 后无残留。

## 已执行验证

本轮已执行：

```bash
.codex/scripts/refund-schema-constraint-migration-rehearsal.sh
CODEX_DRY_RUN_DB=unsafe_refund_schema .codex/scripts/refund-schema-constraint-migration-rehearsal.sh
NODE_ENV=production .codex/scripts/refund-schema-constraint-migration-rehearsal.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/payment-db-inbox-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
git diff --check
```

结果：

- Schema constraint rehearsal positive run：通过，drop cleanup 后无残留 DB。
- Unsafe DB name guard：拒绝 `unsafe_refund_schema`。
- Production env guard：`NODE_ENV=production` 被拒绝。
- Focused payment / refund / local PG tests：3 suites / 29 tests passed。
- API typecheck passed。
- Payment notification harness：40 suites / 301 tests passed。
- Payment DB dry-run row count：`2|9`。
- Existing refund inbox real-adapter rehearsal：row count `1|8`，down/drop cleanup 后无残留 DB。
- `git diff --check` passed。

## Safety Boundary

本轮仍保持：

- 不修改真实 migration。
- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不注册 module。
- 不新增 route。
- 不接真实 Provider。
- 不调用 provider refund API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## Remaining Risk

当前脚本只证明 proposed constraints 在本地 disposable DB 中可行。真实 migration 仍需单独 PR，且需要 operator rollback runbook；如果生产未来已有 refund-only rows，down migration 不能静默删除数据。

## 下一步

建议继续 `refund-schema-constraint-migration-validation` 或单独规划真实 migration PR；在真实 migration PR 之前仍不得注册 module 或启用真实退款 runtime。
