# Refund Inbox Schema Adapter Unmapped State

更新时间：2026-05-10 Asia/Shanghai

## 结论

已更新 local PG refund inbox adapter，使 refund-only `processing_status` 和 refund audit `actor_type` 在新 schema 下原样写入和读回，不再映射到旧 payment-first DB-safe values。

本轮仍只影响 local disposable DB / mock refund inbox gate 相关 adapter，不注册 module，不新增 route，不连接预发 / 生产 DB，不调用 provider refund API，不执行 workflow，也不写退款成功、结算、佣金、打款、权限、履约或物流状态。

## 变更内容

文件：

```text
packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts
packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
packages/api/src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts
```

变更：

- `mapRefundStateToDbStatus()` 现在原样返回 refund inbox state。
- `mapRefundStateFromDbStatus()` 只接受新 schema 支持的 refund inbox states；未知 status 会抛出 `REFUND_DB_INVALID_STATE_TRANSITION`。
- `mapRefundActorTypeToDb()` 现在原样返回 `provider`、`system_job`、`admin`、`vendor`。
- focused tests 更新为断言 `normalized` / `system_job` 原样写入。
- refund inbox mock route local DB fixture 更新为新 schema 的 `normalized`，不再使用旧 payment-first `verified` 作为 refund row 状态。

## Safety Boundary

仍保持：

- 不注册 `china-payment-notification` module。
- 不新增 route。
- 不接真实 Provider。
- 不调用 provider refund API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 已执行验证

本轮已执行：

```bash
.codex/scripts/refund-schema-constraint-migration-rehearsal.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/payment-db-inbox-repository.unit.spec.ts
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

## Rollback

Rollback 是代码级：

- 恢复 local PG client 的 state / actor mapping。
- 恢复 focused tests。
- 不需要 DB rollback，因为 module 仍未注册，且本轮不连接预发 / 生产 DB。

## Remaining Risk

旧 payment-first disposable DB 将不再兼容 refund-only states / actors。未来本地验证必须先应用 PR #363 后的新 migration skeleton。真实环境启用前仍需要 operator preflight 和 rollback runbook。

## 下一步

建议继续 `refund-inbox-schema-adapter-unmapped-state-validation`，记录合并后验证；仍不得启用真实退款 runtime。
