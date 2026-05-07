# Task: mock-webhook-db-backed-route-transaction-plan

## 目标

规划 neutral mock webhook route 的 route-level transaction client injection。

本任务只写文档，不写 runtime 代码。目标是让下一轮实现能安全地把 `POST /china/payment-webhooks/mock` 从 local DB skeleton 推进到 local disposable DB inbox-only smoke。

## 允许修改

- `.codex/tasks/mock-webhook-db-backed-route-transaction-plan.md`
- `docs/mock-webhook-db-backed-route-transaction-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。

## 计划必须覆盖

- route 如何识别 local DB gate。
- route 如何获取 request scope / transaction client。
- DB repository factory 如何和 `resolveMockWebhookInboxRepository()` 组合。
- repository available / unavailable / disabled 的响应语义。
- accepted / duplicate / rejected smoke 的前置条件。
- local disposable DB smoke 如何证明写入、幂等和清理。
- 为什么 production 仍然 disabled。
- 后续 PR 拆分和验证命令。

## 验证命令

```bash
git diff --check
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
```

## 完成标准

- 文档明确下一轮实现边界。
- 不新增或修改任何 runtime 代码。
- 不让 payment workflow execution、真实 Provider、退款、对账、结算、佣金或权限进入并行任务。
