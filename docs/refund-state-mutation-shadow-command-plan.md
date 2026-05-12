# Refund State Mutation Shadow Command Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

下一步只能规划 `refund-state-mutation-shadow-command-contract`，把 `evaluateRefundStateMutationReadiness()` 的不可执行 readiness decision 映射为 shadow-only state command / audit event。

该 shadow command 仍不得执行 workflow，不得写平台退款成功状态，不得触发 settlement、commission、payout、permission、fulfillment 或 logistics mutation。

## 输入边界

只允许消费 readiness contract 输出：

```text
decision: ready_for_shadow_state_command | manual_review_required | reconciliation_required | blocked
executable: false
workflowExecutionAllowed: false
stateMutationAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
shadowCommand?: refund_state_mutation_readiness_shadow
```

如果 readiness output 缺少 `shadowCommand`，只能输出 audit-only。

如果 readiness output 尝试携带任何可执行开关，必须 blocked：

- `executable !== false`
- `workflowExecutionAllowed !== false`
- `stateMutationAllowed !== false`
- `runtimeMutationBlocked !== true`
- `refundSuccessState !== false`

## 输出合同

建议新增 `mapRefundReadinessToStateMutationShadowCommand()` 纯函数。第一版输出固定：

```text
executable: false
workflowExecutionAllowed: false
stateMutationAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
```

允许生成的 shadow DTO：

```text
commandType: refund_state_mutation_shadow
shadowOnly: true
targetState: succeeded_shadow_reviewed | failed_shadow_reviewed | manual_review_shadow
stateMutationAllowed: false
workflowExecutionAllowed: false
financialMutationAllowed: false
fulfillmentMutationAllowed: false
```

`targetState` 只是审计标签，不得映射为平台真实 refund state。

## Decision Mapping

- `ready_for_shadow_state_command` -> `state_shadow_command_recorded`
- `manual_review_required` -> `manual_review_audit_recorded`
- `reconciliation_required` -> `reconciliation_audit_recorded`
- `blocked` -> `state_shadow_command_blocked`

任何非 ready decision 都不得带 shadow command。

## Audit Requirements

Audit metadata 只允许保留：

- provider
- source
- localRefundCommandKey
- providerRefundId
- amountMinor
- currency
- sourceInboxId
- queryFollowUpId
- reconciliationId
- actor type / actor id
- block codes

必须去敏：

- raw payload
- signature
- cert / key / API key
- DB URL
- provider query / refund request payload
- full phone / address / bank / identity
- settlement / commission / payout / fulfillment / logistics mutation hints

## 后续 PR 顺序

1. `refund-state-mutation-shadow-command-contract`：新增纯函数合同和 focused tests，仍不可执行。
2. `refund-state-mutation-shadow-command-validation`：验证文件范围、tests 和 No-Go。
3. `refund-state-mutation-operator-approval-plan`：规划 operator approval / permission / audit。
4. `refund-state-mutation-runtime-readiness-validation`：真实 runtime 前再次 Go / No-Go。

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
- 没有把 shadow target state 当作平台退款成功。
- 没有把 shadow command 接到 settlement、commission、payout、permission、fulfillment 或 logistics。

## No-Go

仍禁止：

- 真实 refund success state mutation。
- 真实 workflow execution。
- Provider inbox route 直接写平台退款状态。
- Provider query snapshot 直接写平台退款状态。
- Shadow command 直接触发 settlement / commission / payout。
- Shadow command 绕过 permission / ownership / audit。
- Shadow command 修改 fulfillment / logistics。
