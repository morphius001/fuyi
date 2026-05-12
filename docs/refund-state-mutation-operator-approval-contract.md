# Refund State Mutation Operator Approval Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `mapRefundShadowCommandToOperatorApproval()` 纯函数合同，把不可执行 state shadow command 映射为不可执行 operator approval candidate / audit event。

该合同不会执行 Medusa workflow，不写平台退款成功状态，不触发财务、权限、履约或物流变更。所有输出固定：

```text
executable: false
workflowExecutionAllowed: false
stateMutationAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
```

只有审批候选成立时才记录：

```text
operatorApprovalRecorded: true
```

该字段仍只是审计候选记录，不代表真实状态写入。

## 修改文件

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `packages/api/src/modules/china-payment-notification/refund-state-mutation-operator-approval.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-operator-approval.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-state-mutation-operator-approval-contract.md`
- `docs/refund-state-mutation-operator-approval-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Contract

输出场景：

- `operator_approval_candidate_recorded`：admin reviewer 证据完整时生成不可执行 approval candidate。
- `operator_approval_rejected`：reviewer 明确拒绝或要求补充证据时只记录 audit。
- `operator_approval_blocked`：shadow command 不安全、缺权限证据、同人审批、system job / vendor 审批、终态冲突或 runtime / side-effect mutation request。

即使生成 approval candidate，也固定：

```text
workflowExecutionAllowed: false
stateMutationAllowed: false
financialMutationAllowed: false
fulfillmentMutationAllowed: false
logisticsMutationAllowed: false
```

`targetState` 仍只是审计标签，不代表平台真实 refund state。

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-state-mutation-operator-approval.unit.spec.ts
cd ../..
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
.codex/scripts/payment-notification-idempotency-harness.sh
grep runtime mutation keywords in the new runtime file and export
```

结果：

```text
1 test suite passed
6 tests passed
API typecheck passed
Payment notification harness passed: 50 suites, 370 tests
Payment DB dry-run row counts: 2|9
Runtime grep: clean in runtime/export files
git diff --check passed
```

子智能体只读复核发现 metadata denylist 缺少 generic provider request / query 与 finance mutation aliases；已补充 sanitizer 和 focused test 注入断言。修复后二次复核：No Findings。

最终 PR 验证已完成。

## No-Go

仍禁止：

- 真实 refund success state mutation。
- 真实 workflow execution。
- Provider inbox route 直接写平台退款状态。
- Provider query snapshot 直接写平台退款状态。
- Operator approval 直接触发 settlement / commission / payout。
- Operator approval 绕过 permission / ownership / audit。
- Operator approval 修改 fulfillment / logistics。
