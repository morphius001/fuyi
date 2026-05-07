# Mock Webhook Neutral Route In-Memory Plan

更新时间：2026-05-07 18:55 Asia/Shanghai

## 目标

规划 neutral mock payment webhook route 的 local-only in-memory 分支。

当前 neutral route 已存在：

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
```

它现在默认 disabled，且即使 env requested 也不读 body、不调用 handler。下一步可以让它在本地显式 env 下进入 in-memory inbox-only 分支，但仍不能连接 DB 或执行 payment workflow。

## 必须保持的边界

- 只允许 `NODE_ENV !== production`。
- 只允许 mock provider：`mock_china_pay`。
- 只允许 mode：`mock_inbox_only`。
- 必须要求 `CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true`。
- 必须要求 mock secret，但不能输出 secret。
- 不连接 DB。
- 不写真实 inbox table。
- 不执行 payment workflow。
- 不改变 payment/order/refund/settlement/commission/permission 状态。
- 不接支付宝或微信支付。

## Env Gate

允许进入 local in-memory 分支的条件建议为：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=<temporary mock secret>
NODE_ENV != production
```

任一条件不满足：

```text
HTTP 503
status=disabled
code=RUNTIME_DISABLED
route=mock_payment_webhook_neutral_disabled_only
```

## Handler 复用

local in-memory 分支可以复用现有未注册 handler：

```text
handleMockPaymentWebhookNotification()
```

但必须通过显式依赖注入传入：

- runtime config input。
- raw body。
- headers。
- temporary mock secret。
- receivedAt。
- route-local in-memory repository。

不允许 handler 自己读取 env、创建 DB client 或执行 workflow。

## In-Memory Repository 生命周期

第一版 skeleton 可以 route-local 创建 repository adapter，和当前 Admin local route 一样。

限制：

- 仅用于单请求/单进程本地 smoke。
- 不承诺跨进程幂等。
- 不替代 DB-backed inbox。
- smoke 脚本若要测 duplicate，需要在同一进程同一 route repository 生命周期下设计；如果 route 每次创建新 repository，则 duplicate smoke 延后到 DB-backed 或共享 local repository 设计。

建议先覆盖：

- accepted signed payload。
- missing signature rejected。
- malformed payload rejected。
- production forced disabled。
- response 不泄漏 raw payload、signature、secret。

duplicate 行为可留给后续 DB-backed route 或单独共享 in-memory repository PR。

## Response Contract

accepted：

```json
{
  "status": "accepted",
  "mode": "mock_inbox_only",
  "route": "mock_payment_webhook_neutral_local_inmemory",
  "safeDebug": {
    "runtimeRequested": true,
    "hasRawBody": true
  }
}
```

rejected：

```json
{
  "status": "rejected",
  "code": "SIGNATURE_MISSING",
  "route": "mock_payment_webhook_neutral_local_inmemory"
}
```

禁止输出：

- raw payload。
- full signature。
- mock secret。
- workflow command body。
- workflow result。
- payment/order mutation result。

## 与 Admin Route 的关系

现有 Admin route 不升级为 provider callback。

下一步 neutral in-memory skeleton 完成后：

- smoke script 只打 neutral route。
- Admin route 后续单独规划保留、降级或删除。
- 不为了 provider callback 放开 Admin namespace。

## 后续 PR 拆分

1. `mock-webhook-neutral-route-inmemory-skeleton`
   - neutral route 接 local-only in-memory branch。
   - 增加单测。
   - harness 覆盖。
   - 不写 smoke script。

2. `mock-webhook-neutral-route-inmemory-post-validation`
   - 记录合并后 harness、typecheck、runtime grep 和 DB 无残留。

3. `mock-webhook-neutral-route-smoke-script-plan`
   - 重新规划 smoke script，只针对 neutral route。

4. `mock-webhook-neutral-route-smoke-script`
   - 新增脚本，验证 disabled/accepted/rejected/security。

5. `mock-webhook-admin-route-deprecation-plan`
   - 再规划 Admin route 保留或降级。

## 验证计划

本轮 docs-only：

```bash
git diff --check
git diff --name-only
```

后续 skeleton PR：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

## 结论

可以继续做 neutral route local-only in-memory skeleton，但必须保持它只是本地 mock inbox-only 验证入口。

DB-backed inbox、真实支付 Provider、payment workflow 执行、退款、对账和商家结算仍然后移到单独串行任务。
