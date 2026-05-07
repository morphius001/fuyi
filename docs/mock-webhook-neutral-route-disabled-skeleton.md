# Mock Webhook Neutral Route Disabled Skeleton

更新时间：2026-05-07 18:45 Asia/Shanghai

## 目标

新增 neutral mock payment webhook route skeleton：

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
```

本轮只占位 provider callback 的中立路径。它默认 disabled，不读取 body，不调用 handler，不连接 DB，不执行 payment workflow。

## 实现范围

新增：

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
packages/api/src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts
```

更新：

```text
.codex/scripts/payment-notification-idempotency-harness.sh
```

route 只使用：

- `parsePaymentNotificationRuntimeConfig()`
- `mapMockPaymentWebhookResponse()`

它不导入：

- `handleMockPaymentWebhookNotification()`
- `InMemoryPaymentNotificationInboxRepository`
- `DbPaymentNotificationInboxRepository`
- workflow command executor

## 行为

默认请求：

```text
POST /china/payment-webhooks/mock
```

返回：

```json
{
  "status": "disabled",
  "code": "RUNTIME_DISABLED",
  "route": "mock_payment_webhook_neutral_disabled_only",
  "runtimeRequested": false
}
```

即使设置 mock runtime env：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true
```

仍返回 disabled，并且不读取 body。

## 安全边界

本轮没有接通支付能力：

- 不接支付宝。
- 不接微信支付。
- 不读取或保存真实密钥。
- 不连接 DB。
- 不写 inbox。
- 不写 event log。
- 不执行 payment workflow。
- 不改变 order/payment/refund/settlement/commission/permission 状态。
- 不把前端 return URL 当支付成功来源。

## 为什么这一步必要

上一轮确认 `/admin/**` route 不能升级为真实 provider callback。neutral disabled route 先把 provider callback 路径独立出来，让后续 local in-memory smoke 和 DB-backed inbox 可以在正确路径上演进。

## 验证结果

计划验证：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

期望：

- harness 覆盖 neutral route disabled 单测。
- typecheck 通过。
- runtime grep 只命中当前 mock route 入口和测试，不命中 `medusa-config.ts`、workflows、subscribers、jobs 或 links。
- disposable DB 无残留。
