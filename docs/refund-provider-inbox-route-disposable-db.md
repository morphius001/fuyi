# Refund Provider Inbox Route Disposable DB

更新时间：2026-05-12 Asia/Shanghai

## 结论

微信支付 / 支付宝 provider refund inbox route 已支持 local disposable DB inbox-only rehearsal。只有在 `development + local target + local disposable DB + fixture-only provider config` 全部通过时，route 才会读取 body、调用 provider refund verifier contract、归一化 envelope，并通过 `DbRefundInboxRepository` 写入 local disposable DB 的 inbox / event log。

这不是可用退款 runtime。本轮没有连接预发或生产 DB，没有注册 module，没有接 SDK 或真实密钥，没有调用 provider refund API / refund query API，没有执行 workflow，也没有写平台退款成功状态。

## 修改文件

- `packages/api/src/api/china/refund-inbox/provider-local-db.ts`
- `packages/api/src/api/china/refund-inbox/wechat-pay/route.ts`
- `packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts`
- `packages/api/src/api/china/refund-inbox/alipay/route.ts`
- `packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts`
- `packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts`
- `.codex/tasks/refund-provider-inbox-route-disposable-db.md`
- `docs/refund-provider-inbox-route-disposable-db.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Runtime Boundary

新增 route local DB resolver 只从 Medusa request scope 读取 `ContainerRegistrationKeys.PG_CONNECTION`，然后执行三层校验：

1. Env gate：route enabled、provider match、`CHINA_REFUND_STATE_MUTATION_ENABLED=false`、`CHINA_REFUND_TARGET_ENV=local`、只允许一个 local storage mode。
2. DB config gate：`CHINA_REFUND_INBOX_DATABASE_URL` / `CHINA_REFUND_INBOX_LOCAL_DB_URL` 必须指向 allowlisted local disposable DB prefix。
3. Actual connection gate：当前连接的 `current_database()`、server host 和 port 必须与 disposable DB URL / name 匹配。

任一 gate 失败时，route 返回 disabled safe response，且不读取 body。

## Storage

新增允许的 local refund DB prefix：

```text
fuyi_refund_provider_inbox_route_dry_run_
```

该 prefix 只用于 provider route local disposable DB rehearsal，复用现有 `createLocalRefundInboxPostgresClient()` 和 `DbRefundInboxRepository`。它仍使用 shared `payment_notification_inbox` / `payment_notification_event_log` skeleton 表，但只写 refund-only status / actor / event action。

## Response Semantics

所有 response 继续固定：

```json
{
  "runtimeMutationBlocked": true,
  "stateMutationBlocked": true,
  "refundSuccessState": false,
  "successMeans": "inbox_or_audit_only"
}
```

语义边界：

- `accepted` 只表示 local disposable DB inbox accepted。
- `duplicate` 只表示 same digest replay。
- `manual_review` 只表示人工复核。
- `processed_for_audit_only` 只表示审计记录。
- `query_required` 只表示未来需要查询计划；当前不调用 provider query API。

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts \
  src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-response.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-local-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-normalizer.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
git diff --check
```

结果：

```text
8 test suites passed
60 tests passed
API typecheck passed
payment notification harness passed: 42 suites / 323 tests, DB dry-run 2|9
refund real-adapter rehearsal passed: 1|9, no residual database
runtime grep only matched negative assertions and response denylist
git diff --check passed
subagent readonly review: No Findings
```

## Rollback

- 设置 `CHINA_REFUND_NOTIFY_ROUTE_ENABLED=false`。
- 设置 `CHINA_REFUND_RUNTIME_ENABLED=false`。
- 保持 `CHINA_REFUND_STATE_MUTATION_ENABLED=false`。
- 删除 local disposable DB。
- revert 本 PR。

无生产数据回滚，因为本轮不允许连接预发、生产或普通共享 DB。

## No-Go

仍禁止：

- 真实 SDK dependency。
- 真实密钥 / 证书 / webhook token。
- 生产、预发、staging 或普通共享 DB 连接。
- provider refund request。
- provider refund query API。
- workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission weakening。
- fulfillment / logistics mutation。
