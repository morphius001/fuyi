# refund-state-mutation-approval-persistence-repository-contract

## 目标

新增 approval persistence repository 的 disabled / non-executable 合同层，先定义 repository record、event、查询接口和 repository intent 纯函数，不连接 production DB、不写 approval record、不执行 workflow。

## 允许修改

- `packages/api/src/modules/china-payment-notification/refund-state-mutation-approval-persistence-repository.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-approval-persistence-repository.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `docs/refund-state-mutation-approval-persistence-repository-contract.md`
- `.codex/tasks/refund-state-mutation-approval-persistence-repository-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## 禁止修改

- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `packages/api/src/workflows/**`
- `apps/**`
- 任何真实 DB adapter、route、job、subscriber、workflow execution、refund success state mutation

## 验证

1. `bun test packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-approval-persistence-repository.unit.spec.ts`
2. `bunx tsc --noEmit -p packages/api/tsconfig.json`
3. `bash .codex/scripts/payment-notification-idempotency-harness.sh`
4. `bash .codex/scripts/payment-notification-inbox-local-dry-run.sh`
5. `git diff --check`
6. runtime grep 确认未接入 `medusa-config.ts`、`src/api/**` 或 `src/workflows/**`
