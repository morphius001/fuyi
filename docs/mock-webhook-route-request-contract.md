# Mock Webhook Route Request Contract

更新时间：2026-05-07 22:25 Asia/Shanghai

## 目标

本轮新增 mock payment webhook 的 request contract。它只负责把未来 route 收到的 `rawBody`、headers、mock secret 和可选 expected amount 规整成 `NormalizeMockPaymentNotificationInput`，供既有 mock normalizer 继续处理。

这不是可用 webhook route，也不是支付 runtime。

## 新增合同

- `mapMockPaymentWebhookRequestToNormalizeInput(input)`
- 输入：`rawBody`、`headers`、`secret`、`receivedAt`、`expectedAmount`
- 成功输出：`{ accepted: true, normalizeInput }`
- 拒绝输出：`{ accepted: false, code, reason, safeMetadata }`

## Header 规则

- 签名：`x-mock-payment-signature`，兼容 `signature`
- 事件 ID：`x-mock-payment-event-id`，兼容 `x-event-id` / `event-id`
- 时间戳：`x-mock-payment-timestamp`，兼容 `x-payment-timestamp` / `timestamp`
- key id：`x-mock-payment-key-id`，兼容 `x-key-id` / `key-id`
- header 名大小写不敏感
- 数组 header 取第一个非空值

## 拒绝规则

- 缺少 raw body：`PAYLOAD_INVALID`
- 缺少 mock secret：`PAYLOAD_INVALID`
- 缺少签名：`SIGNATURE_MISSING`

拒绝结果只返回安全 metadata：`receivedAt` 和 header names。拒绝结果不能暴露 raw payload、签名、secret、openid、unionid 或任何 payment/order mutation 字段。

## 非目标

- 不解析 JSON。
- 不验签。
- 不写 inbox。
- 不连接数据库。
- 不新增 API route。
- 不注册 migration 或 module。
- 不调用 payment workflow。
- 不改变 payment、order、refund、settlement、commission、payout 或 permission 行为。

## 验证

本轮需要通过：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

## 后续

下一步如果继续靠近 route，仍应先做 request + response + runtime disabled config 的组合 harness 或 dry-run route handler 计划。真正 API route、runtime switch、DB write 和 workflow command execution 必须继续拆开，并保持 mock-only、默认关闭。
