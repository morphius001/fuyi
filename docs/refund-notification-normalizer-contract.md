# Refund Notification Normalizer Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款通知 fake-only normalizer 纯函数。

结论：通过。该 normalizer 只把 verified fake refund notification 映射为标准 envelope；不新增 route、DB 写入、workflow 或退款状态变更。

## 修改范围

- `packages/api/src/modules/china-payment-notification/refund-notification-normalizer.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-notification-normalizer.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-notification-normalizer-contract.md`
- `docs/refund-notification-normalizer-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Contract 内容

新增 `normalizeRefundNotificationContract()`：

- 输入 verifier result、fake notification body、expected refund request context。
- 校验 verified signature、provider、event id/type、idempotency key、providerRefundId、merchant order ref、payment session、provider transaction、CNY currency 和 requested amount。
- 支持 `refund.succeeded` / `refund.failed`。
- 输出标准 `ChinaPaymentNotificationEnvelope`，使用 `refund_notify:{provider}:{eventId}` 幂等 key。
- 始终返回 `fixtureOnly: true` 和 `executable: false`。

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

normalized envelope 只是后续 inbox / guard 的输入合同，不代表真实退款成功。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-notification-normalizer.unit.spec.ts
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
Test Suites: 34 passed, 34 total
Tests: 242 passed, 242 total
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

1. `refund-manual-review-audit-plan`
2. `payment-refund-runtime-gate-validation`

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
