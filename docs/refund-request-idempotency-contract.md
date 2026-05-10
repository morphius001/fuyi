# Refund Request Idempotency Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款请求幂等 key 纯函数合同。

结论：通过。新增 helper 只生成 local command idempotency key 和 provider refund request key，不发起退款请求、不写 DB、不调用 workflow、不表达退款成功。

## 修改范围

- `packages/api/src/modules/china-payment-notification/idempotency.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-request-idempotency.unit.spec.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-request-idempotency-contract.md`
- `docs/refund-request-idempotency-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Contract Coverage

已覆盖：

- local refund command key 稳定。
- request day 使用 Asia/Shanghai bucket。
- invalid date 使用 `invalid_date`。
- amount、actor、reason、day 变化会生成不同 local command key。
- provider refund request key 稳定。
- provider request key 按 amount 和 local command id 分叉。
- noisy key parts 会规范化。
- key 不包含 `succeeded`、`success` 或 `refunded` 成功语义。
- key 不包含 raw payload、secret、private key、API key、手机号等敏感值。

## Safety Boundary

本轮没有：

- 新增 refund route。
- 写 DB 或注册 migration。
- 调用 Medusa refund workflow。
- 接支付宝 / 微信支付 refund API。
- 读取真实 secret。
- 生成 provider refund request 对象。
- 输出 refund success。
- 修改 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

Provider refund request key 只是未来调用 provider 前的幂等标识，不代表请求已发出，更不代表退款成功。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-request-idempotency.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 7 passed, 7 total
```

完整验证结果：

- API typecheck：通过。
- Payment notification harness：31 suites / 215 tests passed；local disposable DB dry-run 已创建、回滚并清理。
- Runtime grep：命中 `refund_cmd` / `refund_req` key builder、本轮 focused test 的 key 字符串，以及既有 refund amount guard focused tests 里的 provider/refund state 负断言；未出现新增 refund route、provider refund request、refund state mutation 或真实 refund API。
- `git diff --check`：通过。

## 下一步

推荐继续：

1. `refund-notification-contract-plan`
2. `refund-manual-review-audit-plan`
3. `payment-refund-runtime-gate-validation`

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
