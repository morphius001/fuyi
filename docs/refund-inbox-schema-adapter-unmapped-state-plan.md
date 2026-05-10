# Refund Inbox Schema Adapter Unmapped State Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

可以规划移除 `createLocalRefundInboxPostgresClient()` 中的 DB-safe refund state / actor mapping，但下一步仍必须限定为 local disposable DB / mock route gate 下的 adapter 变更。不能注册 module，不能启用真实 route/provider/workflow，不能写退款成功状态，也不能联动结算、佣金、打款、权限、履约或物流。

本轮只做 docs-only 规划，不修改 runtime。

## 当前基线

当前已完成：

- Migration skeleton 已支持 refund-only `processing_status`。
- Migration skeleton 已支持 refund audit actions。
- Migration skeleton 已支持 `system_job`、`admin`、`vendor` actor。
- Schema rehearsal 和 post-merge validation 已通过。

当前 local PG client 仍保留兼容映射：

```text
packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts
```

映射包括：

- `signature_verified` / `normalized` / `guard_checked` / `runtime_mutation_blocked` -> `verified`
- `terminal_rejected` / `digest_conflict_manual_review` / `manual_review_required` -> `terminal_failed`
- `processed_for_audit_only` -> `processed`
- `duplicate_seen` -> `ignored_duplicate`
- `system_job` -> `system`
- `admin` / `vendor` -> `operator`

这些映射曾经是 payment-first shared schema 的兼容层；现在需要单独 PR 判断是否可移除。

## Future Adapter Scope

未来 `refund-inbox-schema-adapter-unmapped-state` PR 允许：

- 修改 `mapRefundStateToDbStatus()`，让 refund-only states 原样写入 DB。
- 修改 `mapRefundStateFromDbStatus()`，让 DB 中的 refund-only states 原样读回。
- 修改 `mapRefundActorTypeToDb()`，让 `system_job`、`admin`、`vendor` 原样写入 DB。
- 更新 focused tests。
- 更新 `refund-inbox-repository-real-db-adapter-rehearsal.sh` 的 row expectations。
- 更新 docs / ledger。

未来 PR 禁止：

- 不注册 `china-payment-notification` module。
- 不新增或启用真实 route。
- 不调用 provider refund API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime。
- 不连接预发 / 生产 DB。

## Compatibility Rules

为了避免破坏旧 disposable DB / payment-first rehearsal，未来 adapter PR 必须明确处理：

1. 新 schema path
   - 如果 DB 支持 refund-only statuses / actors，adapter 应原样写入。
   - `getByIdempotencyKey()` / `getByProviderRefundId()` 应原样读回 refund state。

2. 旧 schema compatibility
   - 如果需要支持旧 disposable DB，必须通过明确 feature flag / function option 表达。
   - 不得静默把新 state 写成 payment-first status 后再伪装读回。
   - 如果旧 schema 不再支持，应让 local rehearsal 明确失败并提示先应用 migration。

3. Runtime boundary
   - 即使 adapter 原样写入 `processed_for_audit_only`，也只代表 inbox / audit processed，不代表退款成功。
   - `runtime_mutation_blocked` 仍应是默认安全终点。

## Verification Matrix

未来 adapter PR 必须覆盖：

1. `insertInbox()` writes `received` unchanged。
2. `markSignatureVerified()` writes `signature_verified` unchanged。
3. `markNormalized()` writes `normalized` unchanged。
4. `markGuardChecked()` writes `guard_checked` or manual review state unchanged。
5. `markManualReviewRequired()` writes `manual_review_required` unchanged。
6. `markRuntimeMutationBlocked()` writes `runtime_mutation_blocked` unchanged。
7. `markProcessedForAuditOnly()` writes `processed_for_audit_only` unchanged and sets `processed_at`。
8. `markTerminalRejected()` writes `terminal_rejected` unchanged。
9. duplicate same digest returns / persists `duplicate_seen` semantics without overwriting original digest。
10. digest conflict returns / persists `digest_conflict_manual_review` semantics。
11. `system_job` actor writes unchanged。
12. `admin` actor writes unchanged。
13. `vendor` actor writes unchanged。
14. forbidden action / metadata redaction still rejected。
15. payment DB repository tests still pass。
16. schema constraint rehearsal still passes。
17. payment harness still passes。

## Required Commands

Future implementation should run:

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

If typecheck updates `packages/api/.mercur/index.d.ts`, restore it unless the task explicitly requires codegen.

## Rollback

Rollback should be code-only:

- Restore the adapter mapping functions.
- Restore focused tests / docs.
- No DB rollback is needed if module remains unregistered and no preprod / production DB is connected.

If a future environment has already applied the expanded migration, rollback must not drop refund-only rows or force them into payment-first statuses without operator approval.

## Go / No-Go

Go：

- docs-only planning。
- future local PG adapter mapping update。
- focused tests and local disposable DB rehearsal。

No-Go：

- module registration。
- preprod / production DB。
- real refund provider notify。
- provider refund request。
- workflow execution。
- refund success state mutation。
- settlement、commission、payout adjustment。
- permission、fulfillment、logistics state mutation。

## 下一步

建议继续 `refund-inbox-schema-adapter-unmapped-state`，只调整 local PG client / focused tests / rehearsal；仍不得启用真实退款 runtime。
