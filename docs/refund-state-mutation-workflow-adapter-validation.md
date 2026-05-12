# Refund State Mutation Workflow Adapter Validation

更新时间：2026-05-12 Asia/Shanghai

## Scope

本轮只验证 PR #419 合并后的 workflow adapter contract 状态，并记录 Go / No-Go 结论。

非目标：

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不新增 route、job、subscriber、migration。
- 不连接 DB、不注册 module。
- 不接真实 provider SDK、不写真实密钥。
- 不执行 workflow、不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## Merge Evidence

PR #419 merge commit:

```text
0806a098f7aafa6188e83d610a817762f8fcf35f
```

Merged file range:

```text
M .codex/queue.md
M .codex/scripts/payment-notification-idempotency-harness.sh
A .codex/tasks/refund-state-mutation-workflow-adapter-contract.md
A docs/refund-state-mutation-workflow-adapter-contract.md
A packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-workflow-adapter.unit.spec.ts
M packages/api/src/modules/china-payment-notification/index.ts
A packages/api/src/modules/china-payment-notification/refund-state-mutation-workflow-adapter.ts
M project-ledger/changelog.md
M project-ledger/handoff.md
M project-ledger/status.md
```

## Verification

Focused workflow adapter contract test:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh"
nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-state-mutation-workflow-adapter.unit.spec.ts
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
Test Suites: 53 passed, 53 total
Tests: 382 passed, 382 total
Payment DB dry-run row counts: 2|9
PASS payment notification idempotency harness completed.
```

Runtime grep checked for enabled audit/db/state/workflow/refund success mutation paths:

```text
auditWriteAllowed: true
dbWriteAllowed: true
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

Current workflow adapter contract remains disabled / non-executable:

```text
adapterEnabled=false
environmentAllowed=false
executable=false
workflowDryRunOnly=true
workflowExecutionAllowed=false
stateMutationAllowed=false
runtimeMutationBlocked=true
refundSuccessState=false
```

真实 workflow execution / 退款成功状态写入仍为 No-Go。

## Next Step

进入 `refund-state-mutation-preprod-dry-run-plan`：

- 只规划一次性预发 dry-run gate。
- 继续要求第一版不可执行。
- 不执行生产 workflow、不写生产 refund success state。
- 不改变财务、权限、履约、物流链路。
