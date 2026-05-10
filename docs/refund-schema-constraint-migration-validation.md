# Refund Schema Constraint Migration Validation

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #360 `[china] Refund schema constraint migration rehearsal` 已合并到 `main`，merge commit 为 `f43dab784c351d3b1d56f85b7c451748b1d888dd`。

合并后验证通过。当前新增脚本仍只验证本地 disposable PostgreSQL 上的 proposed refund schema constraint SQL，不修改真实 migration，不连接预发 / 生产 DB，不注册 module，不新增 route，不接 provider refund API，不执行 workflow，也不改变退款成功、结算、佣金、打款、权限、履约或物流状态。

## 验证结果

在最新 `origin/main` 基线分支 `china/pr-mv-refund-schema-constraint-migration-validation` 上已执行：

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

仍保持：

- 不修改真实 migration。
- 不修改 `apps/**` 或 `packages/**` runtime。
- 不注册 module。
- 不新增 route。
- 不连接预发 / 生产 DB。
- 不接真实 Provider。
- 不调用 provider refund API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 剩余风险

当前只证明 proposed constraints 可以在本地 disposable DB 中 apply / rollback / down。真实 migration 仍需单独 PR，并且必须提供 operator rollback runbook；如果生产未来已有 refund-only rows，down migration 前不能静默删除数据。

## 下一步

建议单独规划 `refund-schema-constraint-migration` 或先做 `refund-schema-constraint-migration-prereadiness-plan`；在真实 migration 之前仍不得注册 module、启用 route 或连接真实退款 runtime。
