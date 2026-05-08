# Task: mock-provider-runtime-design

## 目标

设计 mock provider runtime wiring。

本任务只写文档，不写 runtime code。

## 允许修改

- `.codex/tasks/mock-provider-runtime-design.md`
- `docs/mock-provider-runtime-design.md`
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

## 设计内容

- Runtime route 边界。
- Runtime config / registry / gate 调用顺序。
- Inbox write 和 audit event。
- Command prepare 和 workflow block。
- Failure mapping。
- Rollback 和 feature flag。
- 后续 PR 拆分。

## 验证命令

```bash
git diff --check
git status --short --untracked-files=all
```

## 完成标准

- 文档明确 wiring 顺序和禁止项。
- queue 更新下一项。
- 未修改业务代码。
