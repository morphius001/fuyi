# Refund State Mutation Runtime Attempt Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

本轮新增 `mapTerminalConflictToRuntimeAttemptIntent()` 纯函数合同，用于把 disabled terminal conflict decision 映射为 disabled runtime attempt intent / audit event。合同仍 disabled / non-executable，不连接生产 DB、不写 workflow attempt、不执行生产 workflow、不写 production refund success state。

固定安全输出：

```text
attemptWriteAllowed=false
dbWriteAllowed=false
productionWriteAllowed=false
workflowExecutionAllowed=false
stateMutationAllowed=false
runtimeMutationBlocked=true
refundSuccessState=false
```

## Verification

Focused unit test:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh"
nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-state-mutation-runtime-attempt.unit.spec.ts
```

结果：

```text
PASS src/modules/china-payment-notification/__tests__/refund-state-mutation-runtime-attempt.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 5 passed, 5 total
```

API typecheck:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
source "$HOME/.nvm/nvm.sh"
nvm use 24
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
```

结果：通过。

Payment notification idempotency harness:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
source "$HOME/.nvm/nvm.sh"
nvm use 24
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 58 passed, 58 total
Tests: 404 passed, 404 total
DB dry-run row counts: 2|9
```

Runtime safety grep:

```text
No attemptWriteAllowed=true / dbWriteAllowed=true / productionWriteAllowed=true / workflowExecutionAllowed=true / stateMutationAllowed=true / refundSuccessState=true matches.
Only match: sanitizer denylist string "executeWorkflow"; not a runtime call site.
```

Diff hygiene:

```text
git diff --check passed
```

真实生产退款成功状态写入仍 No-Go。下一步只能做 `refund-state-mutation-runtime-attempt-contract-validation`。
