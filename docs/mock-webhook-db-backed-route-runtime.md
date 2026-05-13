# Mock Webhook DB Backed Route Runtime

更新时间：2026-05-14 Asia/Shanghai

## 结论

本轮把 `payment-runtime-preflight` 真正接进了 mock payment webhook 的 local disposable DB 路由分支，确保 route 在读取 body 之前就先完成 runtime gate、local DB 白名单和 redacted fail-closed 判断。

## Files Changed

- `packages/api/src/api/china/payment-webhooks/mock/route.ts`
- `packages/api/src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts`
- `docs/mock-webhook-db-backed-route-runtime.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `memory/learned-rules.md`

## What Changed

1. local DB route 分支现在会先执行 `evaluatePaymentNotificationRuntimePreflight()`
2. 如果 preflight 阻断，route 会直接返回 fail-closed disabled response
3. fail-closed response 只带 redacted `safeDebug`，不会泄漏 DB URL、secret 或原始 payload
4. 新增路由测试，覆盖 remote host 被 preflight 阻断且不会读取 request body

## Safety Boundaries

本轮仍然保持：

- 只允许 `mock_inbox_only`
- 默认关闭
- 仅限 local / disposable DB
- 不执行 workflow
- 不暴露 success 语义
- 不接 checkout 或真实 provider

## Verification

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
bun run test:unit --runTestsByPath src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts src/modules/china-payment-notification/__tests__/mock-payment-webhook-composition.unit.spec.ts src/modules/china-payment-notification/__tests__/mock-webhook-repository-resolver.unit.spec.ts src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
./.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh accepted
./.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh duplicate
git diff --check
```

## Next Step

建议继续进入 `payment-runtime-inbox-only-route-disposable-db-rehearsal`，把当前 mock webhook DB-backed route 的 local smoke、证据采集和 disposable DB rehearsal 再收紧一轮，但仍不进入 workflow execution 或 payment state mutation。
