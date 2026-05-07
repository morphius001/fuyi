# payment-notification-post-merge-validation

## 目标

记录支付通知 PR 串合并后的本地验证结果。

## 允许修改

- `docs/payment-notification-post-merge-validation.md`
- `.codex/tasks/payment-notification-post-merge-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts apps packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
```
