# refund-inbox-state-transition-contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

新增退款通知 inbox state transition 纯函数合同和 focused tests。

该合同只允许把 refund notification inbox 输入推进到安全的中间状态或 audit-only 状态；输出必须不可执行，不能代表退款成功。

## 范围

允许修改：

- `packages/api/src/modules/china-payment-notification/refund-inbox-state-transition.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-inbox-state-transition.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-inbox-state-transition-contract.md`
- `docs/refund-inbox-state-transition-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

禁止修改：

- `apps/**`
- `packages/api/medusa-config.ts`
- route、workflow、subscriber、provider runtime
- DB repository runtime 或 migration 注册
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment、logistics runtime

## 必须满足

- 输出 `fixtureOnly: true`。
- 输出 `executable: false`。
- 输出 `blockRuntimeMutation: true`。
- 输出 `stateMutationAllowed: false`。
- `refund.succeeded` envelope 只能推进到 inbox state，不得变成退款成功。
- duplicate same digest 必须 no-op。
- duplicate digest conflict 必须进入 manual review / runtime blocked。
- accepted guard 只能进入 `state_owner_pending`，不能执行 workflow。
- manual review 不能直接改变退款状态。

## 验证

至少执行：

```bash
cd packages/api && bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-inbox-state-transition.unit.spec.ts
cd packages/api && bunx tsc --noEmit -p tsconfig.json
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

并安排子智能体只读复核。
