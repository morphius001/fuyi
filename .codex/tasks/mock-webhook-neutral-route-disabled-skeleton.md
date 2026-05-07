# mock-webhook-neutral-route-disabled-skeleton

## 目标

新增 neutral mock payment webhook route skeleton，并保持默认 disabled。

这是 provider callback 路径迁移的第一步，只占位 neutral route，不接收真实通知。

## 允许修改

- `packages/api/src/api/china/payment-webhooks/mock/route.ts`
- `packages/api/src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-webhook-neutral-route-disabled-skeleton.md`
- `docs/mock-webhook-neutral-route-disabled-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/package.json`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥
- 支付、订单、退款、结算、佣金、权限业务逻辑

## 必须满足

- route 路径为 `/china/payment-webhooks/mock` 对应的 neutral API route。
- 默认返回 disabled。
- 即使 mock runtime env 被请求，也仍返回 disabled。
- 不读取 request body。
- 不调用 handler。
- 不创建 repository。
- 不连接 DB。
- 不执行 payment workflow。
- 不接支付宝或微信支付。
- 响应不暴露 raw payload、signature、secret 或 workflow result。

## 验证

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

## 不自动执行

- 不自动 commit，除非用户明确授权。
- 不自动 push，除非用户明确授权。
- 不自动创建 PR，除非用户明确授权。
