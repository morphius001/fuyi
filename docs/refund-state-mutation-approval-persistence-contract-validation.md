# Refund State Mutation Approval Persistence Contract Validation

更新时间：2026-05-12 Asia/Shanghai

## Scope

本轮只验证 PR #430 合并后的 approval persistence contract 状态。

非目标：

- 不修改 `apps/**`。
- 不新增 route、job、subscriber、migration。
- 不连接生产 DB、不注册 module。
- 不接真实 provider SDK、不写真实密钥。
- 不执行生产 workflow、不写生产 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## Merge Evidence

PR #430 merge commit:

```text
3ce14e780fd4b03550b9e8483c5fbce3262653ea
```

Merged file range:

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

## Verification

```text
Focused approval persistence test: 1 suite / 4 tests passed
API typecheck: passed
Payment notification idempotency harness: 55 suites / 390 tests passed
Payment DB dry-run row counts: 2|9
Runtime grep: only denylist string "executeWorkflow" matched; no workflow invocation found
```

## Decision

真实生产退款成功状态写入仍 No-Go。当前 approval persistence contract 只准备 disabled persistence intent，不写 DB、不执行 workflow。

## Next Step

进入 `refund-state-mutation-audit-persistence-plan`：

- 只规划 audit write persistence。
- 不实现生产 DB 写入。
- 不执行生产 workflow、不写生产 refund success state。
