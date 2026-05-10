# Refund Inbox Local Inbox-only Route Plan

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

规划未来 refund inbox mock route 从 disabled skeleton 进入 fake/local inbox-only 的最小安全路径。当前只写计划，不改 route、不连接 DB、不写 runtime。

## 允许范围

- 新增 `docs/refund-inbox-local-inbox-only-route-plan.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**`
- 不新增 route 行为
- 不注册 module 或 migration
- 不连接 DB
- 不调用 provider refund API 或 workflow
- 不写 inbox / event log
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 计划必须覆盖

- local-only env gate
- provider mock-only gate
- local DB / in-memory repository gate
- fake signature / fake payload contract
- accepted / duplicate / rejected / manual_review_required response contract
- response redaction
- idempotency / digest conflict / metadata redaction
- test matrix
- runtime grep
- rollback
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
