# Refund Inbox Repository DB Adapter Skeleton Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

规划未来退款 inbox DB adapter skeleton 的文件边界、mocked DB client 测试边界、事务要求和风险门禁。

结论：下一步可以规划 mocked DB adapter skeleton，但仍不能实现真实 DB runtime、注册 migration、接 route、连接真实 DB、调用 provider refund API 或 workflow。未来 skeleton 也只能实现 `RefundInboxRepositoryContract` 的持久化适配边界，不能成为退款成功事实表。

## 文件边界

未来 skeleton PR 建议只允许：

- `packages/api/src/modules/china-payment-notification/refund-db-inbox-repository.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-inbox-repository-db-adapter-skeleton.md`
- `docs/refund-inbox-repository-db-adapter-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

禁止：

- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `packages/api/src/workflows/**`
- `packages/api/src/subscribers/**`
- `packages/api/src/jobs/**`
- `packages/api/src/links/**`
- `apps/**`
- `package.json` / `bun.lock`
- `.env*`

## Adapter 职责

未来 skeleton 只做：

- 实现 `RefundInboxRepositoryContract`。
- 接收外部注入的 transaction / manager / mock DB client。
- 映射 refund inbox record。
- 映射 refund audit event log。
- 将 unique conflict 转为 duplicate result。
- 将 digest conflict 转为 manual review result。
- 将 lock timeout / connection interrupted 转为 retryable error。
- 调用 metadata redaction helper 或等价清洗逻辑。

未来 skeleton 不做：

- 不自己创建数据库连接。
- 不读取环境变量。
- 不注册 Medusa module。
- 不新增 API route。
- 不调用 provider refund API。
- 不生成 provider refund request。
- 不调用 payment / refund workflow。
- 不写 order / payment / refund 状态。
- 不修改 settlement、commission、payout、permission、fulfillment、logistics。

## Mocked DB Client Tests

第一版 skeleton 测试只能使用 mock transaction client：

- `receiveNotification()` 首次插入 refund inbox + `refund_notification_received` event。
- duplicate same digest 读取已有 inbox + append `refund_notification_duplicate_seen`。
- duplicate digest conflict 读取已有 inbox + append `refund_notification_digest_conflict` + 返回 manual review result。
- `markSignatureVerified()` 更新 state + append `refund_notification_verified`。
- `markNormalized()` 更新 state + append `refund_notification_normalized`。
- `markGuardChecked()` 不执行 state mutation，只 append guard / runtime blocked audit。
- `markManualReviewRequired()` 更新 state + append `refund_guard_manual_review_required`。
- `markRuntimeMutationBlocked()` 更新 state + append `refund_runtime_mutation_blocked`。
- `markProcessedForAuditOnly()` 只进入 audit-only processed，不代表退款成功。
- `markTerminalRejected()` 只进入 terminal rejected，不代表退款失败业务状态。
- metadata 不包含 raw payload、完整签名、private key、certificate、APIv3 key、provider SDK request、workflow command、refund state mutation、完整手机号、证件号、银行卡号或完整地址。

## Transaction Requirements

同一事务内必须：

```text
insert/update refund inbox
append refund audit event log
commit
```

要求：

- event log 写入失败必须回滚 inbox update。
- inbox update 失败不得写 event log。
- duplicate conflict 不能继续推进 state owner。
- retryable DB error 不能被标记 processed。
- terminal DB error 不能被标记退款失败业务状态。

## Error Mapping

未来 skeleton 必须沿用：

| Code | Kind |
| --- | --- |
| `REFUND_DB_UNIQUE_CONFLICT` | `duplicate` |
| `REFUND_DB_DIGEST_CONFLICT` | `manual_review` |
| `REFUND_DB_PROVIDER_REFUND_CONFLICT` | `manual_review` |
| `REFUND_DB_LOCK_TIMEOUT` | `retryable` |
| `REFUND_DB_CONNECTION_INTERRUPTED` | `retryable` |
| `REFUND_DB_EVENT_LOG_WRITE_FAILED` | `retryable` |
| `REFUND_DB_INVALID_STATE_TRANSITION` | `terminal` |
| `REFUND_DB_METADATA_REDACTION_FAILED` | `terminal` |

未知 DB error 必须保持 `unknown`，不能默认推进状态。

## Runtime Grep Guard

未来 skeleton PR 必须验证：

- `packages/api/medusa-config.ts` 不引用 `china-payment-notification` 新 runtime。
- 不新增 refund route。
- 不新增 provider refund API 调用。
- 不出现 `refund_state_mutated` / `refund_workflow_executed` / `provider_refund_request_sent` 的 runtime 执行语义。
- 不调用 `createRefund`、payment / refund workflow、settlement、commission、payout 或 logistics provider。

## 后续 PR 顺序

1. `refund-inbox-repository-db-adapter-skeleton`
   - mocked DB adapter skeleton + focused tests。
   - 不连接真实 DB，不注册 runtime，不接 route。

2. `refund-inbox-repository-disposable-db-dry-run-plan`
   - docs-only 规划 local disposable DB dry-run。

3. `refund-inbox-repository-disposable-db-dry-run`
   - local disposable DB only。
   - 验证 unique conflict、digest conflict、transaction rollback 和 event log consistency。

4. `refund-inbox-route-plan`
   - docs-only route gate plan。
   - 默认 disabled，mock-only / sandbox-only。

## Go / No-Go

Go：

- mocked DB adapter skeleton。
- focused tests with fake data。
- no real DB connection。
- no route。
- no runtime registration。

No-Go：

- 不连接真实 DB。
- 不注册 migration。
- 不新增真实 refund route。
- 不接支付宝 / 微信支付 refund API。
- 不发送 provider refund request。
- 不执行 workflow。
- 不写退款成功 / 失败业务状态。
- 不改变 settlement、commission、payout、permission、fulfillment、logistics。

## 验证记录

本轮已执行：

```text
git diff --check
git diff --name-only
git ls-files --others --exclude-standard
```

并安排子智能体只读复核：

- diff 是否 docs-only。
- 是否没有修改 `apps/**` 或 `packages/**`。
- future skeleton 是否保持 mocked DB client 和 no runtime registration。
- 是否禁止 route、provider API、workflow 和交易 / 结算 / 履约 runtime。
