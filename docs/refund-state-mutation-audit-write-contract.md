# Refund State Mutation Audit Write Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `mapRuntimeAdapterToAuditWriteIntent()` 纯函数合同，把 disabled runtime adapter decision 映射为不可执行 audit write intent / audit event。

该合同不会写 DB，不执行 Medusa workflow，不写平台退款成功状态，不触发财务、权限、履约或物流变更。所有输出固定：

```text
auditWriteAllowed: false
dbWriteAllowed: false
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
- `packages/api/src/modules/china-payment-notification/refund-state-mutation-audit-write.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-mutation-audit-write.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-state-mutation-audit-write-contract.md`
- `docs/refund-state-mutation-audit-write-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Contract

输出场景：

- `audit_write_intent_recorded`：runtime adapter record 有效，但 audit writer 仍 disabled。
- `audit_write_input_rejected`：输入不是 runtime adapter record，只记录 audit。
- `audit_write_blocked`：runtime adapter output 不安全。

即使 `writerMode=db`，也只会记录：

```text
writer_mode_ignored_until_go
```

不会写 DB。

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-state-mutation-audit-write.unit.spec.ts
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
Payment notification harness passed: 52 suites, 378 tests
Payment DB dry-run row counts: 2|9
Runtime grep: clean in runtime/export files
子智能体只读复核: No Findings
```

子智能体只读复核先指出 metadata denylist 缺少 `apiKey` / `key` / `dbUrl` 等别名，以及 caller metadata 可能覆盖合同生成审计字段；已补充 denylist，并调整 metadata merge 顺序为合同字段最后覆盖。修复后二次复核 No Findings。

最终 PR 验证还需运行 `git diff --check`。

## No-Go

仍禁止：

- 真实 refund success state mutation。
- 真实 workflow execution。
- Audit writer 连接 route / job / subscriber。
- Audit writer 写生产 / 预发 DB。
- Audit writer 新增 migration 或注册 module。
- Audit writer 触发 settlement / commission / payout。
- Audit writer 修改 fulfillment / logistics。
