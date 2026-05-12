# Refund State Mutation Workflow Adapter Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

本轮新增 `mapAuditWriteIntentToWorkflowAdapterCommand()` 纯函数合同，把 disabled audit write intent 映射为 workflow adapter command candidate / audit event。合同仍 disabled / non-executable，不执行 Medusa workflow、不写 refund success state、不触发财务、权限、履约或物流链路。

## Contract

新增文件：

- `packages/api/src/modules/china-payment-notification/refund-state-mutation-workflow-adapter.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-workflow-adapter.unit.spec.ts`

导出：

- `mapAuditWriteIntentToWorkflowAdapterCommand`
- `RefundStateMutationWorkflowAdapterInput`
- `RefundStateMutationWorkflowAdapterDecision`

固定安全输出：

```text
adapterEnabled=false
environmentAllowed=false
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

`workflowCommandPrepared=true` 只在 safe audit write intent 输入下出现，且只代表 disabled command candidate shape 已准备；不代表 workflow 执行、退款成功、真实 DB 写入或财务/履约/物流状态变更。

## Safety Behavior

合同会阻断：

- unsafe audit write decision。
- audit write intent 缺失。
- 非 disabled adapter mode。
- feature flag 已打开。
- adapter 已注册。
- dry-run repository 缺失。
- rollback runbook 缺失。

metadata sanitizer 会剔除：

- raw provider payload、签名、证书、密钥、API key、DB URL。
- provider request / query payload。
- executable / workflow / state / success / allowed 安全旗标。
- audit write / workflow adapter / workflow command 覆盖字段。
- settlement / commission / payout / permission / fulfillment / logistics mutation hints。
- 完整手机号、地址、身份证、银行卡。

## Verification

Focused unit test:

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh"
nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-state-mutation-workflow-adapter.unit.spec.ts
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
Payment notification idempotency harness: 53 suites / 382 tests passed
Payment DB dry-run row counts: 2|9
Runtime grep: only denylist string "executeWorkflow" matched; no workflow invocation found
```

## Risk Notes

真实退款成功状态写入仍 No-Go。下一步只能做 `refund-state-mutation-workflow-adapter-validation`，验证文件范围、focused tests、harness 和 runtime grep。
