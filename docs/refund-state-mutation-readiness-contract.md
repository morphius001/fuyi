# Refund State Mutation Readiness Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `evaluateRefundStateMutationReadiness()` 纯函数合同，把退款状态写入前置条件映射为不可执行 readiness decision / shadow DTO。

该合同不会执行 Medusa workflow，不写平台退款成功状态，不触发财务、权限、履约或物流变更。所有输出固定：

```text
executable: false
workflowExecutionAllowed: false
stateMutationAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
```

## 修改文件

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `packages/api/src/modules/china-payment-notification/refund-state-mutation-readiness.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-readiness.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-state-mutation-readiness-contract.md`
- `docs/refund-state-mutation-readiness-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Contract

输出场景：

- `ready_for_shadow_state_command`：所有前置 gate 通过，但仍只输出 `refund_state_mutation_readiness_shadow`。
- `manual_review_required`：manual review policy 或 approval 不完整。
- `reconciliation_required`：query reconciliation 未完成或金额 / 币种 / provider refund id / payment session / merchant order ref 不一致。
- `blocked`：verifier、redaction、inbox、handoff、ownership、permission、terminal state、side-effect isolation、rollback 或 runtime mutation request 不满足。

即使输出 shadow command，也固定：

```text
stateMutationAllowed: false
workflowExecutionAllowed: false
financialMutationAllowed: false
fulfillmentMutationAllowed: false
```

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-state-mutation-readiness.unit.spec.ts
cd ../..
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
```

结果：

```text
1 test suite passed
6 tests passed
API typecheck passed
```

补充验证已通过：

```text
payment notification harness passed: 48 suites / 357 tests, DB dry-run 2|9
runtime grep found no executable state mutation / workflow / refund success switches in the new readiness files
git diff --check passed
```

## No-Go

仍禁止：

- 真实 refund success state mutation。
- 真实 workflow execution。
- Provider inbox route 直接写平台退款状态。
- Provider query snapshot 直接写平台退款状态。
- Manual review 直接绕过 permission / ownership / audit。
- Refund state mutation 直接触发 settlement / commission / payout。
- Refund state mutation 修改 fulfillment / logistics。
