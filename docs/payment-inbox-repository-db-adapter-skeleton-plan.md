# 支付通知 Inbox DB Adapter Skeleton 计划

## 目标

规划未来 DB-backed `PaymentNotificationInboxRepositoryContract` adapter skeleton 的文件边界、测试边界和风险门禁。

本轮只写计划，不实现 adapter，不连接数据库，不注册 migration，不新增 webhook route。

## 文件边界

未来 skeleton PR 建议只允许：

- `packages/api/src/modules/china-payment-notification/db-inbox-repository.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/payment-db-inbox-repository.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `docs/payment-inbox-repository-db-adapter-skeleton.md`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `project-ledger/**`

禁止：

- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `packages/api/src/workflows/**`
- `packages/api/src/subscribers/**`
- `packages/api/src/jobs/**`
- `packages/api/src/links/**`
- `apps/**`

## Adapter 职责

只做：

- 实现 `PaymentNotificationInboxRepositoryContract`。
- 接收外部注入的 transaction/manager/mock db client。
- 映射 inbox record。
- 映射 event log record。
- 将 duplicate key 转成 duplicate result。
- 将 DB 临时错误转成 retryable error kind。

不做：

- 不自己创建数据库连接。
- 不读取环境变量。
- 不注册 Medusa module。
- 不新增 API route。
- 不调用 payment workflow。
- 不修改 payment/order/refund/settlement/commission/permission。

## Mocked ORM 测试

第一版 skeleton 测试只能 mock transaction client：

- `receive()` 首次插入 inbox + event log。
- duplicate key 后读取已有 inbox + append `dedupe_hit`。
- verified notification 写 `verified` event。
- invalid signature 写 `failed` event。
- `markRetryableFailed()` 增加 retry count + `retry_scheduled` event。
- `markTerminalFailed()` 写 terminal failed + `failed` event。
- append metadata 时不包含 raw payload、完整签名、secret、手机号明文、openid/unionid。

## 事务要求

同一事务内：

```text
insert/update inbox
append event log
commit
```

任一 event log 写入失败，必须回滚 inbox 状态更新。

## 错误映射

- unique conflict -> duplicate result。
- lock timeout -> retryable。
- connection interrupted -> retryable。
- check constraint violation -> terminal / rejected。
- unknown DB error -> unknown，不默认推进处理状态。

## 后续拆分

1. `payment-inbox-repository-db-adapter-skeleton`
   - 写 adapter skeleton + mocked ORM 单测。
   - 不连接真实 DB。

2. `payment-inbox-repository-disposable-db-test-plan`
   - 先写 disposable DB integration test 计划。

3. `payment-inbox-repository-disposable-db-test`
   - 只连接本地 disposable DB。
   - 不连接预发或生产。

4. `mock-webhook-inbox-only-route`
   - route 只接 mock provider。
   - 只写 inbox/event log。
   - 不执行 workflow。

## 验收

任何 adapter skeleton PR 必须通过：

- payment notification harness。
- API typecheck。
- runtime grep 无 route/workflow/subscriber/job/link 注册。
- staged guard 无 `apps/**`、`medusa-config.ts`、`package.json`、`bun.lock`、`.env`。
