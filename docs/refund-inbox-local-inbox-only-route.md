# Refund Inbox Local Inbox-only Route

更新时间：2026-05-10 Asia/Shanghai

## 结论

`/china/refund-inbox/mock` 已从 disabled-only 扩展到 fake/local in-memory inbox-only。该 route 仍默认 disabled，production / preprod / staging blocked；只有显式开启本地 in-memory gate 时才读取 fake payload 并写入进程内 inbox repository。

当前实现不连接 DB，不注册 module 或 migration，不调用 provider refund API，不执行 payment / refund workflow，不写真实退款成功状态，也不联动 settlement、commission、payout、permission、fulfillment 或 logistics。

## Gate

进入 local in-memory inbox-only 需要同时满足：

```text
NODE_ENV=development
CHINA_REFUND_INBOX_ROUTE_ENABLED=true
CHINA_REFUND_INBOX_ROUTE_MODE=mock_local_inbox_only
CHINA_REFUND_INBOX_PROVIDER=mock_china_pay
CHINA_REFUND_INBOX_LOCAL_INMEMORY=true
CHINA_REFUND_INBOX_MOCK_SECRET=<fake local secret>
```

如果没有显式开启 in-memory gate，route 返回 disabled。`CHINA_REFUND_INBOX_LOCAL_DB=true` 当前不会启用 DB route wiring，仍返回 disabled；真实 local DB route wiring 必须后续单独 PR。

## 行为

允许：

- gate 通过后读取 raw body。
- fake signature verify。
- normalize fake refund notification。
- 写入进程内 refund inbox repository。
- 对 same digest duplicate 返回 duplicate。
- 对 same idempotency key / different digest 返回 manual review required。
- 返回 safe response，包含 `runtimeMutationBlocked: true`。

禁止：

- 不调用 provider refund API。
- 不执行 payment / refund workflow。
- 不写 refund success state。
- 不连接 DB。
- 不写真实 inbox table。
- 不改 order / payment / refund / settlement / commission / payout。
- 不改 permission、fulfillment 或 logistics。

## Response

新增 local in-memory response：

- `202 accepted`: fake refund notification 已进入本地 in-memory inbox；不代表退款成功。
- `200 duplicate`: same digest replay no-op；不代表退款成功。
- `409 manual_review_required`: digest conflict；不代表退款失败或成功。
- `400 rejected`: signature / currency / payload 等 fake contract 拒绝。

所有 response 均保留：

```json
{
  "runtimeMutationBlocked": true
}
```

response 不包含 raw body、signature、secret、DB URL、provider refund request、workflow command、refund state mutation、settlement / commission / payout adjustment 或 `refund.succeeded` event type。

## 已覆盖测试

Focused route tests 覆盖：

- 默认 disabled 不读 body。
- local inbox env requested 但未开启 in-memory repository 时仍 disabled。
- production blocked 不读 body。
- `GET` 返回 405 不读 body。
- fake local in-memory accepted。
- same digest duplicate。
- different digest manual review required。
- missing signature rejected。
- non-CNY rejected。
- response redaction。

## 当前非目标

- local DB route wiring。
- disposable DB-backed route smoke。
- real provider refund notify route。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics 状态写入。

## 下一步

建议继续：

1. `refund-inbox-local-inbox-only-route-validation`
   - 合并后验证 focused tests、API typecheck、payment harness、refund disposable DB dry-run 和 runtime grep。

2. `refund-inbox-local-db-route-plan`
   - 只规划 local disposable DB-backed route wiring。
   - 不接真实 Provider 或 workflow。
