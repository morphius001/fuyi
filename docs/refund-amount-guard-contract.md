# Refund Amount Guard Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款金额 guard 纯函数合同。

结论：通过。`evaluateRefundAmountGuardContract()` 只做本地合同校验，输出始终 `executable: false`，不会发起 provider refund request，不会写 DB，不会调用 Medusa workflow，不会修改 order / payment / refund 状态。

## 修改范围

- `packages/api/src/modules/china-payment-notification/refund-amount-guard.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-amount-guard.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-amount-guard-contract.md`
- `docs/refund-amount-guard-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Contract Coverage

已覆盖：

- valid full refund returns `accepted_for_guard_only` and `executable: false`。
- non-positive amount blocked。
- over-refund blocked。
- pending refund conflict manual review。
- unsupported payment state blocked。
- already refunded state blocked。
- unsupported currency blocked。
- provider mismatch blocked。
- seller ownership mismatch blocked。
- market ownership mismatch blocked。
- admin missing refund role blocked。
- vendor seller ownership mismatch blocked。
- missing reason blocked。
- partial refund missing audit note blocked。
- `other` reason missing audit note blocked。
- repeated idempotency key manual review。
- missing ownership context manual review。

## Safety Boundary

本轮没有：

- 新增 refund route。
- 写 DB 或注册 migration。
- 调用 Medusa refund workflow。
- 接支付宝 / 微信支付 refund API。
- 读取真实 secret。
- 生成 provider refund request。
- 修改 order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

`accepted_for_guard_only` 仅表示合同校验通过，不代表退款请求已发送，也不代表退款成功。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-amount-guard.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 12 passed, 12 total
```

完整验证结果：

- API typecheck：通过。
- Payment notification harness：30 suites / 208 tests passed；local disposable DB dry-run 已创建、回滚并清理。
- Runtime grep：命中既有 payment runtime gate 的 `execute_workflow` 文本和 focused tests 里的 provider/refund state 负断言；未出现新增 refund route、provider refund request、refund state mutation、真实支付宝 / 微信退款 API。
- `git diff --check`：通过。

## 下一步

推荐继续：

1. `refund-request-idempotency-plan`
2. `refund-notification-contract-plan`
3. `refund-manual-review-audit-plan`

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
