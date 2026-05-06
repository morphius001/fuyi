# Task: integration-release-readiness

## 目标

检查当前 `china/integration-localization` integration worktree 是否适合拆 PR 或进入下一阶段，不 push，不创建 PR。

## 允许修改

- `docs/integration-release-readiness.md`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止运行 `git push`
- 禁止创建 PR
- 禁止修改支付、订单、退款、结算、佣金、权限业务逻辑

## 要求

- 汇总最近提交。
- 标出可合并的低风险提交组。
- 标出需要拆分或后续串行的高风险主题。
- 标出未跟踪文件中哪些不应混入 PR。
- 给出验证命令。

## 验证

```bash
git status --short --branch
git log --oneline -20
git diff --check -- docs/integration-release-readiness.md project-ledger .codex/queue.md
```

## 输出

- 修改文件
- 验证结果
- 风险点
- 下一步建议
