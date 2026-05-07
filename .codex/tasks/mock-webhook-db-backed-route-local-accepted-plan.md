# Task: mock-webhook-db-backed-route-local-accepted-plan

## 目标

规划 neutral mock webhook route 接入 local disposable Postgres adapter 后的 accepted / duplicate smoke。

本任务只写文档，不修改 route、不写脚本、不连接数据库。

## 允许修改

- `.codex/tasks/mock-webhook-db-backed-route-local-accepted-plan.md`
- `docs/mock-webhook-db-backed-route-local-accepted-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。
- 不调用 payment workflow。

## 计划必须覆盖

- route local DB path 的最小改动。
- local adapter 的显式 env 输入。
- fake secret 和 signed payload smoke。
- accepted / duplicate / rejected smoke 断言。
- inbox / event log 查询断言。
- raw payload / signature / secret / database URL 不落库断言。
- 临时 API、临时 DB、端口和残留清理。
- 为什么仍然不执行 workflow。

## 验证命令

```bash
git diff --check
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
```

## 完成标准

- 文档明确下一轮实现边界和 smoke 验收。
- 不新增 runtime 代码。
- 后续实现仍只允许 local disposable DB + mock provider + inbox-only。
