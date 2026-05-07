# payment-harness-command-mapper

## 目标

把 payment workflow command mapper 单测加入本地 payment notification harness。

## 允许修改

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `docs/payment-notification-idempotency-harness.md`
- `.codex/tasks/payment-harness-command-mapper.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/package.json`
- `bun.lock`
- `.env`

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```
