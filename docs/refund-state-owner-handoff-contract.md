# Refund State Owner Handoff Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `evaluateRefundStateOwnerHandoffContract()` 纯函数合同，用于把 provider refund inbox 结果、expected refund snapshot、ownership / permission check 和 manual review decision 映射为不可执行 handoff decision。

该合同只准备 `refund_state_shadow` command DTO，不执行 workflow，不写平台退款成功状态。所有输出固定：

```text
executable: false
runtimeMutationBlocked: true
refundSuccessState: false
```

## 修改文件

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `packages/api/src/modules/china-payment-notification/refund-state-owner-handoff.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-state-owner-handoff.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-state-owner-handoff-contract.md`
- `docs/refund-state-owner-handoff-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Decision Semantics

输出 decision：

- `shadow_command_prepared`
- `manual_review_required`
- `query_required`
- `reconciliation_required`
- `blocked`

所有 decision 仍不可执行。`shadow_command_prepared` 只代表后续 workflow command adapter 可读取的 DTO，不能代表退款成功。

## Guards

合同会阻断：

- Signature not verified。
- Unsafe inbox state / digest conflict。
- Provider refund failed event。
- Provider refund id missing / mismatch。
- Amount / currency mismatch。
- Payment session mismatch。
- Terminal platform refund state conflict。
- Ownership check failed。
- Permission check failed。
- Manual review rejected / needs query / needs reconciliation。

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-state-owner-handoff.unit.spec.ts
cd ../..
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
```

结果：

```text
1 test suite passed
8 tests passed
API typecheck passed
```

最终 PR 验证还需运行 updated payment notification harness、runtime grep、`git diff --check` 和子智能体复核。

补充验证已通过：

```text
payment notification harness passed: 43 suites / 331 tests, DB dry-run 2|9
runtime grep only matched denylist keys and negative assertions
git diff --check passed
subagent readonly review: No Findings
```

## No-Go

仍禁止：

- Provider notification route 直接写平台退款成功状态。
- Provider query API 在 route 或 handoff contract 内调用。
- Workflow execution。
- Settlement / commission / payout mutation。
- Permission weakening。
- Fulfillment / logistics mutation。
