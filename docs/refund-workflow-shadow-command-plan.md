# Refund Workflow Shadow Command Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

下一步可以新增 `refund-workflow-shadow-command-contract` 纯函数，把 `evaluateRefundStateOwnerHandoffContract()` 的不可执行 decision 映射为 shadow workflow command DTO 和 audit event。该阶段仍不得执行 Medusa workflow，不得写平台退款成功状态，不得联动 settlement / commission / payout / permission / fulfillment / logistics。

`shadow_command_prepared` 只是“未来 workflow adapter 的输入草稿”，不是退款成功，也不是 workflow execution。

## 当前基线

已完成：

- Provider refund inbox route local disposable DB inbox-only rehearsal。
- `evaluateRefundStateOwnerHandoffContract()` 纯函数合同。
- Handoff output 固定 `executable: false`、`runtimeMutationBlocked: true`、`refundSuccessState: false`。
- Handoff decision 覆盖 signature、digest conflict、provider refund id、amount/currency/session、terminal conflict、ownership、permission 和 manual review。

仍未完成：

- Shadow workflow command DTO contract。
- Shadow command audit event mapper。
- Workflow execution adapter。
- Real workflow gate。
- Provider query follow-up owner。
- Reconciliation / settlement owner。

## Planned Contract

建议新增文件：

```text
packages/api/src/modules/china-payment-notification/refund-workflow-shadow-command.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-workflow-shadow-command.unit.spec.ts
docs/refund-workflow-shadow-command-contract.md
```

输入：

```ts
type RefundWorkflowShadowCommandInput = {
  handoffDecision: RefundStateOwnerHandoffDecision
  requestedAt: string
  source: "provider_inbox" | "manual_review" | "reconciliation"
  auditContext: {
    inboxRecordId: string
    provider: "wechat_pay" | "alipay" | "mock_china_pay"
    providerEventId?: string
    providerRefundId?: string
    localRefundCommandKey?: string
    actorType: "system_job" | "admin" | "vendor"
    actorId?: string
  }
}
```

输出：

```ts
type RefundWorkflowShadowCommandDecision = {
  decision:
    | "shadow_command_recorded"
    | "manual_review_audit_recorded"
    | "query_follow_up_required"
    | "reconciliation_required"
    | "blocked"
  executable: false
  workflowExecutionAllowed: false
  runtimeMutationBlocked: true
  refundSuccessState: false
  idempotencyKey: string
  command?: {
    commandType: "refund_workflow_shadow"
    workflowName: "refund_payment"
    shadowOnly: true
    provider: string
    inboxRecordId: string
    providerRefundId?: string
    localRefundCommandKey?: string
    amountMinor?: number
    currency?: "CNY"
  }
  auditEvent: {
    action:
      | "refund_workflow_shadow_command_prepared"
      | "refund_manual_review_required"
      | "refund_query_follow_up_required"
      | "refund_reconciliation_required"
      | "refund_workflow_shadow_blocked"
    metadata: Record<string, unknown>
  }
}
```

## Mapping Rules

| Handoff decision | Shadow command decision | Workflow execution |
| --- | --- | --- |
| `shadow_command_prepared` | `shadow_command_recorded` | 禁止 |
| `manual_review_required` | `manual_review_audit_recorded` | 禁止 |
| `query_required` | `query_follow_up_required` | 禁止 |
| `reconciliation_required` | `reconciliation_required` | 禁止 |
| `blocked` | `blocked` | 禁止 |

## Idempotency

Shadow command idempotency key 应由以下字段组成：

- Handoff `idempotencyKey`。
- Handoff decision。
- `commandType=refund_workflow_shadow`。
- `source`。
- Optional `manualReviewDecision` / `providerRefundId`。

不得包含：

- raw payload。
- signature。
- secret。
- DB URL。
- user phone / address / identity / bank fields。

## Audit Redaction

Metadata allowlist 建议仅保留：

- inbox record id。
- provider。
- event id / provider refund id。
- local refund command key。
- amount / currency。
- decision。
- block codes。
- actor type / actor id。
- source。
- createdAt。

必须过滤：

- `rawProviderPayload`
- `signature`
- `secret`
- `providerRefundRequest`
- `providerRefundQuery`
- `workflowExecution`
- `refundStateMutation`
- `settlementAdjustment`
- `commissionAdjustment`
- `payoutAdjustment`
- `fulfillmentMutation`
- `logisticsMutation`
- phone / address / identity / bank card

## Test Matrix

后续 contract PR 必须覆盖：

- `shadow_command_prepared` 映射为 `shadow_command_recorded`，但 `workflowExecutionAllowed=false`。
- Manual review 映射为 audit-only。
- Query required 映射为 query follow-up required，不调用 query API。
- Reconciliation required 映射为 reconciliation required，不触发 settlement / commission / payout。
- Blocked 映射为 blocked，不生成 command。
- Metadata redaction 不泄露 raw payload、signature、secret、provider query/request、workflow execution、refund state mutation、财务/履约字段和 PII。
- Idempotency key 稳定且不包含敏感字段。

## Verification Commands

后续 contract PR 至少运行：

```bash
git diff --check
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-workflow-shadow-command.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
grep -RIn \
  -e providerRefundRequest \
  -e refundQuery \
  -e execute_workflow \
  -e workflowExecution \
  -e refundStateMutation \
  -e settlement_adjusted \
  -e commission_adjusted \
  -e payout_adjusted \
  -e fulfillment \
  -e logistics \
  packages/api/src/modules/china-payment-notification/refund-workflow-shadow-command.ts || true
```

## PR Sequence

1. `refund-workflow-shadow-command-contract`：纯函数 + focused tests，输出不可执行 command / audit event。
2. `refund-workflow-shadow-command-validation`：合并后验证。
3. `refund-provider-query-follow-up-plan`：规划 provider query owner，不在 route 直接调用。
4. `refund-reconciliation-boundary-plan`：规划对账与 settlement / commission / payout 分离。
5. `refund-workflow-execution-readiness-plan`：未来真正执行 workflow 前再做 gate。

## No-Go

仍禁止：

- 调用 Medusa workflow。
- 写 order / payment / refund terminal state。
- Provider refund query API。
- Provider refund request API。
- Settlement / commission / payout adjustment。
- Permission weakening。
- Fulfillment / logistics mutation。
