# Refund Schema Constraint Migration Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

未来可以规划 refund inbox schema / constraint migration，但必须先拆成独立高风险 PR。本轮只做 docs-only 规划，不修改真实 migration，不连接任何 DB，不注册 module，不接 route，不调用 provider refund API，不执行 workflow，也不改变退款成功、结算、佣金、打款、权限、履约或物流状态。

当前 local disposable DB rehearsal 已证明：`DbRefundInboxRepository` 的 refund-only state / actor / audit action 在 shared payment-first schema 上需要兼容映射。这个映射只适合本地演练，不能作为生产退款 schema 的长期模型。

## 当前基线

当前未注册的 shared inbox migration skeleton：

```text
packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts
```

已包含：

- `payment_notification_inbox`
- `payment_notification_event_log`
- `provider + idempotency_key` unique constraint
- CNY currency check
- provider allowlist：`mock_china_pay`、`alipay`、`wechat_pay`
- event type allowlist 已包含 `refund.succeeded`、`refund.failed`

当前不匹配点：

- `processing_status` 仍是 payment-first：`received`、`verified`、`processing`、`processed`、`retryable_failed`、`terminal_failed`、`ignored_duplicate`。
- refund contract 需要表达：`signature_verified`、`normalized`、`guard_checked`、`manual_review_required`、`runtime_mutation_blocked`、`processed_for_audit_only`、`terminal_rejected`、`duplicate_seen`、`digest_conflict_manual_review`。
- event log action 仍是 payment workflow action，不包含 refund audit action allowlist。
- `actor_type` 只有 `system`、`provider`、`operator`，而 refund audit contract 会区分 `system_job`、`admin`、`vendor`、`provider`。
- shared schema 没有真实 migration 级别的 positive amount check。
- metadata redaction 目前由 TypeScript sanitizer 和 disposable DB rehearsal 约束验证，真实 schema 尚无 DB-level guard。

## Migration Owner Boundary

未来 migration PR 只能拥有 schema constraint 层，不拥有退款成功事实、provider 调用或交易状态。

Schema owner 可以规划：

- refund inbox status allowlist。
- refund audit event action allowlist。
- refund audit actor allowlist。
- amount / currency / provider / idempotency constraint。
- metadata redaction DB-level guard。
- index strategy。
- down migration 和 rollback 验证。

Schema owner 不能规划为本 PR 同时执行：

- provider refund request。
- payment / refund workflow execution。
- order / payment / refund state mutation。
- settlement、commission、payout adjustment。
- permission、fulfillment、logistics state mutation。
- real Alipay / WeChat callback handling。
- preprod / production DB migration apply。

## Proposed Constraint Changes

未来真实 migration 需要保持 payment path 兼容，同时显式允许 refund inbox contract。

建议拆分为以下约束规划：

1. `processing_status` allowlist
   - 保留现有 payment statuses。
   - 增加 refund-only statuses：`signature_verified`、`normalized`、`guard_checked`、`manual_review_required`、`runtime_mutation_blocked`、`processed_for_audit_only`、`terminal_rejected`、`duplicate_seen`、`digest_conflict_manual_review`。
   - 明确任何 refund status 都不代表退款成功。

2. `event_log.action` allowlist
   - 保留现有 payment audit actions。
   - 增加 refund audit actions：`refund_notification_received`、`refund_notification_verified`、`refund_notification_normalized`、`refund_notification_duplicate_seen`、`refund_notification_digest_conflict`、`refund_guard_manual_review_required`、`refund_runtime_mutation_blocked`、`refund_settlement_blocked`。
   - 明确禁止在 allowlist 中加入 `refund_state_mutated`、`refund_workflow_executed`、`provider_refund_request_sent`、`settlement_adjusted`、`commission_adjusted`、`payout_adjusted`。

3. `event_log.actor_type` allowlist
   - 保留 `system`、`provider`、`operator`。
   - 评估增加 `system_job`、`admin`、`vendor`，或继续在 DB 层映射到 `system` / `operator`。
   - 如果增加细分 actor，必须同步更新 repository adapter、tests 和 manual review audit docs。

