# Refund Inbox Local Inbox-only Route Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

可以继续规划 `/china/refund-inbox/mock` 从 disabled-only 进入 fake/local inbox-only，但下一步仍不能接真实退款 runtime。local inbox-only 的成功标准只是 fake refund notification 被验签、归一化、写入本地 inbox / event log，并对 duplicate / digest conflict 返回安全响应。

它仍不能代表退款成功，不能调用 provider refund API，不能执行 payment / refund workflow，不能写 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics 状态。

## 当前基线

已存在：

- `/china/refund-inbox/mock` disabled-only route skeleton。
- Refund fake notification fixtures、verifier、normalizer。
- Refund inbox state transition contract。
- Refund manual review audit contract。
- Refund audit event allowlist contract。
- Refund inbox repository interface。
- Mocked DB adapter skeleton。
- Local disposable DB dry-run script。

当前 route 仍然：

- 默认 disabled。
- production blocked。
- 不读 body。
- 不接 DB。
- 不调 verifier / normalizer / repository。
- 不执行 workflow。

## Local-only Gate

下一步 local inbox-only route 必须同时满足：

```text
NODE_ENV=development
CHINA_REFUND_INBOX_ROUTE_ENABLED=true
CHINA_REFUND_INBOX_ROUTE_MODE=mock_local_inbox_only
CHINA_REFUND_INBOX_PROVIDER=mock_china_pay
CHINA_REFUND_INBOX_LOCAL_DB=true 或 CHINA_REFUND_INBOX_LOCAL_INMEMORY=true
CHINA_REFUND_INBOX_MOCK_SECRET=<fake local secret>
```

如果使用 local DB：

```text
CHINA_REFUND_INBOX_LOCAL_DB_URL=<local disposable db url>
CHINA_REFUND_INBOX_LOCAL_DB_NAME=fuyi_refund_inbox_route_dry_run_<timestamp>
```

必须拒绝：

- `NODE_ENV=production`
- `NODE_ENV=preprod`
- `NODE_ENV=staging`
- 非 `mock_china_pay` provider
- 非 localhost / 127.0.0.1 / local socket DB
- DB name 不带 disposable 前缀
- 缺少 fake local secret
- 同时打开真实 provider / workflow / state mutation gate

Production blocked 分支必须在读取 body 前返回 disabled。

## Request Contract

Headers：

| Header | 说明 |
| --- | --- |
| `x-mock-refund-signature` | fake signature |
| `x-mock-refund-event-id` | fake event id |
| `x-mock-refund-timestamp` | fake timestamp |
| `x-mock-refund-key-id` | fake key id |

Body：

```json
{
  "event_id": "evt_mock_refund_succeeded_001",
  "event_type": "refund.succeeded",
  "provider_refund_id": "mock_provider_refund_001",
  "merchant_order_ref": "pay_mock_refund_order_001",
  "payment_session_id": "payses_mock_refund_001",
  "provider_transaction_id": "mock_txn_refund_001",
  "amount": 8800,
  "currency": "CNY",
  "occurred_at": "2026-05-10T00:00:00.000Z"
}
```

该 body 只能是 fake-only test vector。真实支付宝 / 微信支付 refund notify payload 不允许进入这个 route。

## Inbox-only 行为

允许：

- gate 通过后读取 raw body。
- 计算 raw payload digest。
- fake signature verify。
- normalize fake refund envelope。
- 生成 notification idempotency key。
- 调用 refund inbox repository contract。
- 写本地 inbox row。
- 写本地 event log：
  - `refund_notification_received`
  - `refund_notification_verified`
  - `refund_notification_normalized`
  - `refund_notification_duplicate_seen`
  - `refund_notification_digest_conflict`
  - `refund_guard_manual_review_required`
  - `refund_runtime_mutation_blocked`
  - `refund_settlement_blocked`

禁止：

- 不调用 provider refund API。
- 不执行 payment / refund workflow。
- 不写 refund success state。
- 不改 order / payment / refund / settlement / commission / payout。
- 不改 permission、fulfillment 或 logistics。
- 不触发 reconciliation、payout、shipping、delivery、SMS、IM 或 notification provider。

