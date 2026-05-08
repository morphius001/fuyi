# Task: mock-provider-runtime-disabled-skeleton-plan

## 目标

规划 mock provider runtime disabled skeleton。

本任务只写文档，不写 runtime code。

## 允许修改

- `.codex/tasks/mock-provider-runtime-disabled-skeleton-plan.md`
- `docs/mock-provider-runtime-disabled-skeleton-plan.md`
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

- disabled skeleton 文件范围。
- 默认 disabled 行为。
- production refusal。
- body / DB / adapter / workflow 禁止顺序。
- 测试清单。
- 后续 PR 拆分。

## 验证命令

```bash
git diff --check
git status --short --untracked-files=all
```

## 完成标准

- 文档明确 disabled skeleton 的实现边界。
- queue 更新下一项。
- 未修改业务代码。
