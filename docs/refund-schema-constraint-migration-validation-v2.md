# Refund Schema Constraint Migration Validation V2

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #363 `[china] Refund schema constraint migration` 已合并到 `main`，merge commit 为 `e125a919f522459f3d454cbae5ac6459677c9e14`。

合并后验证通过。当前真实 migration skeleton 已扩展 refund schema constraints，但仍未注册 module，未新增 route，未连接预发 / 生产 DB，未接 provider refund API，未执行 workflow，也未写退款成功、结算、佣金、打款、权限、履约或物流状态。

## 验证结果

在最新 `origin/main` 基线分支 `china/pr-my-refund-schema-constraint-migration-validation` 上已执行：

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
- Existing refund inbox real-adapter rehearsal：row count `1|9`，down/drop cleanup 后无残留 DB。
- `git diff --check` passed。

## Safety Boundary

仍保持：

- 不注册 `china-payment-notification` module。
- 不新增 route。
- 不连接预发 / 生产 DB。
- 不接真实 Provider。
- 不调用 provider refund API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 剩余风险

当前 migration skeleton 虽已扩展，但 module 仍未注册，因此不会自行迁移任何真实 DB。未来注册 module 或应用 migration 前仍需要 operator preflight、备份和 rollback runbook；如果目标环境已有旧 skeleton 数据，down migration 前不能静默删除 refund-only rows。

## 下一步

建议继续 `refund-inbox-schema-adapter-unmapped-state-plan`，先规划是否移除 local PG client 的 DB-safe state / actor mapping；仍不得启用真实 refund provider、workflow 或 refund success state。
