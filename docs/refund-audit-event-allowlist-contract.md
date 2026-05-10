# Refund Audit Event Allowlist Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增退款 audit event allowlist 纯函数。

结论：通过。该 contract 只校验 audit action 是否在当前不可执行 allowlist 中，并检查 metadata 最小字段、敏感字段和可执行 payload；不写 DB、不新增 route、不执行 workflow。

## 修改范围

- `packages/api/src/modules/china-payment-notification/refund-audit-event-allowlist.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-audit-event-allowlist.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-audit-event-allowlist-contract.md`
- `docs/refund-audit-event-allowlist-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Contract 内容

新增：

- `refundAuditEventAllowedActions`
- `refundAuditEventForbiddenActions`
- `validateRefundAuditEventAllowlistContract()`

允许动作只覆盖 command / guard / notification / manual review / runtime mutation blocked / settlement blocked 等审计事件。

明确禁止：

- `refund_state_mutated`
- `refund_workflow_executed`
- `provider_refund_request_sent`
- `settlement_adjusted`
- `commission_adjusted`
- `payout_adjusted`

metadata 校验：

- 必须包含 audit event、actor、order/payment/session、merchant ref、amount/currency、local idempotency、decision 和 createdAt。
- 禁止 raw provider payload、private key、certificate、APIv3 key、webhook secret、完整用户敏感信息。
- 禁止 provider refund request、refund state mutation、workflow command / execution、provider SDK request。

## Safety Boundary

本轮没有：

- 写 DB 或注册 migration。
- 新增 refund route。
- 调用 Medusa refund workflow。
- 接支付宝 / 微信支付 refund API 或 SDK。
- 读取真实 secret、证书、APIv3 key、app id 或 merchant id。
- 生成 provider refund request。
- 输出 refund success mutation。
- 修改 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

allowlist 只表示审计 action 名称允许被后续合同引用，不代表事件已写库或退款成功。

## Verification

Focused unit test：

```text
PASS src/modules/china-payment-notification/__tests__/refund-audit-event-allowlist.unit.spec.ts
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
Test Suites: 36 passed, 36 total
Tests: 256 passed, 256 total
PASS payment notification idempotency harness completed.
```

Runtime grep：

- `refund-audit-event-allowlist.ts` 命中 `providerRefundRequest` / `refundStateMutation`，这是 `executableMetadataKeys` denylist，用于阻断可执行 provider / workflow / state mutation payload。
- focused test 命中对应 fixture 和负断言。
- 未命中新增 route、provider refund API、真实 SDK 调用、workflow command 执行或退款状态写入。

Diff check：

```text
git diff --check
PASS
```

## 下一步

推荐继续：

1. `refund-inbox-state-transition-plan`

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
