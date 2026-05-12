# Refund State Mutation Workflow Adapter Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实退款成功状态写入仍是 No-Go。本计划只规划 audit write intent 到 refund workflow command adapter 的边界，不实现 adapter、不新增 workflow 调用点、不注册 route / job / subscriber、不写 refund success state。

允许的下一步是 `refund-state-mutation-workflow-adapter-contract`：新增不可执行纯函数合同，把 disabled audit write intent 映射为 workflow adapter command candidate / audit event。第一版必须固定不可执行，只能 dry-run shape，不允许执行 Medusa workflow。

## Workflow Adapter Boundary

未来 workflow adapter 只能串行接收：

1. disabled / non-executable audit write intent。
2. audit intent idempotency key。
3. operator approval candidate idempotency key。
4. runtime adapter idempotency key。
5. readiness / state shadow command references。
6. reviewer actor / permission evidence。
7. target state audit label。
8. block codes and redacted metadata。

第一版 workflow adapter contract 必须固定：

```text
adapterEnabled: false
environmentAllowed: false
workflowCommandPrepared: true
workflowDryRunOnly: true
workflowExecutionAllowed: false
stateMutationAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
settlementMutationAllowed: false
commissionMutationAllowed: false
payoutMutationAllowed: false
permissionMutationAllowed: false
fulfillmentMutationAllowed: false
logisticsMutationAllowed: false
```

`workflowCommandPrepared=true` 只能代表本地不可执行 command candidate 已成形，不代表 workflow 可执行、退款已成功、审计已写入真实 DB，或财务/权限/履约/物流链路可变更。

## Required Gates Before Any Future Execution

真实 workflow execution 之前必须有单独 PR 逐项证明：

- audit write intent 已有可验证、幂等、可回放的真实写入记录。
- feature flag 默认关闭，生产环境必须显式启用且支持快速回滚。
- workflow adapter 只接受 audit write intent，不接受 provider inbox / query / route 直接输入。
- command idempotency key 可复用，重复请求必须 no-op。
- permission / ownership / reviewer separation 运行时检查不能被 metadata 覆盖。
- terminal refund state conflict 必须阻断。
- workflow dry-run 输出和真实 workflow 输入字段一一对应。
- workflow execution failure 必须可重试、可审计、不会重复写 refund success state。
- settlement、commission、payout 是后续独立 gate，不和 refund state mutation 同 PR。
- fulfillment、logistics 是后续独立 gate，不和 refund state mutation 同 PR。
- rollback runbook、报警、人工复核入口和 replay 策略已验证。

## No-Go Conditions

任一条件出现即阻断：

- audit write intent 缺失或未通过 disabled safety flags。
- audit intent idempotency key 缺失。
- operator approval / runtime adapter / readiness / shadow command reference 缺失。
- reviewer / initiator separation 缺失。
- permission evidence 缺失。
- 请求执行 workflow。
- 请求写 refund success state。
- 请求写真实 DB。
- 请求 provider refund request / query。
- 请求 settlement / commission / payout / fulfillment / logistics side effect。
- 请求弱化 permission、ownership 或 audit guard。

## Planned Contract Shape

后续 contract 可新增纯函数：

```text
mapAuditWriteIntentToWorkflowAdapterCommand(input) -> {
  commandCandidate,
  auditEvent,
  blockCodes,
  workflowExecutionAllowed: false,
  stateMutationAllowed: false,
  runtimeMutationBlocked: true,
  refundSuccessState: false
}
```

command candidate 至少包含：

- workflow adapter command id
- audit intent idempotency key
- runtime adapter idempotency key
- operator approval idempotency key
- state shadow command idempotency key
- reviewer actor / role / permission evidence id
- target state audit label
- source inbox / handoff / reconciliation / readiness references
- block codes
- created at

必须去敏：

- raw provider payload
- provider request / query payload
- signature / certificate / key / API key
- DB URL
- full phone / address / identity / bank card
- executable / workflow / state / success / allowed safety flags
- settlement / commission / payout / fulfillment / logistics mutation hints

## 后续 PR 顺序

1. `refund-state-mutation-workflow-adapter-contract`：新增不可执行 workflow adapter command candidate 纯函数和 focused tests。
2. `refund-state-mutation-workflow-adapter-validation`：验证文件范围、tests 和 No-Go。
3. `refund-state-mutation-preprod-dry-run-plan`：规划一次性预发 dry-run gate，仍不写生产 refund success state。

## 验证计划

本计划 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

本计划 PR 已验证：

```text
git diff --check passed
No apps/** or packages/** runtime diff
```

子智能体复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 未新增 route、job、subscriber、migration、DB、SDK、provider request / query、workflow execution、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
