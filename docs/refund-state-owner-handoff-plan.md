# Refund State Owner Handoff Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

下一步不能让 provider refund inbox route 直接写平台退款成功状态。应先建立 state owner handoff 计划：provider notification 只进入 inbox / audit；manual review 和 guard 输出 handoff decision；platform refund state owner 只能通过单独 workflow command adapter 接收不可执行或 shadow command；真正执行 workflow 必须再拆独立高风险 PR。

当前结论仍是 No-Go to refund success mutation。

## 当前基线

已经完成：

- Fake refund notification verifier / normalizer / inbox transition 合同。
- Refund inbox repository interface、DB skeleton、local disposable DB rehearsal。
- Refund schema constraints rehearsal 和未注册 migration skeleton。
- Provider-specific WeChat / Alipay refund verifier contract。
- Provider refund inbox route disabled shadow、local in-memory wiring、local disposable DB wiring。
- 所有 route response 仍固定 `refundSuccessState: false`，`accepted` / `duplicate` / `manual_review` / `processed_for_audit_only` / `query_required` 都不代表平台退款成功。

仍未完成：

- Platform refund state owner contract。
- Refund workflow command adapter。
- Permission / ownership gate。
- Manual review operator decision contract。
- Provider refund query follow-up owner。
- Reconciliation owner。
- Settlement / commission / payout adjustment plan。

## State Ownership Layers

| Layer | Owner | 可以做 | 不能做 |
| --- | --- | --- | --- |
| Provider notification route | provider route | 验签、normalize、写 inbox / event log | 写平台退款状态、查 provider、执行 workflow |
| Refund inbox repository | inbox module / repository | 幂等、duplicate、digest conflict、audit event | 决定订单 / 支付 / 退款 terminal state |
| Manual review | Admin operator + audit | 记录复核结论、reason code、redacted note | 绕过权限、直接触发财务或履约 mutation |
| State handoff guard | refund state owner contract | 汇总 verifier、金额、币种、ownership、permission、manual review | 直接执行 provider request/query |
| Workflow command adapter | future workflow boundary | 生成幂等 command 或 shadow command | 在同一 PR 执行 workflow |
| Reconciliation | future finance/recon owner | 对账、差异、结算影响评估 | 与 route 同批修改 settlement / commission / payout |

## Handoff Command Input

后续 `refund-state-owner-handoff` contract 至少需要输入：

```ts
type RefundStateOwnerHandoffInput = {
  inboxRecordId: string
  provider: "wechat_pay" | "alipay" | "mock_china_pay"
  providerEventId?: string
  providerRefundId?: string
  providerEventType: "refund.succeeded" | "refund.failed"
  idempotencyKey: string
  rawPayloadDigest: string
  signatureVerified: boolean
  merchantOrderRef: string
  paymentSessionId?: string
  amount: { value: number; currency: "CNY" }
  expectedRefundSnapshot: {
    localRefundCommandKey: string
    requestedAmountMinor: number
    currency: "CNY"
    paymentSessionId?: string
    currentPlatformRefundState: string
  }
  ownershipCheck: {
    sellerId?: string
    marketId?: string
    passed: boolean
  }
  permissionCheck: {
    actorType: "system_job" | "admin" | "vendor"
    actorId?: string
    passed: boolean
  }
  manualReview?: {
    required: boolean
    decision?: "approved_for_shadow" | "rejected" | "needs_query" | "needs_reconciliation"
    reasonCodes: string[]
  }
}
```

必须保持输出不可执行：

```ts
type RefundStateOwnerHandoffDecision = {
  decision:
    | "shadow_command_prepared"
    | "manual_review_required"
    | "query_required"
    | "reconciliation_required"
    | "blocked"
  executable: false
  runtimeMutationBlocked: true
  refundSuccessState: false
  idempotencyKey: string
  blockCodes: string[]
}
```

## Required Guards

Go to shadow command 的最低条件：

- Provider signature verified。
- Inbox record exists and is not digest conflict。
- Amount and currency match expected refund snapshot。
- Provider refund id matches expected local refund command or known provider request mapping。
- Payment / refund snapshot is not terminal conflict。
- Ownership check passed。
- Permission check passed for actor or system job。
- Manual review not required, or manual review explicitly approved for shadow only。

任一失败必须 fail closed：

- `manual_review_required`
- `query_required`
- `reconciliation_required`
- `blocked`

## Failure Matrix

| 场景 | Decision | 后续 |
| --- | --- | --- |
| Bad signature | `blocked` | 只写 rejected audit |
| Duplicate same digest | `blocked` 或 no-op | 不生成新 command |
| Digest conflict | `manual_review_required` | Admin 复核 |
| Amount / currency mismatch | `manual_review_required` | Admin + reconciliation |
| Unknown provider refund id | `query_required` | 规划 query owner，不在 route 调用 |
| Unknown local refund command | `manual_review_required` | 查平台退款申请记录 |
| Terminal state conflict | `reconciliation_required` | 财务 / 审计处理 |
| Vendor ownership mismatch | `blocked` | 权限审计 |
| Late event | `reconciliation_required` | 对账处理 |

## PR Sequence

1. `refund-state-owner-handoff-contract`：新增纯函数合同和 focused tests，输出不可执行 decision。
2. `refund-state-owner-handoff-validation`：合并后验证。
3. `refund-workflow-shadow-command-plan`：规划 workflow command DTO，不执行 workflow。
4. `refund-workflow-shadow-command-contract`：把 handoff decision 映射为 shadow command / audit event，仍不可执行。
5. `refund-provider-query-follow-up-plan`：规划 query owner 和手工/自动查询边界，不在 route 直接调用。
6. `refund-reconciliation-boundary-plan`：规划退款对账与结算 / 佣金 / 打款分离。

## Verification Matrix

后续 contract PR 至少需要：

```bash
git diff --check
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-state-owner-handoff.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
grep -RIn \
  -e providerRefundRequest \
  -e refundQuery \
  -e execute_workflow \
  -e refundStateMutation \
  -e settlement_adjusted \
  -e commission_adjusted \
  -e payout_adjusted \
  -e fulfillment \
  -e logistics \
  packages/api/src/modules/china-payment-notification/refund-state-owner-*.ts || true
```

## Rollback

Docs-only plan 无 runtime rollback。

后续 contract 若误用：

- 保持 `CHINA_REFUND_STATE_MUTATION_ENABLED=false`。
- 保持 workflow execution disabled。
- Revert handoff contract PR。
- 保留 inbox / audit records 只读。

## No-Go

仍禁止：

- Route handler 直接写 order / payment / refund terminal state。
- Provider notification 直接触发 refund workflow。
- Provider query API 在 route 内调用。
- Manual review 绕过 RBAC / ownership。
- Refund success 自动触发 settlement / commission / payout。
- Fulfillment / logistics 因退款通知自动变更。
