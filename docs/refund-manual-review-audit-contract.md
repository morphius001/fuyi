# Refund Manual Review Audit Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款 manual review audit 纯函数。

结论：通过。该 contract 只根据 guard decision 与风险 signals 生成不可执行 manual review / audit decision；不新增 route、DB 写入、workflow 或退款状态变更。

## 修改范围

- `packages/api/src/modules/china-payment-notification/refund-manual-review-audit.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-manual-review-audit.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-manual-review-audit-contract.md`
- `docs/refund-manual-review-audit-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Contract 内容

新增 `buildRefundManualReviewAuditDecision()`：

- 输入 `RefundAmountGuardDecision`、manual review signals 和审计上下文。
- 输出 `required`、reason codes、severity、retryable、audit action、audit metadata 和 redaction policy。
- 强制 `blockRuntimeMutation: true`。
- 始终返回 `fixtureOnly: true` 和 `executable: false`。
- 不生成 provider refund request，不输出 refund state mutation。

## Safety Boundary

本轮没有：

- 新增 refund route。
- 写 DB 或注册 migration。
- 调用 Medusa refund workflow。
- 接支付宝 / 微信支付 refund API 或 SDK。
- 读取真实 secret、证书、APIv3 key、app id 或 merchant id。
- 生成 provider refund request。
- 输出 refund success mutation。
- 修改 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

manual review decision 只表示是否需要人工复核和审计动作，不代表退款成功。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-manual-review-audit.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 7 passed, 7 total
```

API typecheck：

```text
bunx tsc --noEmit -p tsconfig.json
PASS
```

Payment notification harness：

```text
Test Suites: 35 passed, 35 total
Tests: 249 passed, 249 total
PASS payment notification idempotency harness completed.
```

Runtime grep：

- 只命中 focused test 中的 `refundStateMutation`、`providerRefundRequest`、`wechat_refund`、`alipay_refund`、`createRefund`、`workflow_execution` 负断言。
- 未命中新增 route、provider refund API、真实 SDK 调用、workflow command 或退款状态写入。

Diff check：

```text
git diff --check
PASS
```

## 下一步

推荐继续：

1. `refund-audit-event-allowlist-contract`
2. `refund-inbox-state-transition-plan`

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
