# Refund Schema Constraint Migration Rehearsal Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

下一步可以新增一个 local disposable PostgreSQL rehearsal 脚本，用来验证 refund schema / constraint migration 草案。但该脚本仍只能在本地一次性 DB 中运行，不能修改真实 migration，不能注册 module，不能连接预发 / 生产，也不能把 refund inbox 推进到真实退款 runtime。

本轮只做 docs-only 规划；不新增脚本，不连接 DB，不修改 `apps/**` 或 `packages/**` runtime。

## Future Script Scope

未来 implementation PR 建议新增：

```text
.codex/scripts/refund-schema-constraint-migration-rehearsal.sh
docs/refund-schema-constraint-migration-rehearsal.md
.codex/tasks/refund-schema-constraint-migration-rehearsal.md
```

脚本职责：

- 从 `Migration20260507000200.ts` 提取当前 shared inbox up / down SQL。
- 在本地 disposable DB 中先应用当前 base schema。
- 只在 disposable DB 中应用 proposed refund constraint expansion SQL。
- 验证 payment path 兼容、refund-only state / action / actor 支持、forbidden value rejection、metadata redaction 和 rollback。
- 执行 down / drop，并确认无残留 DB。

脚本非职责：

- 不修改 `packages/api/src/modules/china-payment-notification/migrations/**`。
- 不修改 `local-postgres-db-client.ts` 或 repository runtime。
- 不注册 `china-payment-notification` 到 `medusa-config.ts`。
- 不启动 API route smoke。
- 不调用 provider refund API。
- 不执行 payment / refund workflow。
- 不写 refund success state。
- 不联动 settlement、commission、payout、permission、fulfillment 或 logistics。

## Disposable DB Guard

建议 DB 名：

```text
fuyi_refund_schema_constraint_dry_run_<timestamp>
```

允许本地覆盖：

```text
fuyi_refund_schema_constraint_dry_run_local_<safe_suffix>
```

脚本必须拒绝：

- DB host 不是 `localhost` / `127.0.0.1` / `::1` / local socket。
- DB name 不符合上述前缀。
- 环境提示包含 `production` / `prod` / `preprod` / `staging`。
- `packages/api/medusa-config.ts` 已注册 `china-payment-notification`。
- staged files 包含 `apps/**`、`packages/**`、package / lock / env。
- 缺少 `psql`、`createdb`、`dropdb` 或 Node 24。
- PostgreSQL 未就绪。

脚本输出不得打印 DB password、secret、token、raw payload、signature、证书、完整手机号、身份证、银行卡或完整地址。

## Proposed Rehearsal SQL Shape

未来脚本中的 SQL 必须只写在 disposable DB 中。建议按以下阶段验证，而不是直接写入真实 migration。

1. Expand inbox `processing_status` constraint
   - drop 当前 `payment_notification_inbox_processing_status_check`。
   - add expanded check，保留 payment statuses，并增加 refund-only statuses：
     - `signature_verified`
     - `normalized`
     - `guard_checked`
     - `manual_review_required`
     - `runtime_mutation_blocked`
     - `processed_for_audit_only`
     - `terminal_rejected`
     - `duplicate_seen`
     - `digest_conflict_manual_review`

2. Expand event log `action` constraint
   - drop 当前 `payment_notification_event_log_action_check`。
   - add expanded check，保留 payment actions，并增加 refund audit actions：
     - `refund_notification_received`
     - `refund_notification_verified`
     - `refund_notification_normalized`
     - `refund_notification_duplicate_seen`
     - `refund_notification_digest_conflict`
     - `refund_guard_manual_review_required`
     - `refund_runtime_mutation_blocked`
     - `refund_settlement_blocked`
   - forbidden runtime actions 必须继续 rejected：
     - `refund_state_mutated`
     - `refund_workflow_executed`
     - `provider_refund_request_sent`
     - `settlement_adjusted`
     - `commission_adjusted`
     - `payout_adjusted`

3. Actor strategy rehearsal
   - 方案 A：扩展 `actor_type` 为 `system`、`provider`、`operator`、`system_job`、`admin`、`vendor`。
   - 方案 B：保留 DB actor 为 `system` / `provider` / `operator`，并继续由 adapter 映射。
   - rehearsal 应先验证方案 A 和方案 B 的差异，再由后续 migration PR 选择一个；不要在计划阶段预设为生产事实。

4. Amount constraint
   - add `amount_value > 0` check 的 rehearsal。
   - 同时验证现有 payment notification 正向金额仍可写入。
   - 不用负数表达 reversal / adjustment；这些语义必须未来单独建模。

5. Metadata redaction guard
   - rehearsal 中可以使用临时 immutable helper function 或 trigger 验证递归 JSONB key 拒绝。
   - denylist 包含 provider refund request、workflow command、state mutation、provider SDK request、raw payload、secret、private key、certificate、full phone、identity number、bank card、full address。
   - down SQL 必须删除 helper function / trigger。

6. Index rehearsal
   - 保留当前 unique：`provider + idempotency_key`。
   - 验证新增普通索引 `(provider, provider_refund_id)` 的 create / drop。
   - 不要把 provider refund id 设置为 unique。

## Verification Matrix

未来 rehearsal PR 必须覆盖：

1. guard rejects unsafe DB name。
2. guard rejects remote DB host。
3. guard rejects production / preprod / staging env。
4. guard rejects staged runtime / package / env files。
5. base schema applies from current migration skeleton。
6. migration rehearsal SQL applies after base schema。
7. existing payment statuses insert / update。
8. refund-only statuses insert / update。
9. forbidden status is rejected。
10. existing payment event actions insert。
11. refund audit actions insert。
12. forbidden refund runtime actions are rejected。
13. actor strategy A or B is explicitly validated。
14. unknown actor is rejected。
15. amount `0` and negative amount are rejected if positive check is applied。
16. non-CNY is rejected。
17. same `provider + idempotency_key` duplicate is rejected。
18. metadata redaction rejects top-level denied keys。
19. metadata redaction rejects nested denied keys。
20. down SQL removes expanded constraints, indexes, helper functions and triggers.
21. after down, base schema semantics are restored.
22. disposable DB drop leaves no residual database.

## Suggested Command

未来 implementation PR 验证命令：

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

如果 typecheck 更新 `packages/api/.mercur/index.d.ts`，除非任务明确要求 codegen，否则必须恢复。

## Rollback Requirements

未来 rehearsal script 必须验证：

- expanded constraints 可以 down 回 base schema。
- 新增普通索引被 drop。
- metadata helper function / trigger 被 drop。
- down 后 refund-only status / action 不再被 base schema 接受。
- down 不删除已有 test rows，或在 disposable DB 中先清理 fixture rows 再验证 base semantics。
- 最终 drop DB，无残留。

真实 migration PR 的 rollback 还必须额外说明：如果生产已经写入 refund-only rows，down migration 前需要 operator runbook 处理，不允许静默删生产数据。

## Go / No-Go

Go：

- docs-only rehearsal planning。
- future local disposable DB script。
- temporary SQL in disposable DB。
- guard / rollback / matrix verification。

No-Go：

- 修改真实 migration。
- 注册 module。
- 连接预发 / 生产 DB。
- 运行真实 provider callback。
- provider refund request。
- workflow execution。
- refund success state mutation。
- settlement、commission、payout adjustment。
- permission、fulfillment、logistics state mutation。

## 下一步

建议继续 `refund-schema-constraint-migration-rehearsal`，只新增本地 disposable DB rehearsal 脚本和验证文档；仍不要修改真实 migration。
