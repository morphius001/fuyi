# Mock Webhook DB-backed Route Transaction Plan

更新时间：2026-05-08 00:25 Asia/Shanghai

## 背景

neutral mock webhook route 现在已经具备 local DB resolver skeleton：

```text
POST /china/payment-webhooks/mock
```

当前行为仍然安全保守：

- `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true` 时优先进入 DB resolver gate。
- 没有 transaction client / repository factory 时返回 disabled。
- 即使 `CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true` 同时存在，也不会绕过 local DB gate。
- 不读取 request body。
- 不写 inbox / event log。
- 不调用 payment workflow。

下一步不是接真实支付，而是规划 route 如何在 local disposable DB smoke 中安全拿到 transaction client，并只做 inbox-only 写入。

## 目标

下一轮实现应达成：

1. local DB flag 打开时，route 可以通过 request scope 或显式 local-only adapter 获取 transaction client。
2. transaction client 只在 local disposable DB smoke 中可用。
3. route 使用 `resolveMockWebhookInboxRepository()` 获取 repository。
4. repository available 后才允许读取 body 并调用 mock webhook handler。
5. handler mode 必须仍是 `mock_inbox_only`。
6. 结果只允许写 inbox / event log，不允许执行 payment workflow。

## 非目标

- 不接支付宝 Provider。
- 不接微信支付 Provider。
- 不注册 production migration。
- 不连接预发或生产数据库。
- 不改变 payment session、order、refund、settlement、commission、payout 或 permission 状态。
- 不实现 workflow execution mode。
- 不把旧 Admin mock route 重新启用。

## Route 组合顺序

建议下一轮 route 顺序：

1. 解析 runtime config。
2. 如果 `NODE_ENV=production`，直接 disabled。
3. 如果 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true`：
   - 尝试创建 local transaction client。
   - 调用 `resolveMockWebhookInboxRepository()`。
   - `disabled` 或 `unavailable`：返回 disabled，不读 body。
   - `available`：读取 raw body，调用 `handleMockPaymentWebhookNotification()`。
4. 如果 local DB 未启用，再走现有 local in-memory smoke 分支。
5. 其他情况继续 disabled。

这样可以保证 local DB gate 比 local in-memory 优先，避免双开关误放行。

## Transaction Client 约束

下一轮实现不要从 route 里硬编码 production DB connection。

允许的低风险方案是增加一个 local-only adapter，例如：

```text
createLocalPaymentNotificationDbClient(input)
```

它必须满足：

- 只在 `NODE_ENV !== production` 时可用。
- 只接受 local disposable DB env，例如 `CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true`。
- 数据库名必须匹配 `fuyi_payment_notification_route_dry_run_*` 或由 smoke 脚本显式传入。
- 不读取 `.env` 中真实支付密钥。
- 不把 database URL、secret、raw payload 写入响应。
- 每次 handler 调用内部使用 transaction 包裹 repository 操作。

如果后续选择 Medusa request scope 的 manager / knex / mikro-orm，需要先写 discovery 文档和 mocked unit test，不能直接在 route 中猜测容器 token。

## Repository Factory

建议 repository factory 只负责把 transaction-capable client 包装成既有 contract：

```text
repositoryFactory(client) => new DbPaymentNotificationInboxRepository(client)
```

其中 client 需要实现当前 `PaymentNotificationDbClient`：

```text
transaction(handler)
```

handler 内部 transaction 需要实现：

```text
insertInbox
updateInbox
findInboxByIdempotencyKey
insertEventLog
```

下一轮可以先新增一个 local disposable Postgres adapter，但必须只被 smoke 脚本显式环境启用。

## 响应语义

local DB path 允许：

- `202 accepted`：新通知写入 inbox / event log。
- `200 duplicate`：同 idempotency key 重放命中幂等。
- `400 rejected`：签名、payload、币种或 event type 拒绝。
- `503 disabled`：runtime disabled、production、resolver unavailable、repository not configured。
- `503 rejected INBOX_RETRYABLE`：DB lock / transient connection 类可重试错误。

禁止：

- 因前端跳转标记支付成功。
- 在 route 中直接调用 payment capture workflow。
- 在 rejected 响应中泄漏 raw payload、signature、secret、database URL。

## Local Disposable DB Smoke

下一轮 smoke 可以从 preflight 扩展到 accepted / duplicate：

1. 创建 disposable DB。
2. 应用 migration skeleton up SQL。
3. 启动临时 API，例如 `127.0.0.1:9110`。
4. 使用 local DB env 和 fake secret。
5. 发送 signed payload。
6. 断言第一次返回 accepted。
7. 发送同一 payload。
8. 断言第二次返回 duplicate。
9. 查询 disposable DB：
   - inbox 只有 1 条。
   - event log 至少包含 received、verified、dedupe_hit。
   - 不包含 raw payload 或 secret。
10. down migration。
11. 删除 disposable DB。
12. 复查没有 `fuyi_payment_notification_route_dry_run_%` 残留。
13. 复查 9110 端口无监听。

## PR 拆分

推荐继续串行：

1. `mock-webhook-db-client-contract-plan`
   - docs-only，确认 local disposable Postgres adapter 的接口和 SQL 映射。
2. `mock-webhook-db-client-contract`
   - 新增 adapter skeleton 和 mocked unit tests，不接 route。
3. `mock-webhook-db-backed-route-local-accepted-plan`
   - docs-only，规划 route 接 adapter 后的 accepted / duplicate smoke。
4. `mock-webhook-db-backed-route-local-accepted`
   - route 接 local-only adapter，仍只在 disposable DB smoke 下可用。
5. `mock-webhook-db-backed-route-post-validation`
   - 合并后跑 harness、smoke、runtime grep、DB 无残留。

workflow execution、支付宝、微信支付、退款、对账和商家结算继续放在更后面的高风险串行队列。

## 验证清单

每个实现 PR 至少跑：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
ss -ltn '( sport = :9110 )' || true
git diff --check
```

## Go / No-Go

Go 条件：

- local DB accepted / duplicate 都只发生在 local disposable DB。
- production 永远 disabled。
- payment workflow 不执行。
- DB 无残留。
- 子 AG 复核没有高风险逻辑混入。

No-Go 条件：

- route 需要真实支付宝或微信支付凭证。
- route 需要修改 order/payment/refund/settlement/commission/permission。
- route 需要注册 production migration。
- route 需要连接预发或生产数据库。
- smoke 无法证明幂等或清理。
