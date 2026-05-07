# Mock Webhook Local Route In-Memory Plan

更新时间：2026-05-08 00:55 Asia/Shanghai

## 目标

本计划定义下一步 local-only in-memory mock webhook smoke。它用于证明 route 可以在本地通过 handler skeleton 和 composition helper 走完 mock-only 路径，但仍不连接数据库，不执行 payment workflow。

本轮不修改 route。

## 为什么先 in-memory

不能直接从 disabled route 跳到 DB-backed webhook，因为那会同时引入：

- route runtime
- raw body 签名验证
- repository write
- event log
- DB transaction
- provider retry
- workflow command gate

这些风险需要继续拆开。in-memory smoke 只验证 route 到 handler 的组合，不验证持久化。

## 未来允许行为

在 local-only mode 下，route 可以：

- 读取 raw body。
- 读取 mock headers。
- 读取 mock secret。
- 构造 `InMemoryPaymentNotificationInboxRepository`。
- 调用 `handleMockPaymentWebhookNotification()`。
- 返回 accepted / duplicate / rejected response。

但必须满足：

- `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true`
- `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only`
- `CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay`
- `CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true`
- 环境不能是 production。

## 禁止行为

- 不连接数据库。
- 不使用 `DbPaymentNotificationInboxRepository`。
- 不注册 migration。
- 不执行 payment workflow。
- 不写 payment/order/refund/settlement/commission/permission。
- 不接真实支付宝或微信支付。
- 不把 raw payload、secret、完整签名写入 response。

## Repository 生命周期

in-memory repository 只能是 local smoke 级别。

可选策略：

1. 每个 request 创建一个 repository：简单，但不能跨请求验证 duplicate replay。
2. module-level local repository：可跨请求验证 duplicate replay，但必须只在 local env 允许。

建议第一版用每个 request 创建 repository，duplicate replay 继续由单元测试覆盖；后续如要 browser/curl smoke 再考虑 module-level local repository。

## Local Smoke

未来 smoke 应覆盖：

- 默认 env：disabled 503。
- local in-memory env + valid signed payload：accepted 202。
- missing signature：rejected 400。
- invalid signature：rejected 400。
- malformed JSON：rejected 400。

不要把 local in-memory smoke 误认为预发或生产可用支付通知。

## 后续 PR 拆分

1. `mock-webhook-local-route-inmemory-skeleton`：新增 local-only in-memory branch，默认仍 disabled。
2. `mock-webhook-local-route-inmemory-smoke`：增加本地 curl/script smoke，不连接 DB。
3. `mock-webhook-local-route-disposable-db-plan`：规划本地 disposable DB route smoke。
4. `mock-webhook-local-route-disposable-db-skeleton`：仅本地 disposable DB，不接预发/生产。

真实支付宝、微信支付、退款、对账、商家结算和权限继续单独串行。
