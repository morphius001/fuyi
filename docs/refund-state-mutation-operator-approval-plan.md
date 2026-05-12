# Refund State Mutation Operator Approval Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实退款状态写入仍是 No-Go。本计划只定义 operator approval / permission / audit gate，作为未来任何 refund success state mutation 之前的串行门禁。

当前已有链路仍只能产生不可执行证据：

- provider inbox / local disposable DB rehearsal
- state owner handoff decision
- refund workflow shadow command
- provider query follow-up shadow command
- provider query reconciliation decision
- local redacted query fixtures
- state mutation readiness decision
- state mutation shadow command

这些证据不能直接写平台退款成功状态，不能执行 workflow，不能触发 settlement / commission / payout / fulfillment / logistics。

## Approval Gate

未来 operator approval 只能在所有条件满足时生成 approval candidate：

- refund notification / query evidence 已验签或来自 redacted local fixture。
- provider refund id、merchant order reference、payment provider session id、金额和币种一致。
- inbox id、handoff id、reconciliation id、readiness id 和 shadow command id 可追溯。
- 当前平台 refund state 不是 terminal success / failure conflict。
- manual review policy 已启用，且存在明确 reviewer decision。
- reviewer 具备平台售后/财务复核权限，不是发起退款请求的同一 actor。
- approval metadata 已去敏，不包含 raw payload、signature、secret、DB URL、完整手机号、地址、身份证或银行卡。
- rollback runbook、异常复核路径和 audit event allowlist 已准备。

即使 approval candidate 成立，第一版仍必须输出：

```text
executable: false
workflowExecutionAllowed: false
stateMutationAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
operatorApprovalRecorded: true
```

## Permission And Separation

审批 gate 需要分离以下角色：

- `system_job`：只能聚合证据和生成 candidate，不允许批准。
- `admin_refund_reviewer`：可以记录人工复核意见，但不能绕过权限或金额一致性。
- `admin_finance_reviewer`：未来可参与财务侧二次确认，但第一版不触发 settlement / commission / payout。
- `vendor`：不能批准平台退款状态写入，只能查看与自身订单相关的只读状态。

必须阻断：

- 同一 actor 同时发起和批准。
- 缺少 reviewer id / role / permission evidence。
- provider evidence 与平台订单或金额不一致。
- terminal platform refund state conflict。
- 任何 runtime mutation request。
- 任何 settlement / commission / payout / fulfillment / logistics side-effect request。

## Audit Contract

approval audit event 至少记录：

- approval candidate id
- source inbox id
- handoff id
- reconciliation id
- readiness id
- shadow command id
- reviewer actor type / actor id / role
- permission evidence id
- approved target label
- block codes
- created at

必须去敏：

- raw provider payload
- signature / certificate / key / API key
- DB URL
- provider refund request / query payload
- full phone / address / identity / bank card
- settlement / commission / payout / fulfillment / logistics mutation hints
- executable / workflow / state / success / allowed safety flags

## 后续 PR 顺序

1. `refund-state-mutation-operator-approval-contract`：新增纯函数合同和 focused tests，仍不可执行。
2. `refund-state-mutation-operator-approval-validation`：验证文件范围、tests 和 No-Go。
3. `refund-state-mutation-runtime-readiness-validation`：真实 runtime 前再次 Go / No-Go。

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
子智能体只读复核: No Findings
```

子智能体复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 未新增 route、DB、SDK、provider request / query、workflow、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
