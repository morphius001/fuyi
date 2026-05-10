# Refund Inbox Disabled Route Skeleton

更新时间：2026-05-10 Asia/Shanghai

## 结论

已新增 refund inbox mock disabled route skeleton：

```text
POST /china/refund-inbox/mock
GET /china/refund-inbox/mock
```

当前 route 只返回 disabled / production blocked / method not allowed。它不读取 request body，不验签，不 normalize，不计算 digest，不生成 idempotency key，不连接 DB，不调用 refund inbox repository，不写 inbox / event log，不调用 provider refund API，也不执行 payment / refund workflow。

## 行为

`POST` 默认返回 `503`：

```json
{
  "status": "disabled",
  "surface": "refund_inbox",
  "provider": "mock_china_pay",
  "runtime": "disabled",
  "runtimeMutationBlocked": true
}
```

`NODE_ENV=production` 时返回 `503` 且 runtime 为 `production_blocked`。即使设置 `CHINA_REFUND_INBOX_ROUTE_ENABLED=true` 或 `CHINA_REFUND_INBOX_ROUTE_MODE=mock_local_inbox_only`，当前 skeleton 仍保持 disabled。

`GET` 返回 `405 Method Not Allowed`，并同样不读取 body。

## Safety

Focused tests 覆盖：

- 默认 disabled 不读 body。
- mock local inbox env requested 时仍 disabled。
- production blocked 不读 body。
- `GET` 405 不读 body。
- response 不泄露 raw payload、signature、secret、DB URL、workflow command、refund state mutation、settlement / commission / payout adjustment。
- response 不包含 `accepted`、`duplicate` 或 `refund.succeeded`。

## 非目标

- 不接 fake payload accepted into inbox。
- 不连接 local disposable DB。
- 不调用 refund verifier / normalizer / repository。
- 不调用 provider refund API。
- 不执行 payment / refund workflow。
- 不写 refund success state。
- 不联动 settlement、commission、payout、permission、fulfillment 或 logistics。

这些能力需要后续单独 `refund-inbox-local-inbox-only-route-plan` 和验证。
