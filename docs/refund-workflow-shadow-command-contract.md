# Refund Workflow Shadow Command Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `mapRefundHandoffToWorkflowShadowCommand()` 纯函数合同，把 `evaluateRefundStateOwnerHandoffContract()` 输出映射为不可执行 shadow workflow command DTO 和 audit event。

该合同不会执行 Medusa workflow，不写平台退款成功状态。所有输出固定：

```text
executable: false
workflowExecutionAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
```

## 修改文件

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `packages/api/src/modules/china-payment-notification/refund-workflow-shadow-command.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-workflow-shadow-command.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-workflow-shadow-command-contract.md`
- `docs/refund-workflow-shadow-command-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Mapping

- `shadow_command_prepared` -> `shadow_command_recorded` + `refund_workflow_shadow` DTO。
- `manual_review_required` -> audit-only。
- `query_required` -> query follow-up required audit-only，不调用 query API。
- `reconciliation_required` -> reconciliation required audit-only，不触发财务调整。
- `blocked` -> blocked audit-only。

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-workflow-shadow-command.unit.spec.ts
cd ../..
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
```

结果：

```text
1 test suite passed
5 tests passed
API typecheck passed
```

最终 PR 验证还需运行 updated payment notification harness、runtime grep、`git diff --check` 和子智能体复核。

补充验证已通过：

```text
payment notification harness passed: 44 suites / 336 tests, DB dry-run 2|9
runtime grep only matched denylist keys, workflowExecutionAllowed=false, and negative assertions
git diff --check passed
subagent readonly review: No Findings
```

## No-Go

仍禁止：

- Provider notification route 直接写平台退款成功状态。
- Provider query API 在 route 或 shadow command contract 内调用。
- Workflow execution。
- Settlement / commission / payout mutation。
- Permission weakening。
- Fulfillment / logistics mutation。
