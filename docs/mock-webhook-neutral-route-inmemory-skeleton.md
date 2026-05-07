# Mock Webhook Neutral Route In-Memory Skeleton

更新时间：2026-05-07 19:10 Asia/Shanghai

## 目标

neutral mock webhook route 增加 local-only in-memory 分支。

路径：

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
```

## 实现

route 现在仍默认 disabled。只有以下条件同时满足时，才进入 local in-memory 分支：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true
NODE_ENV != production
```

local 分支：

- 读取 raw body。
- 使用 headers 和 `CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET` 调用 mock handler。
- 使用 route-local `InMemoryPaymentNotificationInboxRepository` adapter。
- 返回 safe response 和 `safeDebug`。

## 明确未做

- 未连接 DB。
- 未写真实 inbox table。
- 未注册 payment notification module。
- 未执行 payment workflow。
- 未接支付宝或微信支付。
- 未修改退款、对账、商家结算、佣金或权限。
- 未写 smoke script。

## 测试覆盖

新增 neutral route 单测覆盖：

- 默认 disabled 且不读 body。
- env requested 但缺少 local gate 时 disabled。
- local in-memory signed payload accepted。
- missing signature rejected。
- production 强制 disabled 且不读 body。

## 验证计划

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

## 风险结论

这是 local-only mock route skeleton，不是可用支付 runtime。

下一步应该先做合并后验证记录，再规划 neutral route smoke script；不要跳到 DB-backed route 或真实 Provider。
