# Refund Inbox Repository Real DB Adapter Rehearsal Validation

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #356 `[china] Refund inbox real DB adapter rehearsal` 已合并到 `main`，merge commit 为 `cff5d3d6b7ca925e53cc3863b712d04acff9b5f5`。

合并后验证通过。当前新增 rehearsal 仍只验证本地 disposable PostgreSQL 上的 refund inbox repository / SQL adapter 语义，不是预发 / 生产 DB，不是可用真实退款 runtime。

## 验证结果

在最新 `origin/main` 基线分支 `china/pr-mr-refund-inbox-real-db-adapter-rehearsal-validation` 上已执行：

```bash
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
CODEX_DRY_RUN_DB=unsafe_refund_rehearsal .codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
NODE_ENV=production .codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh
git diff --check
```

结果：

- Real adapter rehearsal positive run：row count `1|8`，down/drop cleanup 后无残留 DB。
- Unsafe DB name guard：拒绝 `unsafe_refund_rehearsal`。
- Production env guard：`NODE_ENV=production` 被拒绝。
- Focused local client + refund repository tests：2 suites / 24 tests passed。
- API typecheck passed。
- Payment notification harness：40 suites / 301 tests passed。
- Payment DB dry-run row count：`2|9`。
- Existing refund inbox repository disposable DB dry-run：row count `1|8`，down/drop cleanup 后无残留 DB。
- `git diff --check` passed。
- 验证结束后工作区无 runtime diff。

## 安全边界

仍保持：

- 脚本只接受本地 disposable PostgreSQL。
- 默认 DB 前缀为 `fuyi_refund_inbox_real_adapter_dry_run_`，避开 PostgreSQL identifier 截断。
- unsafe DB name / production env 被拒绝。
- 不注册 module / migration。
- 不新增 route。
- 不调用 provider refund API。
- 不执行 payment / refund workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 剩余风险

当前 rehearsal 明确证明 shared payment-first schema 仍会拒绝 unmapped refund-only `processing_status` 和 `system_job` actor。因此 `createLocalRefundInboxPostgresClient()` 的 state / actor mapping 仍只是 local disposable DB 兼容层；真实 refund schema / constraint migration 必须单独规划。

## 下一步

建议继续 `refund-schema-constraint-migration-plan`，先 docs-only 规划真实 refund schema / constraint 变更；不得直接修改 migration 或连接预发 / 生产。
