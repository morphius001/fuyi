# Refund State Mutation Isolated Preprod Query Surface Implementation

更新时间：2026-05-14 Asia/Shanghai

## 结论

本轮把 isolated preprod operator review 查询面从 plan 推进到了纯 TypeScript 的只读聚合层。

实现以 terminal conflict snapshot 为聚合入口，向下关联 approval persistence、audit persistence、runtime attempt persistence 四段 evidence，输出 redacted、fail-closed 的 review case 视图；未新增 route、未接 DB、未执行 workflow、未写 refund success state。

## Files Changed

- `packages/api/src/modules/china-payment-notification/refund-state-mutation-isolated-preprod-query-surface.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-isolated-preprod-query-surface.unit.spec.ts`
- `.codex/tasks/refund-state-mutation-isolated-preprod-query-surface-validation.md`
- `docs/refund-state-mutation-isolated-preprod-query-surface-implementation.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `memory/learned-rules.md`

## What Changed

1. query surface builder
   - 新增 `createRefundStateMutationIsolatedPreprodQuerySurface()`
   - 支持五个只读查询入口：
     - `reviewCaseByPlatformRefundId`
     - `reviewCaseByApprovalPersistenceIdempotencyKey`
     - `reviewCaseByRuntimeAttemptPersistenceIdempotencyKey`
     - `reviewCaseByTerminalConflictPersistenceIdempotencyKey`
     - `reviewCaseByProviderRefundReference`

2. fail-closed review case aggregation
   - 以 terminal conflict snapshot 为主骨架
   - 强校验：
     - `approval_persistence_idempotency_key`
     - `audit_persistence_idempotency_key`
     - `runtime_attempt_persistence_idempotency_key`
     - `terminal_conflict_persistence_idempotency_key`
     - `platform_refund_id`
     - `provider_refund_reference`
     - `workflow_idempotency_key`
     - `terminal_marker_key`
   - 任一必要 cross-reference 缺失时返回 incomplete case
   - 交叉引用不一致时返回 blocked / fail-closed case

3. redacted review summaries
   - 聚合 approval / audit / runtime attempt / terminal conflict 四段 summary
   - latest event metadata 会再次做 key-based sanitize
   - 不暴露 raw payload、provider request/query、secret、DB URL、PII、terminal marker digest 等敏感字段

4. focused tests
   - happy path review case
   - 五个查询入口一致性
   - missing cross-reference fail-closed
   - cross-reference mismatch fail-closed
   - retryable failed status label
   - isolated preprod proof missing block

## Safety Boundary

本轮仍然保持：

- 不新增 route
- 不连接 production / preprod DB
- 不执行 production workflow
- 不写 refund success state
- 不接真实 provider refund request / query
- 不触发 settlement、commission、payout、permission、fulfillment 或 logistics mutation

## Verification

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source ~/.nvm/nvm.sh && nvm use 24
node --experimental-vm-modules ./node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/modules/china-payment-notification/__tests__/refund-state-mutation-isolated-preprod-query-surface.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
grep -RIn --include="*.ts" "refund-state-mutation-isolated-preprod-query-surface" packages/api/src/modules/china-payment-notification
git diff --check
```

结果：

```text
focused tests passed
API typecheck passed
runtime grep / registration check passed
git diff --check passed
```

## Next Step

建议继续进入 `refund-state-mutation-isolated-preprod-query-surface-validation`，先做合并前收口验证，再决定是否进入下一层 query surface repository resolver / local fixture wiring。
