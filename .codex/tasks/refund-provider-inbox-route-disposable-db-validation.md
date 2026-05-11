# Refund Provider Inbox Route Disposable DB Validation

## 任务

记录 PR #386 `refund-provider-inbox-route-disposable-db` 合并后验证。

## 范围

- 新增 `docs/refund-provider-inbox-route-disposable-db-validation.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只记录验证，不改 runtime。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不连接预发、生产或普通共享数据库。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用 provider refund API / refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- `git diff-tree --no-commit-id --name-status -r 2386086b19fd6ff541d551018d041f12c84a76d7`
- `git show --stat --oneline --no-renames 2386086b19fd6ff541d551018d041f12c84a76d7`
- Focused provider route disposable DB tests。
- `git diff --check`
- `git status --short --branch`
