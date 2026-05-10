# Refund Inbox Local DB Route Plan

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

规划未来 `/china/refund-inbox/mock` 从 local in-memory inbox-only 扩展到 local disposable DB-backed inbox-only 的安全路径。当前只写计划，不修改 route、不连接 DB。

## 允许范围

- 新增 `.codex/tasks/refund-inbox-local-db-route-plan.md`
- 新增 `docs/refund-inbox-local-db-route-plan.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**`
- 不改 route runtime
- 不连接 DB
- 不注册 module 或 migration
- 不调用 provider refund API 或 workflow
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 计划必须覆盖

- local disposable DB gate
- DB URL / DB name / actual connection validation
- route staged-file guard
- local DB repository adapter scope
- response redaction
- accepted / duplicate / digest conflict semantics
- test matrix
- smoke / harness / dry-run verification
- rollback and cleanup
- Go / No-Go

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
