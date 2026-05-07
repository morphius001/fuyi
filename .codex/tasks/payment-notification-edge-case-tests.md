# payment-notification-edge-case-tests

## 目标

补齐 mock payment notification skeleton 的 edge-case 单测，覆盖 missing signature、malformed JSON、non-CNY payload 和 weak idempotency source。

## 允许修改

- `packages/api/src/modules/china-payment-notification/__tests__/**`
- `.codex/tasks/payment-notification-edge-case-tests.md`
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
cd packages/api
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/mock-payment-notification.unit.spec.ts
```

并确认 staged 文件不包含禁止范围：

```bash
git diff --cached --name-only | grep -E '^(apps|packages/api/medusa-config.ts|packages/api/package.json|bun.lock|\.env)' && exit 1 || true
```
