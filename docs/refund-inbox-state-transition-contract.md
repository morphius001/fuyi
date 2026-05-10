# Refund Inbox State Transition Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款通知 inbox state transition 纯函数合同。

结论：通过。`evaluateRefundInboxStateTransitionContract()` 只把退款通知输入推进到不可执行的 inbox / audit 状态，明确阻断 runtime mutation；它不写 DB、不接 route、不接 provider refund API、不执行 workflow，也不把 `refund.succeeded` 解释为退款成功。

## 修改范围

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

## Contract 内容

新增：

- `refundInboxStates`
- `refundInboxAllowedTransitions`
- `evaluateRefundInboxStateTransitionContract()`

状态清单：

- `received`
- `signature_verified`
- `normalized`
- `duplicate_seen`
- `digest_conflict_manual_review`
- `guard_checked`
- `manual_review_required`
- `state_owner_pending`
- `runtime_mutation_blocked`
- `terminal_rejected`
- `processed_for_audit_only`

所有 accepted / rejected decision 均固定：

```text
blockRuntimeMutation: true
stateMutationAllowed: false
fixtureOnly: true
executable: false
```

## Covered Cases

Focused tests 覆盖：

- `received -> signature_verified`，仅表示验签可进入 inbox。
- 未 verified 的 signature transition 被拒绝。
- verified `refund.succeeded` envelope 只能进入 `normalized`，不代表退款成功。
- payment envelope 不能进入 refund inbox transition。
- duplicate same digest 进入 `duplicate_seen` no-op。
- duplicate digest conflict 进入 `digest_conflict_manual_review`。
- accepted guard 只能进入 `state_owner_pending`。
- manual review guard 进入 `manual_review_required`。
- manual review 仍 required 时进入 `runtime_mutation_blocked`。
- unsupported transition 被拒绝。
- 输出不包含 provider request、workflow command 或 refund state mutation payload。
- 恶意 audit metadata 中顶层或嵌套的 provider request、workflow command、refund state mutation、provider SDK request、raw payload、private key 和完整手机号会被递归清洗。

## Safety Boundary

本轮没有：

- 新增 API route。
- 写 DB 或注册 migration。
- 注册 `china-payment-notification` module。
- 调用 Medusa payment / refund workflow。
- 接支付宝 / 微信支付 refund API 或 SDK。
- 读取真实 secret、证书、APIv3 key、app id 或 merchant id。
- 生成 provider refund request。
- 写 order / payment / refund 状态。
- 修改 checkout、cart、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

特别说明：

- `refund.succeeded` 只作为 provider notification event type 输入合同，不是业务退款成功。
- `state_owner_pending` 只是未来 owner 的交接点，不是 state mutation。
- `processed_for_audit_only` 只表示 audit-only 处理，不代表业务完成。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-inbox-state-transition.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 11 passed, 11 total
```

API typecheck：

```text
bunx tsc --noEmit -p tsconfig.json
PASS
```

Payment notification harness：

```text
Test Suites: 37 passed, 37 total
Tests: 267 passed, 267 total
PASS payment notification idempotency harness completed.
Disposable DB dry-run row count: 2|9
```

Runtime grep：

- `packages/api/medusa-config.ts` 未命中 `china-payment-notification`，模块仍未注册。
- 高风险关键词只命中新 focused test 里的负断言。
- 未发现 provider refund API、workflow command、refund state mutation、checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime 写入。

Diff check：

```text
git diff --check
PASS
```

## 下一步

建议继续：

1. `refund-runtime-gate-validation-v2`
   - 汇总 refund amount guard、request idempotency、notification verifier / normalizer、manual review、audit allowlist 和 inbox transition contract。
   - 继续确认 No-Go to real refund runtime。

2. `refund-inbox-repository-plan`
   - docs-only 或 interface-only 规划 DB repository owner 和事务边界。
   - 不注册 migration，不接 route。

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
