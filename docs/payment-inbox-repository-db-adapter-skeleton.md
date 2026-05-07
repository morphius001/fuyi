# 支付通知 Inbox DB Adapter Skeleton

## 目标

本轮新增 `DbPaymentNotificationInboxRepository` skeleton。它实现 repository contract，但只依赖构造函数注入的 transaction client。

这不是 runtime 接入，不创建数据库连接，不新增 webhook route，不注册 migration。

## 新增内容

- `PaymentNotificationDbInboxRow`
- `PaymentNotificationDbEventLogRow`
- `PaymentNotificationDbTransaction`
- `PaymentNotificationDbClient`
- `DbPaymentNotificationInboxRepository`
- mocked transaction 单元测试

## 覆盖场景

- verified notification: insert inbox + `received` / `verified` event logs。
- duplicate idempotency: 返回 duplicate + `dedupe_hit` event log。
- invalid signature: terminal failed + `failed` event log。
- retryable failure: retry count + `retry_scheduled` event log。
- event log 写入失败不被吞掉。
- event log metadata 不包含 raw payload、完整签名或 secret。

## 安全边界

- 未修改 `packages/api/medusa-config.ts`。
- 未新增 API route。
- 未接 workflow、subscriber、job 或 link。
- 未连接数据库。
- 未接支付宝、微信支付、退款、对账、结算、佣金或权限。

## 后续

下一步如果继续，应先做 disposable DB integration test 计划，再考虑本地 disposable DB adapter test。仍不能连接预发或生产数据库。
