# Refund Runtime Gate Validation V2

更新时间：2026-05-10 Asia/Shanghai

## 目标

汇总当前退款 runtime gate 第二版验证，确认真实退款 runtime 仍未放行。

结论：通过验证，但仍是 No-Go to real refund runtime。当前退款链路已经具备不可执行的 amount guard、request idempotency、fake-only notification verifier / normalizer、manual review audit、audit event allowlist 和 inbox state transition contract；仍没有真实 refund route、DB-backed refund inbox runtime、provider refund API、workflow execution、退款状态写入、结算、佣金或打款联动。

## 当前已完成 Gate

Payment 侧：

- mock payment notification skeleton / inbox / repository / state guard / command mapper。
- payment notification harness 覆盖 inbox migration disposable DB dry-run。
- disabled-by-default Alipay / WeChat Pay provider adapter skeleton。
- Alipay / WeChat Pay fake notify fixtures。
- Alipay / WeChat Pay fake-only verifier / normalizer contracts。
- mock provider route inbox-only local rehearsal。

Refund 侧：

- `refund-runtime-risk-gate-plan`。
- `refund-command-contract-plan`。
- `refund-amount-guard-contract`。
- `refund-request-idempotency-plan`。
- `refund-request-idempotency-contract`。
- `refund-notification-contract-plan`。
- `refund-notification-fake-fixtures`。
- `refund-notification-verifier-contract`。
- `refund-notification-normalizer-contract`。
- `refund-manual-review-audit-plan`。
- `refund-manual-review-audit-contract`。
- `refund-audit-event-allowlist-contract`。
- `refund-inbox-state-transition-plan`。
- `refund-inbox-state-transition-contract`。

## 当前 Go / No-Go

Go：

- 继续 docs-only validation。
- 继续纯函数合同和 focused tests。
- 继续 local disposable DB dry-run。
- 继续 fake-only provider notification tests。
- 继续 repository docs-only / interface-only plan。
- 继续 audit metadata redaction / denylist 验证。

No-Go：

- 不接真实支付宝 / 微信支付 refund API。
- 不注册真实 refund provider。
- 不读取真实 secret、证书、APIv3 key、app id 或 merchant id。
- 不新增真实 refund route。
- 不写 DB-backed refund inbox runtime。
- 不注册 migration 到 production runtime。
- 不执行 payment / refund workflow。
- 不写 order / payment / refund 状态。
- 不改变 checkout / cart。
- 不改变 settlement、commission、payout。
- 不改变 permission、fulfillment、logistics runtime。

## 验证结果

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

Registration grep：

```text
packages/api/medusa-config.ts
no match for china-payment-notification
```

High-risk runtime grep：

- `workflow_execution_*` 命中既有 payment notification event log type / migration allowlist，不代表 workflow 被调用。
- `refund_state_mutated` / `refund_workflow_executed` / `provider_refund_request_sent` 命中 refund audit event allowlist 的 forbidden actions，不代表已写库或执行。
- `providerRefundRequest` / `refundStateMutation` / `workflowCommand` 在 `refund-inbox-state-transition.ts` 中只作为 audit metadata denylist。
- `providerRefundRequest` / `workflowCommand` / `refundStateMutation` / `createRefund` / `wechat_refund` / `alipay_refund` 在 focused tests 中只作为 fake fixture、恶意 metadata fixture 和负断言。
- `provider_refund_request_sent`、`refund_state_mutated`、`refund_workflow_executed` 仅在 forbidden action allowlist / 负断言语境命中，未发现 runtime 执行、写库或 workflow 调用。
- 未发现新增 refund route、provider refund API、workflow command execution、checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime 写入。

Diff check：

```text
git diff --check
PASS
```

## Risk Notes

- `refund.succeeded` / `refund.failed` 当前仍只是 fake vector、verifier / normalizer 和 inbox transition contract 的输入事件类型，不是生产退款成功来源。
- `accepted_for_guard_only` 只表示 amount / ownership / RBAC guard 没有阻断，不代表退款成功。
- `state_owner_pending` 只是未来 owner handoff，不是 state mutation。
- `processed_for_audit_only` 只表示 audit-only 处理，不代表业务完成。
- Manual review resolved 不能直接修改退款状态。
- Provider request accepted、HTTP 200、Admin 操作成功、前端跳转或回调页都不能代表退款成功。
- 后续真实 runtime 必须先补齐 DB repository owner、transaction boundary、RBAC / ownership gate、reconciliation、settlement / commission / payout block 和 rollback guidance。

## Go Criteria For Future Runtime

未来进入真实 refund runtime 前至少需要：

- DB-backed refund inbox repository contract 已验证。
- Inbox migration production registration 经过 disposable preprod dry-run 和 rollback 验证。
- Provider request sender 使用 mock/sandbox 且默认 disabled。
- Provider notification route 只以验签异步通知为准。
- State transition owner 明确并有幂等、审计、重试和 rollback 设计。
- Admin / Vendor RBAC 和 seller / market ownership gate 完成。
- Reconciliation gate 完成。
- Settlement / commission / payout block 完成。

## 下一步建议

建议继续：

1. `refund-inbox-repository-plan`
   - docs-only 规划 DB-backed refund inbox repository owner、transaction boundary、幂等冲突和 event log 一致性。
   - 不注册 migration，不接 route，不写 runtime。

2. `refund-inbox-repository-interface`
   - interface-only / pure contract。
   - 不连接真实 DB，不注册 runtime。

仍不能直接进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
