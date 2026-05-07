# mock-webhook-route-request-contract

## 目标

为未来 mock China payment webhook inbox-only route 增加请求规整合同：把 route-like `rawBody`、headers、mock secret 和可选 expected amount 转成 `NormalizeMockPaymentNotificationInput`。

本任务只做纯函数、类型、单元测试和文档，不新增 API route，不接 runtime，不连接数据库。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-webhook-route-request-contract.md`
- `docs/mock-webhook-route-request-contract.md`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `packages/api/src/workflows/**`
- `packages/api/src/subscribers/**`
- `packages/api/src/jobs/**`
- `packages/api/src/links/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 安全边界

- 不新增真实 webhook route。
- 不注册 `china-payment-notification` module。
- 不调用 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 行为。
- 不接支付宝、微信支付或任何真实支付 Provider。
- 拒绝结果不能暴露 raw payload、签名、secret、openid、unionid 或 payment/order mutation 字段。

## 合同要求

- 支持 `x-mock-payment-signature`，并兼容 `signature`。
- 支持 `x-mock-payment-event-id`、`x-mock-payment-timestamp`、`x-mock-payment-key-id` 等 mock header。
- headers 需要大小写不敏感；数组 header 取第一个非空值。
- 缺少 raw body 时返回 `PAYLOAD_INVALID`。
- 缺少 mock secret 时返回 `PAYLOAD_INVALID`。
- 缺少签名时返回 `SIGNATURE_MISSING`。
- 本层不解析 JSON，不验签，不查库；payload 解析和验签继续由 normalizer / verifier 负责。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

## 完成后

- 不自动提交，除非用户当前指令明确要求。
- 如果用户已允许 push/PR，可在验证通过、diff 安全后提交并创建 PR。
