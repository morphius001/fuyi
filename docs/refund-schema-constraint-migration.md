# Refund Schema Constraint Migration

更新时间：2026-05-10 Asia/Shanghai

## 结论

已更新未注册的 migration skeleton：

```text
packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts
```

本轮只扩展 payment notification inbox / event log 的 schema constraints，使其能表达 refund inbox rehearsal 已验证的状态、动作、actor、金额和 metadata redaction 语义。它仍不注册 module，不新增 route，不接 provider refund API，不执行 workflow，也不写退款成功状态。

## 变更内容

Migration skeleton 现在包含：

- `processing_status` allowlist 保留 payment statuses，并增加 refund-only statuses：
  - `signature_verified`
  - `normalized`
  - `guard_checked`
  - `manual_review_required`
  - `runtime_mutation_blocked`
  - `processed_for_audit_only`
  - `terminal_rejected`
  - `duplicate_seen`
  - `digest_conflict_manual_review`
- `amount_value > 0` check。
- `(provider, provider_refund_id)` 普通索引，且不把 provider refund id 设为 unique。
- event log action allowlist 保留 payment actions，并增加 refund audit actions：
  - `refund_notification_received`
  - `refund_notification_verified`
  - `refund_notification_normalized`
  - `refund_notification_duplicate_seen`
  - `refund_notification_digest_conflict`
  - `refund_guard_manual_review_required`
  - `refund_runtime_mutation_blocked`
  - `refund_settlement_blocked`
- actor allowlist 增加：
  - `system_job`
  - `admin`
  - `vendor`
- metadata redaction helper / check constraint：
  - 拒绝 provider refund request、workflow command、state mutation、provider SDK request、raw payload、secret、private key、certificate、full phone、identity number、bank card、full address、settlement / commission / payout adjustment 等顶层或嵌套 key。
- down migration 会 drop event log table 后 drop metadata helper function，再 drop inbox table。

## Rehearsal Script Update

`.codex/scripts/refund-schema-constraint-migration-rehearsal.sh` 已更新为验证当前 migration skeleton 自带的 constraints，而不是在 disposable DB 中临时追加同一套 constraints。

脚本仍只连接本地 disposable PostgreSQL，默认 DB 名：

```text
fuyi_refund_schema_constraint_dry_run_<timestamp>
```

脚本仍拒绝 unsafe DB name、remote host、production / preprod / staging env、已注册 module，以及 staged files 中任何不在本迁移 rehearsal allowlist 内的路径。

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
git diff -- packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts
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
- `bash -n .codex/scripts/refund-schema-constraint-migration-rehearsal.sh` passed。
- `git diff --check` passed。

## Safety Boundary

本轮仍保持：

- 不注册 `china-payment-notification` module。
- 不新增 route。
- 不接真实 Provider。
- 不调用 provider refund API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。
- 不连接预发 / 生产 DB。

## Remaining Risk

当前 migration skeleton 仍未注册，因此该变更不会自行迁移任何真实 DB。未来如果某环境已经手动应用旧 skeleton，上线前必须执行 operator preflight 并准备 rollback runbook；如果已有 refund-only rows，down migration 不能静默删除数据。

## 下一步

建议继续 `refund-schema-constraint-migration-validation`，记录合并后验证；随后再单独规划是否移除 local PG client 的 DB-safe state / actor mapping。
