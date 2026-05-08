# Task: blocked-external-boundary-rollup

## 目标

在自动队列到达外部阻塞边界后，记录当前已完成的 mock provider runtime 状态、阻塞原因和下一批安全方向，避免后续 agent 误连预发或生产数据库。

## 允许修改

- `.codex/tasks/blocked-external-boundary-rollup.md`
- `docs/blocked-external-boundary-and-next-safe-tracks.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不连接预发或生产数据库。
- 不注册 Provider。
- 不执行 payment workflow。
- 不修改 checkout、order、payment、refund、settlement、commission、payout 或 permission 逻辑。

## 验证命令

```bash
git diff --check
git diff --name-only
```

## 完成标准

- 明确写出 blocked-external 条件。
- 明确写出可继续的安全方向。
- 只改文档、任务文件、队列和 ledger。
