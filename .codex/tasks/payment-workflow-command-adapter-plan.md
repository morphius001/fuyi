# payment-workflow-command-adapter-plan

## 目标

规划未来支付通知 state guard 输出如何映射到 Medusa/Mercur payment workflow command adapter。

当前任务只写文档，不实现 adapter，不调用 workflow。

## 允许修改

- `docs/payment-workflow-command-adapter-plan.md`
- `.codex/tasks/payment-workflow-command-adapter-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 必须覆盖

- command adapter 输入/输出。
- capture / close / mark_failed / no_op 映射原则。
- 只读 snapshot 与写入 workflow 分离。
- 审计、幂等、重试、回滚。
- 后续 PR 拆分。

## 禁止行为

- 不实现 adapter。
- 不调用 payment workflow。
- 不接 webhook runtime。
- 不修改 payment、order、refund、settlement、commission、permission。

## 验证命令

```bash
git diff --check -- \
  docs/payment-workflow-command-adapter-plan.md \
  .codex/tasks/payment-workflow-command-adapter-plan.md \
  .codex/queue.md \
  project-ledger
```
