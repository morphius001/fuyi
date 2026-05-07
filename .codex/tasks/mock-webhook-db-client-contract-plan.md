# Task: mock-webhook-db-client-contract-plan

## 目标

规划 local disposable Postgres adapter contract，让 `DbPaymentNotificationInboxRepository` 后续可以在本地 dry-run 中真实写入 inbox / event log。

本任务只写文档，不写 adapter 代码，不接 route。

## 允许修改

- `.codex/tasks/mock-webhook-db-client-contract-plan.md`
- `docs/mock-webhook-db-client-contract-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。

## 计划必须覆盖

- adapter 文件边界。
- local-only env gate。
- disposable DB name / host 安全限制。
- `PaymentNotificationDbClient.transaction()` 的实现边界。
- `insertInbox` / `updateInbox` / `findInboxByIdempotencyKey` / `insertEventLog` SQL 映射。
- unique conflict / retryable DB error 映射。
- mocked unit tests 和后续 local DB smoke。
- 为什么不使用生产连接池或真实 Medusa container token。

## 验证命令

```bash
git diff --check
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
```

## 完成标准

- 文档明确 adapter skeleton 下一 PR 的范围和禁止事项。
- 不新增 runtime 代码。
- 不让真实支付 Provider、payment workflow、退款、对账、结算、佣金或权限进入本轮。
