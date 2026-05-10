# Refund Inbox Repository Real DB Adapter Rehearsal Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

可以继续规划 `DbRefundInboxRepository` 的 real DB adapter rehearsal，但必须把 scope 锁定为本地 disposable PostgreSQL。这里的 real DB adapter rehearsal 只验证 repository / SQL adapter 在一次性本地库中的真实 SQL 行为，不连接预发或生产，不注册 migration，不接 route，不调用 provider refund API，不执行 workflow，也不改变任何退款成功状态。

当前 `/china/refund-inbox/mock` 已有 local disposable DB inbox-only route。下一步 repository rehearsal 应该在 route 之外独立验证 DB adapter 语义，避免把 route smoke、schema 变更和 repository 行为混在一个 PR。

## 当前基线

已存在：

- `DbRefundInboxRepository`，依赖注入的 `RefundInboxDbClient.transaction()`。
- `createLocalRefundInboxPostgresClient()`，只接受 refund dry-run DB 前缀，支持 state / actor DB-safe mapping 和 metadata redaction。
- `.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh`，验证 shared migration skeleton + refund-only disposable constraints。
- `/china/refund-inbox/mock` local DB route，仍 fake/local inbox-only。

关键风险：

- 当前 shared inbox migration 仍是 payment-first skeleton。
- refund-only states 需要映射到 DB-safe `processing_status`；这只是 rehearsal 兼容层，不是最终退款状态模型。
- `system_job` actor 需要映射到 DB-safe `system`。
- refund event actions 目前依赖 disposable DB 内追加 allowlist；真实 migration / production schema 仍未准备。

## Future Rehearsal Scope

未来 implementation PR 只允许新增本地演练脚本和 focused tests，例如：

```text
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
packages/api/src/modules/china-payment-notification/__tests__/refund-local-postgres-db-client.unit.spec.ts
docs/refund-inbox-repository-real-db-adapter-rehearsal.md
```

允许验证：

- `DbRefundInboxRepository.receiveNotification()` against local disposable DB。
- duplicate same digest。
- duplicate different digest。
- mark signature verified / normalized / manual review / runtime mutation blocked / processed for audit only。
- `getByIdempotencyKey()` / `getByProviderRefundId()`。
- event log action allowlist。
- metadata redaction。
- transaction rollback on event log failure。
- down SQL cleanup and no residual DB。

禁止：

- 不改 `packages/api/medusa-config.ts`。
- 不注册 module / migration。
- 不把 disposable constraints 写入真实 migration。
- 不启动 route smoke。
- 不连接预发 / 生产 DB。
- 不调用 provider refund API。
- 不执行 workflow。
- 不写 refund success state。
- 不联动 settlement、commission、payout、permission、fulfillment、logistics。

## Local Disposable DB Gate

未来脚本必须拒绝：

- DB host 非 `127.0.0.1` / `localhost` / local socket。
- DB name 不符合 `fuyi_refund_inbox_repository_real_adapter_dry_run_YYYYMMDDHHMMSS` 或 `fuyi_refund_inbox_repository_real_adapter_dry_run_local_<safe_suffix>`。
- env hint 包含 production / prod / preprod / staging。
- `packages/api/medusa-config.ts` 已注册 `china-payment-notification`。
- staged files 包含 `apps/**`、`packages/api/medusa-config.ts`、package / lock / env。
- 缺少 `psql`、`createdb`、`dropdb`、Node 24 或 bun。

脚本不得打印 DB URL password、secret、token、raw payload、signature、证书、完整手机号、身份证、银行卡或完整地址。

## Schema Prerequisites

rehearsal 可以复用 shared inbox migration skeleton，但必须在 disposable DB 内显式追加本地约束：

- refund event type allowed。
- CNY only。
- positive amount。
- provider + idempotency unique。
- refund event action allowlist。
- metadata redaction recursive check。

如果要验证 refund-only processing states，不应修改真实 migration；应在 disposable DB 内先演练 constraint 变更，再单独规划 `refund-schema-constraint-migration-plan`。

## Verification Matrix

未来 rehearsal PR 必须覆盖：

1. disposable DB guard rejects unsafe DB name。
2. disposable DB guard rejects remote host。
3. disposable DB guard rejects production / preprod / staging hints。
4. staged runtime/config files cause script refusal。
5. receive fake `refund.succeeded` writes one inbox row and one received event。
6. same digest duplicate does not create a second inbox row and writes duplicate event。
7. different digest duplicate keeps original digest and writes digest conflict/manual review event。
8. mark verified / normalized / runtime blocked / settlement blocked writes DB-safe statuses and refund audit events。
9. metadata redaction rejects top-level and nested executable/sensitive fields。
10. forbidden actions are rejected。
11. transaction rollback preserves no partial event log on injected failure。
12. down SQL drops tables and drop DB leaves no residual database。

## Verification Commands

Future implementation should run:

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh
git diff --check
```

If typecheck updates `packages/api/.mercur/index.d.ts`, restore it unless the task explicitly requires codegen.

## Rollback

- Drop the disposable DB.
- Revert the rehearsal PR.
- No production data rollback is needed because rehearsal must not connect to preprod / production.

## Go / No-Go

Go:

- docs-only planning.
- local disposable DB rehearsal script.
- focused tests for local client / repository mapping.
- documentation and ledger updates.

No-Go:

- preprod / production DB。
- real Alipay / WeChat refund notify。
- provider refund request。
- workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission / fulfillment / logistics state mutation。
