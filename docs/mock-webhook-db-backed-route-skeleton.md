# Mock Webhook DB-backed Route Skeleton

更新时间：2026-05-08 00:05 Asia/Shanghai

## 目标

neutral mock webhook route 已增加 DB-backed resolver skeleton。

目标 route：

```text
POST /china/payment-webhooks/mock
```

当前 skeleton 是安全占位：

- 识别 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true`。
- 调用 `resolveMockWebhookInboxRepository()`。
- 在没有 repository injection 时返回 disabled。
- 不读取 request body。
- 不写 inbox/event log。
- 不调用 payment workflow。

## 为什么不直接写 DB

当前还没有：

- production migration registration。
- disposable preprod DB dry-run。
- route-level transaction client injection。
- local DB accepted/duplicate smoke。

因此 route 不能直接 import production DB client 或从容器解析 repository。

## 本轮行为

local DB env：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true
NODE_ENV=development
```

返回：

```json
{
  "status": "disabled",
  "code": "RUNTIME_DISABLED",
  "route": "mock_payment_webhook_neutral_disabled_only",
  "runtimeRequested": true
}
```

该行为是预期的。它证明 route skeleton 已经有 DB resolver gate，但在 repository 可用前不会误写库。

## 已覆盖测试

新增 route 单测：

- local DB env requested。
- repository 不可用时 disabled。
- 不读取 body。
- 不泄漏 secret / raw payload。

既有测试继续覆盖：

- 默认 disabled。
- runtime requested without local in-memory disabled。
- local in-memory accepted。
- parsed JSON body accepted。
- missing signature rejected。
- production disabled。

## 验证

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git diff --check
```

## 后续

下一步建议：

```text
mock-webhook-db-backed-route-transaction-plan
```

先规划 route-level transaction client injection，再允许 local DB accepted/duplicate smoke。

仍然禁止真实支付宝、微信支付、payment workflow execution、退款、对账、结算、佣金和权限改动。