4. amount / currency constraints
   - 保留 `currency = 'CNY'`。
   - 增加 `amount_value > 0` 前必须确认 payment notification 正向金额语义不会被影响。
   - 若未来需要记录 reversal / adjustment，必须单独建模，不在 refund inbox 里用负数表达。

5. metadata redaction DB guard
   - 禁止 `providerRefundRequest`、`refundStateMutation`、`workflowCommand`、`workflowExecution`、`providerSdkRequest`、`providerRequest`、`rawProviderPayload`、`rawPayload`、`privateKey`、`certificate`、`apiV3Key`、`apiV3Secret`、`webhookSecret`、`fullPhone`、`identityNumber`、`bankCardNumber`、`fullAddress`。
   - 需要验证顶层和嵌套 JSONB key。
   - 如果 PostgreSQL check constraint 难以递归表达，应优先设计 immutable helper function / trigger，并在 local disposable DB 中验证 down migration 清理。

6. index strategy
   - 保留 `provider + idempotency_key` unique。
   - 保留 provider / event id、merchant ref、status / received_at index。
   - 评估增加 `(provider, provider_refund_id)` 普通索引，避免把 provider refund id 误设为 unique；同一 provider refund id 可能出现多次通知或重放。

## Proposed PR Sequence

建议继续拆小 PR：

1. `refund-schema-constraint-migration-rehearsal-plan`
   - docs-only，写清未来 migration SQL 和 local dry-run matrix。

2. `refund-schema-constraint-migration-rehearsal`
   - 只新增 local disposable DB rehearsal script。
   - 不修改真实 migration。
   - 验证 constraint expand / rollback / down SQL。

3. `refund-schema-constraint-migration`
   - 才允许修改真实 migration skeleton。
   - 仍不得注册 module 或连接 runtime route。
   - 必须跑 local migration rehearsal、focused repository tests、payment harness、API typecheck、runtime grep。

4. `refund-schema-constraint-migration-validation`
   - docs-only 合并后验证。

## Verification Matrix For Future Migration PR

未来 migration PR 必须验证：

1. Existing payment notification statuses still insert / update in local disposable DB.
2. Refund-only processing statuses can insert / update without DB-safe mapping.
3. Forbidden statuses are rejected.
4. Existing payment event actions still insert.
5. Refund audit actions insert.
6. Forbidden refund runtime actions are rejected.
7. Existing actor values still insert.
8. Chosen refund actor model inserts and rejects unknown actor values.
9. `amount_value <= 0` is rejected if positive amount check is adopted.
10. Non-CNY is rejected.
11. `provider + idempotency_key` unique still blocks duplicate rows.
12. Same digest duplicate path does not create a second inbox row.
13. Different digest conflict writes manual review audit without overwriting original digest.
14. Metadata redaction DB guard rejects top-level sensitive / executable keys.
15. Metadata redaction DB guard rejects nested sensitive / executable keys.
16. Down migration restores prior schema and drops any helper function / trigger.
17. Disposable DB is dropped and residual check is clean.

## Required Verification Commands

未来 implementation PR 至少需要：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/payment-db-inbox-repository.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
git diff --check
```

如果 typecheck 更新 `packages/api/.mercur/index.d.ts`，除非任务明确要求 codegen，否则必须恢复。

## Rollback Guidance

未来真实 migration PR 必须提供：

- down migration。
- local disposable DB apply / down / re-apply rehearsal。
- no residual DB check。
- feature flag / module registration 保持关闭。
- 若 migration 仅扩展 allowlist，rollback 应说明已有 refund-only rows 在 down 前必须如何处理；不得在 down 中静默删除生产数据。

## Go / No-Go

Go：

- docs-only planning。
- local disposable DB rehearsal planning。
- future migration SQL review。
- focused test matrix。

No-Go：

- 直接修改真实 migration。
- 注册 `china-payment-notification` module。
- 连接预发 / 生产 DB。
- 启用真实 refund notify route。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement、commission、payout adjustment。
- permission、fulfillment、logistics state mutation。

## 下一步

建议继续 `refund-schema-constraint-migration-rehearsal-plan`，先把 migration rehearsal 的 disposable DB 脚本范围和 SQL 草案写清楚；不要直接改真实 migration。