## Response Contract

| 场景 | HTTP | Body |
| --- | --- | --- |
| disabled | 503 | `{"status":"disabled","runtimeMutationBlocked":true}` |
| production blocked | 503 | `{"status":"disabled","code":"PRODUCTION_BLOCKED","runtimeMutationBlocked":true}` |
| missing local DB / repository | 503 | `{"status":"disabled","code":"LOCAL_REPOSITORY_REQUIRED","runtimeMutationBlocked":true}` |
| accepted into inbox | 202 | `{"status":"accepted","mode":"mock_local_inbox_only","runtimeMutationBlocked":true}` |
| duplicate same digest | 200 | `{"status":"duplicate","mode":"mock_local_inbox_only","runtimeMutationBlocked":true}` |
| digest conflict | 409 | `{"status":"manual_review_required","code":"DIGEST_CONFLICT","runtimeMutationBlocked":true}` |
| missing / invalid signature | 400 | `{"status":"rejected","code":"SIGNATURE_INVALID","runtimeMutationBlocked":true}` |
| non-CNY | 400 | `{"status":"rejected","code":"CURRENCY_UNSUPPORTED","runtimeMutationBlocked":true}` |
| amount invalid / mismatch | 409 | `{"status":"manual_review_required","code":"AMOUNT_MISMATCH","runtimeMutationBlocked":true}` |
| unsupported event type | 400 | `{"status":"rejected","code":"EVENT_TYPE_UNSUPPORTED","runtimeMutationBlocked":true}` |

响应不得包含：

- raw body / raw payload
- signature / fake secret
- DB URL
- provider credential
- provider refund request
- workflow command
- refund state mutation command
- settlement / commission / payout adjustment
- full phone / identity / bank card / full address

## Test Matrix

未来 local inbox-only implementation 必须覆盖：

1. 默认 disabled，不读 body。
2. production blocked，不读 body。
3. env requested but provider 非 mock，blocked。
4. env requested but missing local repository，blocked。
5. local DB URL host 非 localhost / 127.0.0.1 / local socket，blocked。
6. local DB name 非 disposable 前缀，blocked。
7. missing signature，rejected，不写 inbox。
8. invalid signature，rejected，不写 inbox。
9. malformed JSON，rejected，不写 inbox。
10. `refund.succeeded` fake payload，accepted into inbox。
11. duplicate same digest，duplicate no-op。
12. duplicate different digest，manual review required。
13. non-CNY，rejected。
14. zero / negative amount，rejected。
15. unsupported event type，rejected。
16. response redaction 不泄露敏感或可执行字段。
17. runtime grep 不命中 provider refund request、workflow execution、refund state mutation、settlement / commission / payout adjustment。

## Verification

未来 implementation PR 必须跑：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh
grep -RIn \
  -e execute_workflow \
  -e providerRefundRequest \
  -e refundStateMutation \
  -e settlement_adjusted \
  -e commission_adjusted \
  -e payout_adjusted \
  -e checkout \
  packages/api/src/api/china/refund-inbox || true
git diff --check
```

`packages/api/.mercur/index.d.ts` 如由 typecheck / generated route type 产生本地变化，除非任务明确要求 codegen，否则继续恢复，不提交。

## Rollback

如果 local inbox-only route 出现异常：

- 设置 `CHINA_REFUND_INBOX_ROUTE_ENABLED=false`。
- 删除 local disposable DB。
- revert route local inbox-only PR。
- 保持真实 Provider / workflow / state mutation gate disabled。
- 生产不需要数据回滚，因为该阶段不得连接生产或预发 DB。

## Go / No-Go

Go：

- 下一步可以实现 fake/local inbox-only route。
- 只能 local DB / in-memory。
- 只能 fake provider / fake secret。
- 只能写 inbox / audit log。
- 所有 response 必须带 `runtimeMutationBlocked: true`。

No-Go：

- 真实支付宝 / 微信支付 refund notify route。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics 状态写入。
- 连接预发或生产 DB。
