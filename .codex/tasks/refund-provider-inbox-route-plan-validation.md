# Refund Provider Inbox Route Plan Validation

## 任务

记录 PR #377 `refund-provider-inbox-route-plan` 合并后验证结果。

## 范围

- 新增 `docs/refund-provider-inbox-route-plan-validation.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只记录合并文件范围、验证命令、安全边界和下一步。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不新增 route。
- 不连接 DB。
- 不注册 module。
- 不接 SDK。
- 不写真实密钥。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- `git diff --check`
- `git status --short --branch`
- `git diff-tree --no-commit-id --name-status -r d4f1fe6`
- `git show --stat --oneline --no-renames d4f1fe6`
- 子智能体只读复核。
