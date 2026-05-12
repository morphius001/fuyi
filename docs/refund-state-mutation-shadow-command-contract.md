# Refund State Mutation Shadow Command Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `mapRefundReadinessToStateMutationShadowCommand()` 纯函数合同，把 readiness decision 映射为不可执行 state shadow command / audit event。

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
- `packages/api/src/modules/china-payment-notification/refund-state-mutation-shadow-command.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-shadow-command.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-state-mutation-shadow-command-contract.md`
- `docs/refund-state-mutation-shadow-command-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Contract

输出场景：

- `state_shadow_command_recorded`：ready decision 生成不可执行 `refund_state_mutation_shadow` DTO。
- `manual_review_audit_recorded`：manual review decision 只记录 audit。
- `reconciliation_audit_recorded`：reconciliation decision 只记录 audit。
- `state_shadow_command_blocked`：blocked 或 unsafe readiness output。

即使生成 shadow command，也固定：

```text
stateMutationAllowed: false
workflowExecutionAllowed: false
financialMutationAllowed: false
fulfillmentMutationAllowed: false
```

`targetState` 只是审计标签，不代表平台真实 refund state。

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-state-mutation-shadow-command.unit.spec.ts
cd ../..
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
.codex/scripts/payment-notification-idempotency-harness.sh
grep runtime mutation keywords in the new runtime file and export
```

结果：

```text
1 test suite passed
5 tests passed
API typecheck passed
Payment notification harness passed: 49 suites, 364 tests
Payment DB dry-run row counts: 2|9
Runtime grep: clean in runtime/export files
git diff --check passed
```

子智能体只读复核发现 audit metadata 可能重新带入安全旗标；已扩展 metadata denylist，覆盖 `executable`、`workflowExecutionAllowed`、`stateMutationAllowed`、`refundSuccessState`、financial / permission / fulfillment / logistics / provider query / network allowed 旗标，并补充 focused test 断言。

修复后子智能体二次复核：No Findings。确认未发现新增 route、DB 写入、module 注册、SDK / secret / provider 调用、workflow 执行、真实退款状态写入或财务 / 权限 / 履约 / 物流变更。

## No-Go

仍禁止：

- 真实 refund success state mutation。
- 真实 workflow execution。
- Provider inbox route 直接写平台退款状态。
- Provider query snapshot 直接写平台退款状态。
- Shadow command 直接触发 settlement / commission / payout。
- Shadow command 绕过 permission / ownership / audit。
- Shadow command 修改 fulfillment / logistics。
