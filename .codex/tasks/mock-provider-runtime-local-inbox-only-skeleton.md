# Task: mock-provider-runtime-local-inbox-only-skeleton

## 目标

把 `POST /china/payment-providers/mock` 从 disabled-only skeleton 推进到 local disposable DB inbox-only skeleton。

本任务只允许在显式本地开发门禁全部满足时，把 fake signed mock provider notification 写入本地 disposable DB inbox / event log。它仍然不是可上线支付 runtime。

## 允许修改

- `packages/api/src/api/china/payment-providers/mock/route.ts`
- `packages/api/src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts`
- `.codex/tasks/mock-provider-runtime-local-inbox-only-skeleton.md`
- `docs/mock-provider-runtime-local-inbox-only-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不修改 `package.json`、`bun.lock`、`.env` 或真实密钥。
- 不接支付宝、微信支付、短信、IM、物流或真实银行/支付通道。
- 不注册 Medusa payment provider。
- 不执行 payment workflow。
- 不写订单、支付、退款、结算、佣金或权限状态。
- 不连接预发或生产数据库。

## 必须保持的门禁

- 默认返回 disabled，并且不读取 request body。
- `NODE_ENV=production` 必须返回 production blocked，并且不读取 request body。
- 只有以下条件同时满足，才允许进入 local inbox-only：
  - `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true`
  - `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only`
  - `CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay`
  - `CHINA_PAYMENT_PROVIDER_REGISTRY_MODE=mock_contract_only`
  - `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true`
  - `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL` 指向本地 disposable DB
  - 当前连接库名与 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME` 一致
- 实际 Medusa `PG_CONNECTION` 的 server host / port 必须是本地连接，避免 env URL 本地但真实连接远端。
- 响应不得泄露 raw body、signature、mock secret 或 DB URL。
- 响应不得泄露 signature header name、authorization header name 或其它 request header name。
- response body 不得暴露 `execute_workflow`、`checkout`、`paymentStateCommand`、`orderStateCommand`。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
git grep -n "china-payment-notification" -- packages/api/medusa-config.ts || true
```

## 完成标准

- 默认、runtime requested without registry、production blocked 都不读 body。
- local DB accepted / duplicate / missing signature 单测通过。
- remote actual PG connection disabled 单测通过。
- Harness 通过。
- API typecheck 通过。
- 未注册 provider 或 migration。
- 无 disposable DB 残留。
