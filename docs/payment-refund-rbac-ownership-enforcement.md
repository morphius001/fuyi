# Payment Refund RBAC Ownership Enforcement

更新时间：2026-05-14 Asia/Shanghai

## 结论

本轮把 payment / refund 相关 ownership、RBAC 和 audit hook 边界继续往纯后端校验层推进了一步。

payment 侧现在会在 state guard 里检查 payment session 与 order 的 seller / market ownership 一致性；refund 侧则新增了显式 audit hook mapper，把 refund amount guard 的 accepted / blocked / manual review 决策转成可复用、已脱敏的 audit hook 输出。

## Files Changed

- `packages/api/src/modules/china-payment-notification/types.ts`
- `packages/api/src/modules/china-payment-notification/state-guard.ts`
- `packages/api/src/modules/china-payment-notification/refund-guard-audit-hook.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/payment-notification-state-guard.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-guard-audit-hook.unit.spec.ts`
- `.codex/tasks/refund-state-mutation-isolated-preprod-query-surface-implementation.md`
- `docs/payment-refund-rbac-ownership-enforcement.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## What Changed

1. payment notification state guard
   - 新增 `seller_ownership_mismatch`
   - 新增 `market_ownership_mismatch`
   - 只有 payment session 与 order 的 seller / market 双方都存在且一致时，才允许继续往 command decision 走
   - 任一侧缺失 ownership 上下文时也会 fail-closed 阻断，不让不完整上下文绕过 guard

2. refund audit hook mapper
   - 新增 `mapRefundAmountGuardDecisionToAuditHook()`
   - accepted -> `refund_guard_accepted_for_review`
   - blocked -> `refund_guard_blocked`
   - manual review -> `refund_guard_manual_review_required`
   - 输出会过滤 raw payload、signature、providerRefundRequest、workflowExecution 等敏感字段

## Safety Boundary

本轮仍然保持：

- 不执行 payment workflow
- 不写 payment success 或 refund success state
- 不改 checkout、cart、settlement、commission、payout、permission 真实运行时行为
- 不连接 preprod / production DB

## Verification

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source ~/.nvm/nvm.sh && nvm use 24
node --experimental-vm-modules ./node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/modules/china-payment-notification/__tests__/payment-notification-state-guard.unit.spec.ts src/modules/china-payment-notification/__tests__/refund-amount-guard.unit.spec.ts src/modules/china-payment-notification/__tests__/refund-guard-audit-hook.unit.spec.ts src/modules/china-payment-notification/__tests__/payment-workflow-command-adapter-disabled-runtime.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

结果：

```text
focused tests passed
API typecheck passed
git diff --check passed
```

## Next Step

建议继续进入 `refund-state-mutation-isolated-preprod-query-surface-implementation`，先把 approval / audit / runtime-attempt / terminal-conflict 的只读聚合查询面落下来，继续保持 redacted / fail-closed。
