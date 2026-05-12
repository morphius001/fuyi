# Refund State Mutation Approval Persistence Contract Validation

更新时间：2026-05-12 Asia/Shanghai

## 目标

验证 PR #430 `refund-state-mutation-approval-persistence-contract` 合并后的真实状态：

- approval persistence contract 仍为 disabled / non-executable。
- 不连接生产 DB、不写 approval record。
- 不执行生产 workflow、不写生产 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 已验证合并范围

PR #430 merge commit:

```text
3ce14e780fd4b03550b9e8483c5fbce3262653ea
```

合并文件范围：

```text
M .codex/queue.md
M .codex/scripts/payment-notification-idempotency-harness.sh
A .codex/tasks/refund-state-mutation-approval-persistence-contract.md
A docs/refund-state-mutation-approval-persistence-contract.md
A packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-approval-persistence.unit.spec.ts
M packages/api/src/modules/china-payment-notification/index.ts
A packages/api/src/modules/china-payment-notification/refund-state-mutation-approval-persistence.ts
M project-ledger/changelog.md
M project-ledger/handoff.md
M project-ledger/status.md
```

## 验证结果

```text
Focused approval persistence test: 1 suite / 4 tests passed
API typecheck: passed
Payment notification idempotency harness: 55 suites / 390 tests passed
Payment DB dry-run row counts: 2|9
Runtime grep: no DB write, workflow execution, or refund success mutation call sites found
```

Runtime grep 唯一命中为 denylist 字符串 `"executeWorkflow"`，位于 metadata sanitizer block list，不是 workflow 调用点。

## 结论

`mapOperatorApprovalToPersistenceIntent()` 仍只输出 disabled approval persistence intent / audit event：

- `approvalWriteAllowed=false`
- `dbWriteAllowed=false`
- `productionWriteAllowed=false`
- `workflowExecutionAllowed=false`
- `stateMutationAllowed=false`
- `runtimeMutationBlocked=true`
- `refundSuccessState=false`

真实生产退款成功状态写入仍 No-Go。下一步进入 `refund-state-mutation-audit-persistence-plan`。
