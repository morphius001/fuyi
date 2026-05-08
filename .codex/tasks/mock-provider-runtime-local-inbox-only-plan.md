# Task: mock-provider-runtime-local-inbox-only-plan

## 目标

规划 mock provider runtime local disposable DB inbox-only 阶段。

本任务只写文档，不写 runtime code。

## 允许修改

- `.codex/tasks/mock-provider-runtime-local-inbox-only-plan.md`
- `docs/mock-provider-runtime-local-inbox-only-plan.md`
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

## 规划内容

- local-only gate。
- disposable DB gate。
- inbox-only route 顺序。
- smoke 测试清单。
- workflow block。
- 后续 PR 拆分。

## 验证命令

```bash
git diff --check
git status --short --untracked-files=all
```

## 完成标准

- 文档明确 local inbox-only runtime 的前置条件和禁止项。
- queue 更新下一项。
- 未修改业务代码。
