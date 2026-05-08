# Mock Webhook DB-backed Route Local Rejected Smoke

更新时间：2026-05-08 12:45 Asia/Shanghai

## 本轮目标

本轮只扩展 `.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh`，新增 `rejected` mode，验证 neutral mock webhook local DB path 的拒绝路径。

## 覆盖场景

1. Missing signature
   - HTTP 400。
   - `status = rejected`。
   - `code = SIGNATURE_MISSING`。
   - inbox count = 0。
   - event log count = 0。

2. Invalid signature
   - HTTP 400。
   - `status = rejected`。
   - `code = SIGNATURE_INVALID`。
   - inbox count = 0。
   - event log count = 0。

3. Non-CNY payload
   - HTTP 400。
   - `status = rejected`。
   - `code = PAYLOAD_INVALID`。
   - inbox count = 0。
   - event log count = 0。

## 安全断言

脚本继续断言响应不包含：

- raw payload。
- mock secret。
- signature。
- local DB URL。

脚本仍固定使用 9110，仍要求 dry-run DB name 满足 `fuyi_payment_notification_route_dry_run_[A-Za-z0-9_]+`，并在结束后停止临时 API、terminate disposable DB sessions、drop disposable DB。

## 验证结果

已执行：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh rejected
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git diff --check
psql -h 127.0.0.1 -p 15432 -U codex -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%' order by datname"
ss -ltnp | grep ':9110' || true
```

结果：

- payment notification harness 通过：16 suites / 108 tests。
- rejected smoke 三个场景均通过。
- non-CNY 当前沿用 route / normalizer 现有 contract：400 `PAYLOAD_INVALID`；后续如需更细错误码，单独拆 PR。
- API typecheck 通过。
- `git diff --check` 通过。
- route / inbox disposable DB 无残留。
- 9110 无残留监听。

## 非目标

本轮未修改 route runtime，未执行 payment workflow，未注册 migration，未接真实支付宝/微信支付，也未改变 checkout、order、payment、refund、settlement、commission 或 permission。
