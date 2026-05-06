# Task: integration-pr-staging-index

## 目标

为 `china/integration-localization` 后续拆 PR 创建一个可执行索引，帮助主 agent 或子 agent 在 staging worktree 中按 PR A-G 精确挑文件，不把未跟踪产物和高风险逻辑混进去。

## 允许修改

- `docs/integration-pr-staging-index.md`
- `project-ledger/**`
- `.codex/queue.md`
- `.codex/tasks/integration-pr-staging-index.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止运行 `git push`
- 禁止创建 PR
- 禁止运行 `git merge`, `git rebase`, `git pull`, `git reset --hard`, `git worktree remove`
- 禁止修改支付、订单、退款、结算、佣金、权限业务逻辑

## 要求

- 以 `docs/integration-release-readiness.md` 为上游边界。
- 给出 PR A-G 的目标、文件候选、验证命令和不要混入的内容。
- 明确 `git add .` 禁止。
- 明确未跟踪历史文档、视觉 QA 产物和 `.mercur/` 默认不自动纳入。

## 验证

```bash
git status --short --branch
git diff --check -- docs/integration-pr-staging-index.md .codex/queue.md .codex/tasks/integration-pr-staging-index.md project-ledger
```

## 输出

- 修改文件
- 验证结果
- 风险点
- 下一步建议
