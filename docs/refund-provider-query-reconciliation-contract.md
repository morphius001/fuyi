# Refund Provider Query Reconciliation Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `planRefundProviderQueryReconciliation()` 纯函数合同，把 provider query snapshot 和本地只读 expected refund snapshot 映射为不可执行 reconciliation decision / manual review handoff。

该合同不会调用 provider query API，不执行 Medusa workflow，不写平台退款成功状态。所有输出固定：

```text
executable: false
workflowExecutionAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
```

## 修改文件

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `packages/api/src/modules/china-payment-notification/refund-provider-query-reconciliation.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-provider-query-reconciliation.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-provider-query-reconciliation-contract.md`
- `docs/refund-provider-query-reconciliation-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Contract

输入要求：

- Provider query snapshot 必须 redacted。
- Snapshot 必须保持 `providerQueryAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 本地 expected refund snapshot 只作为只读比对。
- ownership / permission 必须通过。

输出场景：

- `ready_for_manual_review`：provider snapshot 与本地只读快照一致，或 provider failure / closed / abnormal 需要运营复核。
- `mismatch_requires_review`：金额、币种、provider refund id、payment session 或 merchant order reference 不一致。
- `provider_still_processing`：provider snapshot 仍 processing / unknown。
- `blocked`：未 redacted、不安全 snapshot、权限/归属失败、终态冲突或输入要求 runtime mutation。

即使 provider snapshot 显示 succeeded，也只生成 manual review handoff，且：

```text
stateMutationAllowed: false
financialMutationAllowed: false
fulfillmentMutationAllowed: false
```

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-provider-query-reconciliation.unit.spec.ts
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
payment notification harness passed: 46 suites / 348 tests, DB dry-run 2|9
runtime grep only matched existing denylist keys and negative assertions
git diff --check passed
```

## No-Go

仍禁止：

- Query snapshot 直接写 refund success state。
- Query snapshot 直接执行 workflow。
- Query snapshot 直接触发 settlement / commission / payout。
- Query snapshot 绕过 permission / ownership / audit。
- Query snapshot 修改 fulfillment / logistics。
- 真实 provider refund request 或 refund query API 调用。
