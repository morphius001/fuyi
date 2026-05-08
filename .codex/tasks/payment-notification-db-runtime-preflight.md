# Task: payment-notification-db-runtime-preflight

## 目标

规划 payment notification DB runtime preflight 验证，明确进入 DB runtime gate 前的本地 / preprod disposable DB 检查。

本任务只写文档，不接 route、不执行 workflow。

## 允许修改

- `.codex/tasks/payment-notification-db-runtime-preflight.md`
- `docs/payment-notification-db-runtime-preflight.md`
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

- 本地 disposable DB preflight。
- preprod disposable DB preflight。
- migration registration readiness。
- DB connection / transaction / rollback 检查。
- inbox/event log audit checks。
- sensitive data leak checks。
- No-Go 条件。
- 后续 PR 拆分。

## 验证命令

```bash
git diff --check
```

## 完成标准

- 文档明确 preflight Go/No-Go。
- queue 和 ledger 更新。
- 未修改 runtime 代码。
