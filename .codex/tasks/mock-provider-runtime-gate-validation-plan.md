# Task: mock-provider-runtime-gate-validation-plan

## 目标

规划 mock provider contract、provider registry、runtime gate、preprod disposable DB gate 的组合验证。

本任务只写文档，不接 runtime。

## 允许修改

- `.codex/tasks/mock-provider-runtime-gate-validation-plan.md`
- `docs/mock-provider-runtime-gate-validation-plan.md`
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

- 组合验证矩阵。
- Mock provider contract 条件。
- Registry 条件。
- Runtime gate 条件。
- Disposable preprod DB gate 条件。
- 失败阻断和后续 PR 拆分。

## 验证命令

```bash
git diff --check
git status --short --untracked-files=all
```

## 完成标准

- 文档明确组合验证顺序。
- 队列更新下一项。
- 未修改业务代码。
