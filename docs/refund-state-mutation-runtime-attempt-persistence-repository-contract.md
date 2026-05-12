# Refund State Mutation Runtime Attempt Persistence Repository Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

本轮新增 runtime attempt persistence repository 的 disabled / non-executable 合同层。当前只定义 record、event、查询接口和 repository intent 纯函数，不连接 production DB、不写 runtime attempt persistence record、不执行 workflow、不写 production refund success state。

## Files Changed

- `packages/api/src/modules/china-payment-notification/refund-state-mutation-runtime-attempt-persistence-repository.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-runtime-attempt-persistence-repository.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `docs/refund-state-mutation-runtime-attempt-persistence-repository-contract.md`
- `.codex/tasks/refund-state-mutation-runtime-attempt-persistence-repository-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Contract Scope

新增：

1. `RefundStateMutationRuntimeAttemptPersistenceRecord`
2. `RefundStateMutationRuntimeAttemptPersistenceEventRecord`
3. `RefundStateMutationRuntimeAttemptPersistenceRepositoryContract`
4. `mapRuntimeAttemptToRepositoryIntent()`

repository contract 只定义：

- `recordRuntimeAttemptPersistence()`
- `appendRuntimeAttemptPersistenceEvent()`
- `getByRuntimeAttemptPersistenceIdempotencyKey()`
- `getByWorkflowIdempotencyKey()`
- `getByPlatformRefundId()`

repository intent 仍保持：

- `repositoryWriteAllowed=false`
- `dbWriteAllowed=false`
- `productionWriteAllowed=false`
- `workflowExecutionAllowed=false`
- `stateMutationAllowed=false`
- `refundSuccessState=false`

## Safety Rules

- production 环境和非 `disabled` writer mode 继续 fail-closed。
- metadata 继续走 denylist sanitization，不泄露 DB URL、provider payload、workflow flag 或财务/履约副作用字段。
- runtime attempt 输入若不安全或缺少 intent，repository contract 直接 blocked / rejected。
- 当前 contract 只输出 disabled repository intent 和 audit event，不代表可写 runtime attempt persistence 主表或 event 表。

## Verification

已运行：

```bash
bun test packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-runtime-attempt-persistence-repository.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
bash .codex/scripts/payment-notification-idempotency-harness.sh
bash .codex/scripts/payment-notification-inbox-local-dry-run.sh
git diff --check
grep -R -n "mapRuntimeAttemptToRepositoryIntent" packages/api/src/api packages/api/src/workflows packages/api/medusa-config.ts || true
grep -R -n "refund_state_mutation_runtime_attempt_persistence_repository" packages/api/src/api packages/api/src/workflows packages/api/medusa-config.ts || true
```

结果：

- focused test 5/5 通过。
- API typecheck 通过。
- payment harness 59 suites / 409 tests 通过。
- payment inbox local dry-run `2|9` 通过。
- `git diff --check` 通过。
- runtime grep 无命中，说明 contract 未被接入 runtime。

## Non-Goals

- 不实现真实 repository adapter
- 不读取或写入 runtime attempt persistence 表
- 不新增 route / job / subscriber
- 不执行 workflow
- 不写 production refund success state
- 不触发 settlement、commission、payout、permission、fulfillment 或 logistics

## Next Step

建议进入 `refund-state-mutation-runtime-attempt-persistence-repository-validation`，只做合并后验证和 No-Go 收口。
