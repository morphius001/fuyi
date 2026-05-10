# Refund Schema Constraint Migration Prereadiness Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

可以进入真实 refund schema constraint migration 的准备阶段，但下一步仍必须只改 migration skeleton / tests / docs，不能注册 module、启用 route、连接预发 / 生产 DB、调用 provider refund API、执行 workflow 或写退款成功状态。

本轮只做 docs-only prereadiness 规划，不修改真实 migration，不新增脚本，不连接 DB。

## Current Evidence

已完成：

- `refund-schema-constraint-migration-plan`：定义 future constraint owner boundary。
- `refund-schema-constraint-migration-rehearsal-plan`：定义 local disposable DB rehearsal 方案。
- `refund-schema-constraint-migration-rehearsal`：新增本地 disposable PostgreSQL rehearsal script。
- `refund-schema-constraint-migration-validation`：PR #360 合并后验证通过。

已验证：

- proposed constraints 可在本地 disposable DB 中 apply / rollback / down。
- payment statuses / actions 兼容。
- refund-only statuses / actions / actors 可演练。
- forbidden runtime actions 被拒绝。
- metadata redaction 可拒绝顶层和嵌套敏感 / 可执行 key。
- positive amount / CNY / idempotency guard 可验证。

仍未完成：

- 未修改真实 migration。
- 未注册 module。
- 未迁移任何真实数据。
- 未启用真实 refund route / provider / workflow。
- 未建立生产 rollback runbook。

## Migration PR Gate

未来 `refund-schema-constraint-migration` PR 必须同时满足：

1. File scope gate
   - 只允许修改 `packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts`、focused tests / local rehearsal docs / ledger。
   - 不允许修改 `packages/api/medusa-config.ts`。
   - 不允许修改 route、provider、workflow、checkout、order、settlement、commission、payout、permission、fulfillment、logistics。

2. Schema scope gate
   - 只扩展 check constraints / indexes / metadata redaction helper。
   - 不新增业务表。
   - 不删除 columns。
   - 不改 provider / idempotency unique semantics。
   - 不把 provider refund id 设为 unique。

3. Runtime gate
   - module registration 保持关闭。
   - `/china/refund-inbox/mock` 仍保持 fake/local gate，不接真实 provider。
   - refund inbox accepted / duplicate / manual review 仍不代表退款成功。
   - refund success state mutation 仍 No-Go。

4. Data gate
   - 当前 migration skeleton 尚未注册；真实环境如果未应用该 migration，则 PR 只改变未来 schema。
   - 如果某环境已手动应用 skeleton，必须先运行数据预检。
   - 数据预检只能由 operator 在目标环境执行，不能由 Codex 本轮连接预发 / 生产。

## Required Operator Preflight

未来真实 migration 上线前，operator 需要在目标 DB 中预检：

```sql
select processing_status, count(*)
from payment_notification_inbox
group by processing_status
order by processing_status;

select action, count(*)
from payment_notification_event_log
group by action
order by action;

select actor_type, count(*)
from payment_notification_event_log
group by actor_type
order by actor_type;

select count(*)
from payment_notification_inbox
where amount_value <= 0;

select count(*)
from payment_notification_event_log
where metadata::text ~* '(providerRefundRequest|refundStateMutation|workflowCommand|rawProviderPayload|privateKey|certificate|apiV3Key|webhookSecret|fullPhone|identityNumber|bankCardNumber|fullAddress)';
```

Go 条件：

- 没有 unknown processing status。
- 没有 unknown action。
- 没有 unknown actor。
- 没有 `amount_value <= 0` 行，或已有 operator-approved remediation。
- 没有敏感 / 可执行 metadata，或已有 operator-approved remediation。

No-Go 条件：

- 目标 DB 中已有无法解释的 statuses / actions / actors。
- 目标 DB 中已有会被新 constraints 拒绝的数据，但没有 remediation。
- migration 需要删除生产数据才能 down。
- module registration、route 启用或 provider runtime 被混进同一 PR。

## Rollback Runbook Requirements

真实 migration PR 必须附带 rollback runbook：

1. Before deploy
   - 备份目标 DB。
   - 保存 preflight query 输出。
   - 确认 module registration 关闭。
   - 确认 route / provider runtime 不启用。

2. During deploy
   - 应用 migration。
   - 运行 post-migration constraint smoke。
   - 不启动真实 refund provider notify。

3. If rollback is needed
   - 如果没有 refund-only rows，允许 down migration 恢复 base constraints。
   - 如果已有 refund-only rows，必须先由 operator 决策迁移 / 归档 / 保留策略；不得静默删除数据。
   - rollback 不得触发 provider refund request、workflow 或结算调整。

4. After rollback
   - 重新运行 status / action / actor / metadata preflight。
   - 确认 module registration 仍关闭。
   - 确认无 route runtime 或 provider runtime 被启用。

## Required Verification For Migration PR

未来 migration PR 必须跑：

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

还必须增加 migration diff review：

```bash
git diff -- packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts
git diff --name-only
git status --short --branch
```

如果 typecheck 更新 `packages/api/.mercur/index.d.ts`，除非任务明确要求 codegen，否则必须恢复。

## Release Sequence

建议顺序：

1. `refund-schema-constraint-migration`
   - 只改 migration skeleton / docs / focused validation。
   - module registration 仍关闭。

2. `refund-schema-constraint-migration-validation`
   - 记录合并后 local disposable DB / tests / harness。

3. `refund-inbox-schema-adapter-unmapped-state-plan`
   - 规划是否移除 local PG client 的 DB-safe state / actor mapping。

4. `refund-inbox-schema-adapter-unmapped-state`
   - 只在 local / mock gate 下调整 adapter，仍不接真实 provider。

5. Route / provider / workflow 继续后置
   - 真实 refund provider notify、provider refund request、workflow、refund success state、settlement、commission、payout 必须分别拆高风险任务。

## Go / No-Go

Go：

- docs-only prereadiness。
- future migration skeleton change。
- local disposable DB rehearsal。
- operator preflight / rollback runbook。

No-Go：

- 本轮直接修改 migration。
- 连接预发 / 生产 DB。
- 注册 module。
- 启用真实 refund route。
- provider refund request。
- workflow execution。
- refund success state mutation。
- settlement、commission、payout adjustment。
- permission、fulfillment、logistics state mutation。

## 下一步

建议继续 `refund-schema-constraint-migration`，但只允许修改真实 migration skeleton 和相关 docs / validation；仍不得注册 module 或启用任何真实退款 runtime。
