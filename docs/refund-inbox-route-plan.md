# Refund Inbox Route Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

可以继续规划 refund inbox route，但下一步仍不能直接新增真实 route。未来 route 第一阶段只能是 fake/local inbox-only gate，用于把已验签、已归一化的 fake refund notification 写入 inbox / event log，并返回安全响应。

任何 route response、inbox state、manual review decision 或 audit event 都不能代表退款成功。退款成功仍必须由后端异步 provider notification 经过验签、幂等、guard、人工复核和后续专门 release gate 后，再由明确的 state owner 处理；当前阶段保持 runtime mutation blocked。

## Route 草案

建议未来路径先放在明确的本地 / mock 命名空间：

```text
POST /china/refund-inbox/mock
```

备选：

```text
POST /china/payment-providers/mock/refunds
```

当前不建议使用支付宝或微信支付真实路径，也不暴露为生产 Provider 回调入口。真实支付宝 / 微信支付 refund notify path 必须后续单独设计、单独验签、单独 secret owner、单独 preprod gate。

## Runtime Gate

默认关闭：

```text
CHINA_REFUND_INBOX_ROUTE_ENABLED=false
CHINA_REFUND_INBOX_ROUTE_MODE=disabled
CHINA_REFUND_INBOX_PROVIDER=mock_china_pay
```

允许的第一阶段模式：

```text
CHINA_REFUND_INBOX_ROUTE_MODE=mock_local_inbox_only
```

该模式必须同时满足：

- `NODE_ENV=development` 或本地测试环境。
- Provider 为 `mock_china_pay`。
- 使用 fake-only signature / payload。
- DB 只能是 local disposable DB 或 local in-memory repository。
- DB host 只能是 `localhost` / `127.0.0.1` 或明确 local socket。
- DB name 必须带 `fuyi_refund_inbox_route_dry_run_` 等 disposable 前缀。
- `china-payment-notification` module 未注册到 `medusa-config.ts`，除非未来单独 release gate 明确允许。
- workflow / state mutation gate 必须关闭。

生产环境必须 blocked。即使显式设置开启变量，也必须拒绝读取 body 或连接 DB。

## Request Contract

Headers 草案：

| Header | 说明 |
| --- | --- |
| `x-mock-refund-signature` | fake signature，仅用于 local test vector |
| `x-mock-refund-event-id` | fake event id |
| `x-mock-refund-timestamp` | fake timestamp |
| `x-mock-refund-key-id` | fake key id |

Body 草案：

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

禁止请求包含：

- raw production provider payload
- private key / public key / certificate / APIv3 key
- merchant id / mch id / app id
- provider refund request command
- refund state mutation command
- workflow command
- settlement / commission / payout adjustment
- full phone / identity number / bank card / full address

## Inbox-only 行为

允许：

- 在 gate 通过后读取 raw body。
- 计算 raw payload digest。
- fake signature verify。
- normalize fake refund envelope。
- 生成 notification idempotency key。
- 调用 refund inbox repository contract。
- 写 inbox row。
- 写 event log：
  - `refund_notification_received`
  - `refund_notification_verified`
  - `refund_notification_normalized`
  - `refund_notification_duplicate_seen`
  - `refund_notification_digest_conflict`
  - `refund_guard_manual_review_required`
  - `refund_runtime_mutation_blocked`
  - `refund_settlement_blocked`
- 对 duplicate 和 digest conflict 返回安全响应。

禁止：

- 不调用 provider refund API。
- 不执行 payment / refund workflow。
- 不写 refund success state。
- 不修改 order / payment / refund / settlement / commission / payout。
- 不改变 permission、fulfillment 或 logistics。
- 不触发 payout、reconciliation、shipping、delivery 或 notification provider。

## Response Contract

| 场景 | HTTP | Body |
| --- | --- | --- |
| route disabled | 404 或 503 | `{"status":"disabled"}` |
| production blocked | 404 或 503 | `{"status":"disabled","code":"PRODUCTION_BLOCKED"}` |
| gate missing local DB | 503 | `{"status":"disabled","code":"LOCAL_DB_REQUIRED"}` |
| accepted into inbox | 202 | `{"status":"accepted","mode":"mock_local_inbox_only","runtimeMutationBlocked":true}` |
| duplicate same digest | 200 | `{"status":"duplicate","mode":"mock_local_inbox_only","runtimeMutationBlocked":true}` |
| digest conflict | 409 | `{"status":"manual_review_required","code":"DIGEST_CONFLICT","runtimeMutationBlocked":true}` |
| missing / invalid signature | 400 | `{"status":"rejected","code":"SIGNATURE_INVALID"}` |
| unsupported event type | 400 | `{"status":"rejected","code":"EVENT_TYPE_UNSUPPORTED"}` |
| non-CNY | 400 | `{"status":"rejected","code":"CURRENCY_UNSUPPORTED"}` |
| amount mismatch | 409 | `{"status":"manual_review_required","code":"AMOUNT_MISMATCH","runtimeMutationBlocked":true}` |

响应不得包含 raw body、signature、secret、DB URL、provider credential、workflow command、refund state mutation、settlement adjustment、commission adjustment、payout adjustment 或完整手机号。

## Test Matrix

未来 route skeleton / rehearsal PR 必须覆盖：

1. 默认 disabled，不读 body。
2. production blocked，即使 env 开启也不读 body。
3. provider 不是 `mock_china_pay`，blocked。
4. local DB 未开启，blocked。
5. local DB host 非 localhost / 127.0.0.1，blocked。
6. DB name 非 disposable 前缀，blocked。
7. missing signature，rejected。
8. invalid signature，rejected。
9. malformed JSON，rejected。
10. `refund.succeeded` fake payload，accepted into inbox。
11. duplicate same digest，duplicate no-op。
12. duplicate different digest，manual review required。
13. non-CNY，rejected。
14. zero / negative amount，rejected。
15. unsupported event type，rejected。
16. response redaction：不泄露 raw body、secret、signature、DB URL、workflow command 或 state mutation command。
17. runtime grep 确认没有 workflow execution、provider refund request、settlement / commission / payout adjustment。

## Rollback

如果未来 route skeleton 出现异常：

- 关闭 `CHINA_REFUND_INBOX_ROUTE_ENABLED`。
- 删除 local disposable DB。
- revert route skeleton PR。
- 保持 `china-payment-notification` module 未注册。
- 不需要生产数据回滚，因为该阶段不得连接生产或预发 DB。

## Go / No-Go

Go：

- 继续做 docs-only route gate validation，或新增 disabled route skeleton。
- 如新增 route，必须默认 disabled、production blocked、不读 body。
- 如新增 local rehearsal，必须 fake-only、local disposable DB、inbox-only、runtime mutation blocked。

No-Go：

- 真实支付宝 / 微信支付 refund notify route。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics 状态写入。
- 连接预发或生产 DB。

## 验证记录

本轮为 docs-only plan；验证要求：

```bash
git diff --check
git diff --name-only
git status --short --branch
git ls-files --others --exclude-standard
```

提交前需要子智能体只读复核，重点确认 diff 范围、route gate、response contract 和高风险 No-Go。
