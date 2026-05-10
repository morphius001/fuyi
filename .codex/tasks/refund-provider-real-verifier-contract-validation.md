# Refund Provider Real Verifier Contract Validation

## 任务

记录 PR #374-#375 provider real verifier contract 合并后验证。

## 范围

- 新增 `docs/refund-provider-real-verifier-contract-validation.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做验证记录。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不接 SDK、真实密钥、route、inbox、provider refund API、refund query API、workflow 或 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- `git diff --check`
- `git status --short --branch`
- `git diff-tree --no-commit-id --name-status -r 248171d`
- `git diff-tree --no-commit-id --name-status -r f712deb`
- focused verifier tests。
- API typecheck。
- payment notification harness。
- 子智能体只读复核。
