# Refund Inbox Schema Adapter Unmapped State Validation

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #366 `[china] Refund inbox schema adapter unmapped state` 已合并到 `main`，merge commit 为 `3e09d04fa082f4bdec75e7186f72fcc575723778`。

合并后验证通过。当前 local PG refund inbox adapter 已在新 schema 下原样写入 / 读回 refund-only state 和 actor，但仍只属于 local disposable DB / mock gate；未注册 module，未新增 route，未连接预发 / 生产 DB，未接 provider refund API，未执行 workflow，也未写退款成功、结算、佣金、打款、权限、履约或物流状态。

## 验证结果

在最新 `origin/main` 基线分支 `china/pr-nb-refund-inbox-schema-adapter-unmapped-state-validation` 上已执行：

```bash
.codex/scripts/refund-schema-constraint-migration-rehearsal.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/payment-db-inbox-repository.unit.spec.ts \
  src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
git diff --check
```

结果：

- Schema constraint rehearsal positive run：通过，drop cleanup 后无残留 DB。
- Focused local client / refund repository / payment repository / refund route tests：4 suites / 45 tests passed。
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

当前 adapter 只在 local disposable DB / mock refund inbox gate 下验证。真实 provider、workflow、refund success state、settlement、commission 和 payout 仍是后置高风险任务，不能由 adapter state 原样写入推断为已可上线真实退款。

## 下一步

建议继续 `refund-route-runtime-readiness-plan` 或先做 refund inbox local route validation；仍不得启用真实 provider refund notify、provider refund request、workflow 或 refund success state。
