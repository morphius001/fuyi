# Task: mock-webhook-db-backed-route-local-rejected-smoke

## 目标

为 neutral mock webhook local DB path 补齐 rejected smoke，验证缺签名、错签名和非 CNY payload 不写入 inbox / event log。

## 允许修改

- `.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh`
- `.codex/tasks/mock-webhook-db-backed-route-local-rejected-smoke.md`
- `docs/mock-webhook-db-backed-route-local-rejected-smoke.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 route runtime，除非 smoke 暴露 rejected path 的安全 bug。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。
- 不调用 payment workflow。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh rejected
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git diff --check
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
ss -ltnp | grep ':9110' || true
```

## 完成标准

- missing signature 返回 400 `SIGNATURE_MISSING`，DB row count 为 0。
- invalid signature 返回 400 `SIGNATURE_INVALID`，DB row count 为 0。
- non-CNY payload 按当前 route contract 返回 400 `PAYLOAD_INVALID`，DB row count 为 0。
- 响应不泄漏 raw payload、signature、secret 或 DB URL。
- 仍不执行 workflow、不改变交易状态。
