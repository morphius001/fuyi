# Task: mock-provider-runtime-readiness-checklist

## 目标

整理进入 mock provider runtime 前的 Go / No-Go checklist。

本任务只写文档，不写 runtime code。

## 允许修改

- `.codex/tasks/mock-provider-runtime-readiness-checklist.md`
- `docs/mock-provider-runtime-readiness-checklist.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不连接外部数据库。
- 不接支付宝或微信支付。
- 不注册 Medusa payment provider。
- 不执行 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 验证命令

```bash
git diff --check
git status --short --untracked-files=all
```

## 完成标准

- checklist 明确 runtime 前置条件。
- queue 更新下一项。
- 未修改业务代码。
