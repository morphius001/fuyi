# Refund State Mutation Preprod Dry-Run Validation

更新时间：2026-05-12 Asia/Shanghai

## Scope

本轮只验证 PR #422 合并后的 preprod dry-run contract 状态，并记录 Go / No-Go 结论。

非目标：

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不新增 route、job、subscriber、migration。
- 不连接生产 DB、不注册 module。
- 不接真实 provider SDK、不写真实密钥。
- 不执行生产 workflow、不写生产 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## Merge Evidence

PR #422 merge commit:

```text
df60ff0c83f5273861532bbc1d230d47a9b0016b
```

Merged file range:

```text
M .codex/queue.md
M .codex/scripts/payment-notification-idempotency-harness.sh
A .codex/tasks/refund-state-mutation-preprod-dry-run-contract.md
A docs/refund-state-mutation-preprod-dry-run-contract.md
A packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-preprod-dry-run.unit.spec.ts
M packages/api/src/modules/china-payment-notification/index.ts
A packages/api/src/modules/china-payment-notification/refund-state-mutation-preprod-dry-run.ts
M project-ledger/changelog.md
M project-ledger/handoff.md
M project-ledger/status.md
```

## Verification

Focused preprod dry-run contract test:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh"
nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-state-mutation-preprod-dry-run.unit.spec.ts
```

Result:

```text
Test Suites: 1 passed, 1 total
Tests: 4 passed, 4 total
```

API typecheck:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
source "$HOME/.nvm/nvm.sh"
nvm use 24
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
```

Result: passed.

Payment notification idempotency harness:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
source "$HOME/.nvm/nvm.sh"
nvm use 24
.codex/scripts/payment-notification-idempotency-harness.sh
```

Result:

```text
Test Suites: 54 passed, 54 total
Tests: 386 passed, 386 total
Payment DB dry-run row counts: 2|9
PASS payment notification idempotency harness completed.
```

Runtime grep checked for enabled production/workflow/refund success mutation paths:

```text
productionExecutionAllowed: true
workflowExecutionAllowed: true
stateMutationAllowed: true
refundSuccessState: true
executeWorkflow
createRefund
updateRefund
refund.*succeed
set.*refund
```

Only `"executeWorkflow"` appeared inside the metadata sanitizer denylist. No runtime invocation was found.

## Decision

Current preprod dry-run contract remains disabled / non-executable:

```text
preprodDryRunEnabled=false
productionExecutionAllowed=false
executable=false
workflowDryRunOnly=true
workflowExecutionAllowed=false
stateMutationAllowed=false
runtimeMutationBlocked=true
refundSuccessState=false
```

真实 production workflow execution / 退款成功状态写入仍为 No-Go。

## Next Step

进入 `refund-state-mutation-final-go-no-go-plan`：

- 只做真实状态写入前最终 Go / No-Go 清单。
- 不执行生产 workflow、不写生产 refund success state。
- 不改变财务、权限、履约、物流链路。
