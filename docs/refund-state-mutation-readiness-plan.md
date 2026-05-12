# Refund State Mutation Readiness Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

当前仍是 **No-Go to real refund state mutation**。

Provider inbox、state owner handoff、workflow shadow command、query follow-up、query reconciliation 和 redacted local fixtures 已建立不可执行合同，但它们还不能直接写平台退款成功状态。下一阶段必须先完成 readiness / Go-No-Go gate，再考虑 shadow-only state mutation command contract；真实 workflow execution 和真实退款状态写入仍不能自动推进。

## 已具备的不可执行输入

- Provider refund inbox route：只支持 development/local/disposable DB/fixture-only inbox rehearsal。
- `evaluateRefundStateOwnerHandoffContract()`：输出不可执行 handoff decision / `refund_state_shadow` DTO。
- `mapRefundHandoffToWorkflowShadowCommand()`：输出不可执行 workflow shadow DTO / audit event。
- `planRefundProviderQueryFollowUp()`：输出不可执行 provider query shadow DTO / audit event。
- `planRefundProviderQueryReconciliation()`：输出不可执行 reconciliation decision / manual review handoff。
- `refund-provider-query-local-fixtures`：redacted fake-only query snapshots。

所有上游输出仍必须保持：

```text
executable: false
runtimeMutationBlocked: true
refundSuccessState: false
```

## Go / No-Go Gates

进入任何 state mutation shadow contract 前，必须满足：

- Provider notification verifier 已通过，raw payload 已 redacted，digest 可追溯。
- Inbox 幂等记录稳定，没有 digest conflict 或 unsafe state。
- Handoff decision 为可审计的 shadow input，不是 route 直接写状态。
- Provider query / reconciliation 若参与，只能提供 snapshot 和 manual review evidence。
- Manual review policy 明确：谁能批准、批准什么、失败如何回滚、审批记录如何留存。
- Permission / ownership gate 明确：平台 operator、seller、system job 的职责不可混用。
- Platform refund session 当前状态非 terminal conflict。
- Amount、currency、provider refund id、payment session 和 merchant order ref 全部匹配。
- Settlement、commission、payout、fulfillment、logistics 全部保持隔离，不随 refund state mutation 自动触发。
- Rollback / compensation runbook 已准备，包括 audit-only revert note 和 operator escalation。

任一条件不满足均为 No-Go。

## Readiness Artifact

后续建议新增 `RefundStateMutationReadinessDecision` 纯函数合同，第一版仍不可执行：

```text
decision: ready_for_shadow_state_command | manual_review_required | reconciliation_required | blocked
executable: false
workflowExecutionAllowed: false
stateMutationAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
```

允许输出的 shadow DTO 只能是：

```text
commandType: refund_state_mutation_readiness_shadow
shadowOnly: true
stateMutationAllowed: false
workflowExecutionAllowed: false
financialMutationAllowed: false
fulfillmentMutationAllowed: false
```

## Operator Approval

真实状态写入前必须单独规划 operator approval：

- 二次确认：退款单、支付单、订单、商家、市场、金额、币种。
- 审批人权限：Admin operator 权限，不得由 Vendor 直接批准平台退款成功状态。
- 审计字段：approver id、reason code、evidence ids、source inbox id、query follow-up id、reconciliation id。
- 失败处理：provider mismatch、platform terminal conflict、settlement already started、commission booked、payout pending。

## Rollback Boundary

状态写入一旦进入真实 runtime，必须配套：

- 幂等 key。
- 状态机前置状态检查。
- 失败重试和 dead letter。
- 不重复触发财务/履约 side effects。
- 可回滚或可补偿的 operator runbook。

当前没有这些 runtime artifact，因此仍不能实现。

## 后续 PR 顺序

1. `refund-state-mutation-readiness-contract`：新增纯函数合同和 focused tests，仍输出不可执行 readiness decision。
2. `refund-state-mutation-readiness-validation`：验证文件范围、tests 和 No-Go。
3. `refund-state-mutation-shadow-command-plan`：规划 shadow-only state mutation command，不执行 workflow。
4. `refund-state-mutation-operator-approval-plan`：规划 operator approval / audit / permission。
5. `refund-state-mutation-runtime-readiness-validation`：在任何真实 runtime 前再次 No-Go / Go gate。

## 验证计划

本计划 PR 验证已通过：

```bash
git diff --check
git status --short --branch
```

子智能体只读复核工具等待超时；后续 validation PR 继续记录文件范围和安全边界。复核重点仍为：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 没有新增真实 state mutation、workflow execution、provider query、SDK、secret、DB。
- 没有把 manual review / reconciliation / fixtures 当作平台退款成功。
- 没有把 refund state mutation 接到 settlement、commission、payout、permission、fulfillment 或 logistics。

## No-Go

仍禁止：

- 真实 refund success state mutation。
- 真实 workflow execution。
- Provider inbox route 直接写平台退款状态。
- Provider query snapshot 直接写平台退款状态。
- Manual review 直接绕过 permission / ownership / audit。
- Refund state mutation 直接触发 settlement / commission / payout。
- Refund state mutation 修改 fulfillment / logistics。
