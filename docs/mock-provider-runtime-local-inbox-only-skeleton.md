# Mock Provider Runtime Local Inbox-only Skeleton

更新时间：2026-05-08 Asia/Shanghai

## 结论

`POST /china/payment-providers/mock` 已从 disabled-only skeleton 推进到 local disposable DB inbox-only skeleton。

它只在本地开发门禁全部满足时接收 fake signed mock provider notification，并写入本地 disposable DB 的 `payment_notification_inbox` / `payment_notification_event_log`。默认、生产、缺少 registry mode、缺少 local DB gate 或 DB 名不匹配时仍返回 disabled，并且不读取 request body。

## 不是可上线支付能力

本阶段仍然没有：

- 注册 Medusa payment provider。
- 接支付宝或微信支付。
- 读取真实商户密钥。
- 执行 payment workflow。
- 改变 checkout、order、payment、refund、settlement、commission 或 permission 状态。
- 连接预发或生产数据库。

## Runtime Gate

进入 local inbox-only 必须同时满足：

- `NODE_ENV` 不是 `production`。
- `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true`。
- `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only`。
- `CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay`。
- `CHINA_PAYMENT_PROVIDER_REGISTRY_MODE=mock_contract_only`。
- `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true`。
- `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL` 指向本地 disposable DB。
- 当前连接数据库名等于 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME`。
- 实际 Medusa `PG_CONNECTION` 的 server host / port 也必须是本地连接，并与本地 DB URL 端口一致。

本地 DB adapter 仍沿用严格白名单，只接受 `127.0.0.1` / `localhost` 且库名前缀为支付通知 dry-run 前缀的 disposable DB。
Route 还会检查实际注入的 `PG_CONNECTION`，避免 env URL 是本地但实际连接指向远端同名库。

## Route 行为

- 默认：`503 disabled`，不读 body。
- production：`503 production_blocked`，不读 body。
- runtime env 开启但 registry/local DB gate 不完整：`503 disabled`，不读 body。
- local DB accepted：`202 accepted`，只返回安全 debug 字段。
- local DB duplicate：`200 duplicate`，通过 idempotency key replay 识别。
- local DB missing signature：`400 rejected`，响应不泄露 raw payload 或 secret。

`safeDebug` 只保留 `receivedAt`、`hasRawBody` 和 `runtimeRequested`，不返回任何 request header name。

所有响应都禁止泄露：

- raw body
- fake signature
- mock secret
- local DB URL
- payment workflow command
- checkout/payment/order state mutation fields

## 修改文件

- `packages/api/src/api/china/payment-providers/mock/route.ts`
- `packages/api/src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts`
- `.codex/tasks/mock-provider-runtime-local-inbox-only-skeleton.md`
- `docs/mock-provider-runtime-local-inbox-only-skeleton.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## 验证

建议每次合并前运行：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
git grep -n "china-payment-notification" -- packages/api/medusa-config.ts || true
```

## 后续

下一步只能做 post-merge validation 或 local smoke wrapper。真实支付宝、微信支付、退款、对账、商家结算、佣金和权限仍保持高风险串行任务。
