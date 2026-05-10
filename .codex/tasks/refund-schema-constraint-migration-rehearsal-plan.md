# Refund Schema Constraint Migration Rehearsal Plan

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

规划未来本地 disposable PostgreSQL rehearsal 脚本，用于验证 refund schema / constraint migration 草案，不修改真实 migration。

## 允许范围

- 新增 `docs/refund-schema-constraint-migration-rehearsal-plan.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**` runtime
- 不修改真实 migration
- 不新增 rehearsal script
- 不注册 module
- 不连接本地 / 预发 / 生产 DB
- 不新增 route
- 不调用 provider refund API
- 不执行 workflow
- 不写 refund success state
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 验证要求

- `git diff --check`
- `git diff --name-only`
- `git status --short --branch`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
