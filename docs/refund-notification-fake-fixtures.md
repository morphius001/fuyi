# Refund Notification Fake Fixtures

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款通知 fake-only fixtures。

结论：通过。新增 `refundFakeSucceededNotifyVector` 和 `refundFakeFailedNotifyVector`，仅用于后续 verifier / normalizer 合同测试；本轮不实现 verifier、normalizer、route、DB 写入、workflow 或退款状态变更。

## 修改范围

- `packages/api/src/modules/china-payment-notification/refund-notification-test-vectors.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-notification-test-vectors.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-notification-fake-fixtures.md`
- `docs/refund-notification-fake-fixtures.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Fixture 内容

新增：

- `refundFakeSucceededNotifyVector`
  - event type: `refund.succeeded`
  - expected idempotency key: `refund_notify:mock_china_pay:evt_refund_fake_succeeded_001`
  - `fixtureOnly: true`
  - `executable: false`

- `refundFakeFailedNotifyVector`
  - event type: `refund.failed`
  - expected idempotency key: `refund_notify:mock_china_pay:evt_refund_fake_failed_001`
  - `fixtureOnly: true`
  - `executable: false`

两个 fixture 都包含：

- provider refund id。
- provider transaction id。
- merchant order ref。
- payment session id。
- amount / CNY currency。
- refund request key。
- raw body。
- raw payload digest。

## Safety Boundary

本轮没有：

- 实现 verifier。
- 实现 normalizer。
- 新增 refund route。
- 写 DB 或注册 migration。
- 调用 Medusa refund workflow。
- 接支付宝 / 微信支付 refund API。
- 读取真实 secret。
- 生成 provider refund request。
- 输出 refund success mutation。
- 修改 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

`refund.succeeded` fixture 只是 fake test vector，不代表真实退款成功。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-notification-test-vectors.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 4 passed, 4 total
```

API typecheck：

```text
bunx tsc --noEmit -p tsconfig.json
PASS
```

Payment notification harness：

```text
Test Suites: 32 passed, 32 total
Tests: 219 passed, 219 total
PASS payment notification idempotency harness completed.
```

Runtime grep：

- 只命中既有 event type / migration check、fake fixture / focused tests，以及 `providerRefundRequest` / `refundStateMutation` 的负断言。
- 未命中新增 route、provider refund API、真实 SDK 调用、workflow command 或退款状态写入。

Diff check：

```text
git diff --check
PASS
```

## 下一步

推荐继续：

1. `refund-notification-verifier-contract`
2. `refund-notification-normalizer-contract`
3. `refund-manual-review-audit-plan`

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
