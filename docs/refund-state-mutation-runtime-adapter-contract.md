# Refund State Mutation Runtime Adapter Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `mapOperatorApprovalToRuntimeAdapterDecision()` 纯函数合同，把 operator approval candidate 映射为 disabled / non-executable runtime adapter decision。

该合同不会执行 Medusa workflow，不写平台退款成功状态，不触发财务、权限、履约或物流变更。所有输出固定：

```text
enabled: false
environmentAllowed: false
executable: false
workflowExecutionAllowed: false
stateMutationAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
settlementMutationAllowed: false
commissionMutationAllowed: false
payoutMutationAllowed: false
fulfillmentMutationAllowed: false
logisticsMutationAllowed: false
```

## 修改文件

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `packages/api/src/modules/china-payment-notification/refund-state-mutation-runtime-adapter.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-runtime-adapter.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-state-mutation-runtime-adapter-contract.md`
- `docs/refund-state-mutation-runtime-adapter-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Contract

输出场景：

- `runtime_adapter_disabled_recorded`：approval candidate 有效，但 adapter 仍 disabled。
- `runtime_adapter_input_rejected`：输入不是 approval candidate，只记录 audit。
- `runtime_adapter_blocked`：operator approval output 不安全。

即使 feature flag 或 adapter registration 输入为 true，也只会记录 block code：

```text
feature_flag_ignored_until_go
adapter_registration_ignored_until_go
```

不会启用 runtime。

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-state-mutation-runtime-adapter.unit.spec.ts
cd ../..
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
.codex/scripts/payment-notification-idempotency-harness.sh
grep runtime mutation keywords in the new runtime file and export
```

结果：

```text
1 test suite passed
4 tests passed
API typecheck passed
Payment notification harness passed: 51 suites, 374 tests
Payment DB dry-run row counts: 2|9
Runtime grep: clean in runtime/export files
子智能体只读复核: No Findings
```

最终 PR 验证还需运行 `git diff --check`。

## No-Go

仍禁止：

- 真实 refund success state mutation。
- 真实 workflow execution。
- Runtime adapter 连接 route / job / subscriber。
- Runtime adapter 写生产 / 预发 DB。
- Runtime adapter 触发 settlement / commission / payout。
- Runtime adapter 绕过 permission / ownership / audit。
- Runtime adapter 修改 fulfillment / logistics。
