# Refund Notification Verifier Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款通知 fake-only verifier 纯函数。

结论：通过。该 verifier 仅校验 fake raw body / fake headers，输出验签合同结果；不实现 normalizer、route、DB 写入、workflow 或退款状态变更。

## 修改范围

- `packages/api/src/modules/china-payment-notification/refund-notification-verifier.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-notification-verifier.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-notification-verifier-contract.md`
- `docs/refund-notification-verifier-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Contract 内容

新增 `verifyRefundNotificationContract()`：

- 输入 fake raw body、fake headers、expected fake signature、receivedAt。
- 校验 fake signature、algorithm、provider、event id、event type、provider refund id、CNY currency 和 positive minor amount。
- 支持 `refund.succeeded` / `refund.failed`。
- 输出 `verified`、`signatureStatus`、failure code、provider refund id、raw payload digest 和 `refund_notify:{provider}:{eventId}` idempotency key。
- 始终返回 `fixtureOnly: true` 和 `executable: false`。

## Safety Boundary

本轮没有：

- 实现 normalizer。
- 新增 refund route。
- 写 DB 或注册 migration。
- 调用 Medusa refund workflow。
- 接支付宝 / 微信支付 refund API 或 SDK。
- 读取真实 secret、证书、APIv3 key、app id 或 merchant id。
- 生成 provider refund request。
- 输出 refund success mutation。
- 修改 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

`verified: true` 只表示 fake verifier 合同通过，不代表真实退款成功。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-notification-verifier.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 12 passed, 12 total
```

API typecheck：

```text
bunx tsc --noEmit -p tsconfig.json
PASS
```

Payment notification harness：

```text
Test Suites: 33 passed, 33 total
Tests: 231 passed, 231 total
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

1. `refund-notification-normalizer-contract`
2. `refund-manual-review-audit-plan`
3. `payment-refund-runtime-gate-validation`

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
