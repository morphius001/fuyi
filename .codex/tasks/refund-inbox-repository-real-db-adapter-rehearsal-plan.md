# Refund Inbox Repository Real DB Adapter Rehearsal Plan

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

规划未来 `DbRefundInboxRepository` 的 real DB adapter rehearsal。这里的 real DB 只表示本地 disposable PostgreSQL 上的真实 SQL 读写演练，不表示预发 / 生产 DB，不表示真实退款 runtime。

## 允许范围

- 新增 `docs/refund-inbox-repository-real-db-adapter-rehearsal-plan.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**` runtime
- 不连接预发或生产 DB
- 不注册 module / migration
- 不新增 route
- 不调用 provider refund API
- 不执行 payment / refund workflow
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 计划必须覆盖

- local disposable DB only gate
- schema prerequisite
- DB-safe refund state / actor mapping risk
- repository-level rehearsal script boundary
- transaction / rollback / cleanup guard
- metadata redaction and forbidden action checks
- verification matrix
- rollback and No-Go

## 验证要求

- `git diff --check`
- `git diff --name-only`
- `git status --short --branch`
- `git ls-files --others --exclude-standard`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
