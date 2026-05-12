# Refund State Mutation Preprod Dry-Run Validation

更新时间：2026-05-12 Asia/Shanghai

## 目标

验证 PR #422 `refund-state-mutation-preprod-dry-run-contract` 合并后的真实状态：

- preprod dry-run contract 仍为 disabled / non-executable。
- 不执行生产 workflow、不写生产 refund success state。
- 不新增 route、job、subscriber、migration。
- 不连接生产 DB、不注册 module、不接 SDK、不写真实密钥。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 已验证合并范围

PR #422 merge commit:

```text
df60ff0c83f5273861532bbc1d230d47a9b0016b
```

合并文件范围：

```text
M .codex/queue.md
M .codex/scripts/payment-notification-idempotency-harness.sh
A .codex/tasks/refund-state-mutation-preprod-dry-run-contract.md
A docs/refund-state-mutation-preprod-dry-run-contract.md
A packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-preprod-dry-run.unit.spec.ts
M packages/api/src/modules/china-payment-notification/index.ts
A packages/api/src/modules/china-payment-notification/refund-state-mutation-preprod-dry-run.ts
M project-ledger/changelog.md
M project-ledger/handoff.md
M project-ledger/status.md
```

## 验证结果

```text
Focused preprod dry-run test: 1 suite / 4 tests passed
API typecheck: passed
Payment notification idempotency harness: 54 suites / 386 tests passed
Payment DB dry-run row counts: 2|9
Runtime grep: no production execution, workflow execution, or refund success mutation call sites found
```

Runtime grep 唯一命中为 denylist 字符串 `"executeWorkflow"`，位于 metadata sanitizer block list，不是 workflow 调用点。

## 结论

`mapWorkflowAdapterCommandToPreprodDryRun()` 仍只输出 disabled preprod dry-run request / audit event：

- `preprodDryRunEnabled=false`
- `productionExecutionAllowed=false`
- `executable=false`
- `workflowDryRunOnly=true`
- `workflowExecutionAllowed=false`
- `stateMutationAllowed=false`
- `runtimeMutationBlocked=true`
- `refundSuccessState=false`

真实 production workflow execution / refund success state mutation 仍 No-Go。下一步只能进入 `refund-state-mutation-final-go-no-go-plan`，做真实状态写入前最终 Go / No-Go 清单。
