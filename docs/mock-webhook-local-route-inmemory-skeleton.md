# Mock Webhook Local Route In-Memory Skeleton

更新时间：2026-05-08 01:05 Asia/Shanghai

## 范围

本轮在 Admin mock webhook route 中增加 local-only in-memory 分支。

默认行为仍是 disabled。

## 启用条件

必须同时满足：

- `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true`
- `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only`
- `CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay`
- `CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true`
- `NODE_ENV !== production`

## 行为

满足启用条件时：

- route 读取 raw body。
- route 读取 headers。
- route 使用 `CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET`。
- route 构造 local in-memory repository adapter。
- route 调用 `handleMockPaymentWebhookNotification()`。
- route 返回 handler response 和 safe debug metadata。

不满足启用条件时：

- route 仍返回 disabled 503。
- route 不读取 request body。

## 验证结果

```text
Test Suites: 13 passed, 13 total
Tests:       78 passed, 78 total
CHECK row counts
2|9
```

API typecheck 通过。disposable DB 残留为空。

Runtime grep 命中 route 和 route 单测；正式运行入口仍只有：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
```

## 边界

- 未修改 `packages/api/medusa-config.ts`。
- 未新增 workflow、subscriber、job 或 link。
- 未连接数据库。
- 未执行 payment workflow。
- 未接真实支付宝、微信支付或任何真实 Provider。
- 未改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 行为。

## 后续

下一步必须先做 `mock-webhook-local-route-inmemory-post-validation`。不要直接接 DB-backed repository。
