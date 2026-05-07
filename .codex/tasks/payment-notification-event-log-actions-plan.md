# payment-notification-event-log-actions-plan

## 目标

规划 payment notification event log action 白名单扩展，为 command mapper、future handler 和 workflow execution audit 做准备。

当前任务只写文档，不改 migration。

## 允许修改

- `docs/payment-notification-event-log-actions-plan.md`
- `.codex/tasks/payment-notification-event-log-actions-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 必须覆盖

- 当前 action 白名单。
- 需要新增的 action。
- migration skeleton / dry-run 拆分。
- audit 字段和敏感信息规则。
- 后续 PR 拆分。

## 禁止行为

- 不修改 migration。
- 不接 runtime。
- 不调用 payment workflow。
- 不修改交易状态。

## 验证命令

```bash
git diff --check -- \
  docs/payment-notification-event-log-actions-plan.md \
  .codex/tasks/payment-notification-event-log-actions-plan.md \
  .codex/queue.md \
  project-ledger
```
