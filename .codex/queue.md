# Codex Task Queue

当用户说“执行下一个任务”时，读取本文件，选择第一个未完成且未标记 `local-wip` 或 `done` 的任务。

## Local WIP

- `admin-shell`: local-wip，已经本地完成，暂不作为队列下一项。
- `vendor-shell`: local-wip，已经本地完成，暂不作为队列下一项。

## Queue

1. `codegen-baseline`
2. `pickup-card-architecture`
3. `mock-service-providers`
4. `storefront-zhcn-baseline`

## Status Rules

- `local-wip`: 已经在本地有工作结果，等待人工确认或后续整理。
- `pending`: 可执行。
- `done`: 已完成。
- 未显式标记的队列任务默认为 `pending`。

## Execution Rules

- 执行任务前读取 `AGENTS.md` 和 `.codex/tasks/<task>.md`。
- 默认不要自动 commit。
- 默认不要 push。
- 默认不要创建 PR。
- 默认不要运行 `git reset --hard`, `git merge`, `git rebase`, `git pull`, `git worktree remove`，除非用户当前指令或任务文件明确允许。

