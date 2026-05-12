# Refund State Mutation Preprod Dry-Run Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

本轮新增 `mapWorkflowAdapterCommandToPreprodDryRun()` 纯函数合同，把 disabled workflow adapter command candidate 映射为 preprod dry-run request / audit event。合同仍 disabled / non-executable，不执行生产 workflow、不连接生产 DB、不写生产 refund success state、不触发财务、权限、履约或物流链路。

## Contract

新增文件：

- `packages/api/src/modules/china-payment-notification/refund-state-mutation-preprod-dry-run.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-preprod-dry-run.unit.spec.ts`

导出：

- `mapWorkflowAdapterCommandToPreprodDryRun`
- `RefundStateMutationPreprodDryRunInput`
- `RefundStateMutationPreprodDryRunDecision`

固定安全输出：

```text
preprodDryRunEnabled=false
productionExecutionAllowed=false
executable=false
workflowDryRunOnly=true
workflowExecutionAllowed=false
stateMutationAllowed=false
runtimeMutationBlocked=true
refundSuccessState=false
settlementMutationAllowed=false
commissionMutationAllowed=false
payoutMutationAllowed=false
permissionMutationAllowed=false
fulfillmentMutationAllowed=false
logisticsMutationAllowed=false
```

`dryRunRequestPrepared=true` 只在 safe workflow command candidate 输入下出现，且只代表 disabled preprod dry-run request shape 已准备；不代表预发 workflow 已执行、生产 workflow 可执行、退款已成功、真实生产 DB 已写入或财务/履约/物流状态变更。

## Safety Behavior

合同会阻断：

- unsafe workflow adapter decision。
- workflow command candidate 缺失。
- production environment。
- 非 disabled dry-run mode。
- feature flag 已打开。
- sandbox provider 缺失。
- production DB 未明确阻断。
- production provider 未明确阻断。
- replay runbook 缺失。

metadata sanitizer 会剔除：

- raw provider payload、签名、证书、密钥、API key、生产 DB URL。
- provider request / query payload。
- executable / workflow / state / success / allowed 安全旗标。
- workflow adapter / preprod dry-run / dry-run request 覆盖字段。
- settlement / commission / payout / permission / fulfillment / logistics mutation hints。
- 完整手机号、地址、身份证、银行卡。

## Verification

Focused unit test:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh"
nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-state-mutation-preprod-dry-run.unit.spec.ts
```

结果：

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

Payment notification harness:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
source "$HOME/.nvm/nvm.sh"
nvm use 24
.codex/scripts/payment-notification-idempotency-harness.sh
```

Runtime grep:

```text
productionExecutionAllowed: true
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
Payment notification idempotency harness: 54 suites / 386 tests passed
Payment DB dry-run row counts: 2|9
Runtime grep: only denylist string "executeWorkflow" matched; no workflow invocation found
```

## Risk Notes

真实生产退款成功状态写入仍 No-Go。下一步只能做 `refund-state-mutation-preprod-dry-run-validation`，验证文件范围、focused tests、harness 和 runtime grep。
