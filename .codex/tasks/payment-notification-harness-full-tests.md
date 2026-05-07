# payment-notification-harness-full-tests

## 目标

升级本地 payment notification harness，让它跑完整 payment notification 单测集合。

## 允许修改

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `docs/payment-notification-idempotency-harness.md`
- `.codex/tasks/payment-notification-harness-full-tests.md`
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
