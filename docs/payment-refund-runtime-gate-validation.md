# Payment Refund Runtime Gate Validation

更新时间：2026-05-10 Asia/Shanghai

## 目标

汇总当前 payment / refund runtime gate 状态，确认真实退款 runtime 仍未放行。

结论：通过验证，但仍是 No-Go to real refund runtime。当前已有 payment mock inbox-only route gate、disabled provider adapter、fake-only payment verifier / normalizer、refund command / amount / idempotency / notification / manual review 合同；仍没有真实支付宝 / 微信支付 payment 或 refund provider runtime，也没有退款状态写入、结算、佣金或打款联动。

## 已完成 Gate

Payment 侧：

- mock payment notification skeleton / inbox / repository / state guard / command mapper。
- payment notification harness 覆盖 inbox migration disposable DB dry-run。
- disabled-by-default payment provider adapters。
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

## 当前 Go / No-Go

Go：

- 继续 docs-only 或纯函数合同。
- 继续 inbox / guard / audit allowlist 的不可执行合同。
- 继续 local disposable DB dry-run。
- 继续 fake-only verifier / normalizer 测试。

No-Go：

- 不接真实支付宝 / 微信支付 payment 或 refund API。
- 不注册真实 provider。
- 不读取真实 secret、证书、APIv3 key、app id 或 merchant id。
- 不新增真实 refund route。
- 不执行 payment / refund workflow。
- 不写 order / payment / refund 状态。
- 不改变 checkout。
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
Test Suites: 34 passed, 34 total
Tests: 242 passed, 242 total
PASS payment notification idempotency harness completed.
```

Disposable DB dry-run：

```text
CREATE disposable dry-run database: fuyi_payment_notification_inbox_dry_run_20260511000457
APPLY inbox migration skeleton up SQL
CHECK row counts
2|9
APPLY inbox migration skeleton down SQL
PASS payment notification inbox migration skeleton local dry-run completed and disposable database will be dropped.
```

High-risk grep：

- `packages/api/medusa-config.ts` 未命中 `china-payment-notification`，说明模块仍未注册。
- 命中 `workflow_execution_*` 的位置是既有 event log action enum / migration allowlist，不代表 workflow 被调用。
- 命中 `refundStateMutation`、`providerRefundRequest`、`wechat_refund`、`alipay_refund`、`createRefund`、`workflow_execution` 的位置均为 focused tests 负断言。
- 命中 `/api/china/payment-webhooks/mock` 和 `/api/china/payment-providers/mock` 为既有 mock payment route imports；没有新增 refund route。
- 未发现 `provider_refund_request_sent`、`refund_state_mutated` 或 `refund_workflow_executed`。

Diff check：

```text
git diff --check
PASS
```

## 风险说明

- `refund.succeeded` / `refund.failed` 当前只存在于 fake vectors、verifier / normalizer 合同和 inbox schema 预留中，不是生产退款成功来源。
- Normalized refund envelope 只可作为后续 inbox / guard 输入合同，不可直接触发 state mutation。
- Provider request accepted / HTTP 200 / Admin 操作成功都不能代表退款成功。
- 后续如果进入真实退款 runtime，必须先补齐 RBAC、ownership、manual review、audit allowlist、reconciliation 和 settlement / commission / payout block。

## 下一步建议

建议进入：

1. `refund-manual-review-audit-contract`
   - 纯函数 decision builder + tests。
   - 输出仍不可执行。

2. `refund-audit-event-allowlist-contract`
   - 纯 TypeScript allowlist + tests。
   - 不写 DB，不注册 migration。

3. `refund-inbox-state-transition-plan`
   - docs-only 规划 inbox 状态机和 owner。
   - 不修改 order / payment / refund runtime。

仍不能进入真实支付宝 / 微信支付 refund API、checkout、workflow、退款状态写入、结算、佣金、打款、履约或物流 runtime。
