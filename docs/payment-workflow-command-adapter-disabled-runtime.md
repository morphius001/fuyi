# Payment Workflow Command Adapter Disabled Runtime

更新时间：2026-05-14 Asia/Shanghai

## 结论

本轮把 payment workflow command DTO 和未来 workflow execution 之间补上了一层明确的 disabled runtime adapter。

结论仍然是 fail-closed：即使 `mock_prepare_command` 路径已经能拿到 `capture_payment` / `close_payment` / `mark_failed` DTO，当前 adapter 也只会把它们记录成 disabled command candidate，不会自动推进 workflow execution。

## Files Changed

- `packages/api/src/modules/china-payment-notification/payment-workflow-command-adapter-disabled-runtime.ts`
- `packages/api/src/modules/china-payment-notification/mock-webhook-composition.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/payment-workflow-command-adapter-disabled-runtime.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/mock-payment-webhook-composition.unit.spec.ts`
- `.codex/tasks/payment-refund-rbac-ownership-enforcement.md`
- `docs/payment-workflow-command-adapter-disabled-runtime.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## What Changed

1. 新增 `mapWorkflowCommandToDisabledRuntimeDecision()`
2. executable / no-op / blocked command decision 现在都会被压成 `workflowExecutionAllowed=false`
3. `mock-webhook-composition` 在 `mock_prepare_command` 路径里现在会返回 `runtimeAdapterDecision`
4. appendEvent 现在写入 disabled runtime adapter 对应的 audit event，而不是假定下一步会执行 workflow

## Safety Boundary

本轮仍然保持：

- `adapterEnabled=false`
- `workflowExecutionAllowed=false`
- `stateMutationAllowed=false`
- `paymentStateMutationAllowed=false`
- `orderStateMutationAllowed=false`
- 不执行 payment workflow
- 不写 payment success / order state mutation
- 不接真实 provider

## Verification

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source ~/.nvm/nvm.sh && nvm use 24
node --experimental-vm-modules ./node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/modules/china-payment-notification/__tests__/payment-workflow-command-adapter-disabled-runtime.unit.spec.ts src/modules/china-payment-notification/__tests__/payment-workflow-command-mapper.unit.spec.ts src/modules/china-payment-notification/__tests__/payment-workflow-command-audit-mapper.unit.spec.ts src/modules/china-payment-notification/__tests__/mock-payment-webhook-composition.unit.spec.ts
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

建议继续进入 `payment-refund-rbac-ownership-enforcement`，先把 payment / refund ownership 与 audit boundary 后端强校验补齐，再考虑更后面的 isolated preprod query surface / persistence adapter 实现。
