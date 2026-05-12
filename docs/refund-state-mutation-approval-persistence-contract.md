# Refund State Mutation Approval Persistence Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

本轮新增 `mapOperatorApprovalToPersistenceIntent()` 纯函数合同，把 disabled operator approval candidate 映射为 approval persistence intent / audit event。合同仍 disabled / non-executable，不连接生产 DB、不写 approval record、不执行生产 workflow、不写 production refund success state。

## Contract

新增文件：

- `packages/api/src/modules/china-payment-notification/refund-state-mutation-approval-persistence.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-approval-persistence.unit.spec.ts`

固定安全输出：

```text
approvalWriteAllowed=false
dbWriteAllowed=false
productionWriteAllowed=false
executable=false
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
/home/codex/.bun/bin/bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-state-mutation-approval-persistence.unit.spec.ts
```

结果：

```text
Test Suites: 1 passed, 1 total
Tests: 4 passed, 4 total
```

Runtime grep:

```text
approvalWriteAllowed: true
dbWriteAllowed: true
productionWriteAllowed: true
workflowExecutionAllowed: true
stateMutationAllowed: true
refundSuccessState: true
executeWorkflow(
createRefund
updateRefund
refund.*succeed
set.*refund
```

结果：

```text
API typecheck: passed
Payment notification idempotency harness: 55 suites / 390 tests passed
Payment DB dry-run row counts: 2|9
Runtime grep: only denylist string "executeWorkflow" matched; no workflow invocation found
```

## Risk Notes

真实生产退款成功状态写入仍 No-Go。下一步只能做 `refund-state-mutation-approval-persistence-contract-validation`，验证文件范围、focused tests、harness 和 runtime grep。
