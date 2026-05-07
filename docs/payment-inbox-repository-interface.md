# 支付通知 Inbox Repository Interface

## 目标

本轮新增 DB-backed repository 的接口层和错误码分类。它只定义合同，不实现 DB adapter，不连接数据库，不接 webhook route。

## 新增内容

- `PaymentNotificationInboxRepositoryContract`
- `PaymentNotificationInboxReceiveResult`
- `AppendPaymentNotificationEventInput`
- `MarkPaymentNotificationFailedInput`
- `PaymentNotificationRepositoryErrorCode`
- `classifyPaymentNotificationRepositoryError()`

## Error 分类

| Code | Kind |
| --- | --- |
| `SIGNATURE_MISSING` | `terminal` |
| `SIGNATURE_INVALID` | `terminal` |
| `PAYLOAD_INVALID` | `terminal` |
| `CURRENCY_UNSUPPORTED` | `terminal` |
| `EVENT_TYPE_UNSUPPORTED` | `terminal` |
| `DB_UNIQUE_CONFLICT` | `duplicate` |
| `DB_LOCK_TIMEOUT` | `retryable` |
| `DB_CONNECTION_INTERRUPTED` | `retryable` |

未知错误返回 `unknown`，避免默认误判为可推进交易状态的错误。

## 安全边界

- 没有 DB adapter。
- 没有 API route。
- 没有 workflow execution。
- 没有 migration 注册。
- 没有真实支付宝、微信支付、退款、对账、商家结算、佣金或权限变更。

## 验证

- 本地 payment notification harness 覆盖 repository contract 单测。
- API typecheck 通过。
- runtime grep 确认未注册到 Medusa config、API route、workflow、subscriber、job 或 link。
