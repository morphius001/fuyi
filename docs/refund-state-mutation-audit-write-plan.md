# Refund State Mutation Audit Write Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实退款状态写入仍是 No-Go。本计划只规划 approval candidate 到 audit write 的 local-only / disabled 边界，不实现 DB 写入、不新增 migration、不注册 route / job / subscriber、不执行 workflow、不写 refund success state。

下一步允许 `refund-state-mutation-audit-write-contract`：新增不可执行纯函数合同，把 disabled runtime adapter decision 映射为 audit write intent / audit event。第一版仍不连接真实 DB。

## Audit Write Boundary

未来 audit write owner 只能接收：

- disabled / non-executable runtime adapter decision
- operator approval candidate idempotency key
- reviewer actor / role / permission evidence
- target state audit label
- block codes
- created at

第一版 audit write contract 必须固定：

```text
auditWriteAllowed: false
dbWriteAllowed: false
workflowExecutionAllowed: false
stateMutationAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
settlementMutationAllowed: false
commissionMutationAllowed: false
payoutMutationAllowed: false
fulfillmentMutationAllowed: false
logisticsMutationAllowed: false
```

## Local-Only / Disabled Rules

允许规划：

- local in-memory audit intent。
- disabled DB audit writer contract。
- idempotency key shape。
- audit event allowlist extension plan。
- redacted metadata schema。
- rollback / replay runbook。

不允许实现：

- production / staging DB write。
- migration registration。
- route / job / subscriber that calls audit writer。
- workflow execution。
- refund success state mutation。
- settlement / commission / payout side effects。
- fulfillment / logistics side effects。

## Required Fields

audit write intent 至少包含：

- audit intent id
- runtime adapter idempotency key
- operator approval idempotency key
- reviewer actor type / actor id / role
- permission evidence id
- target state audit label
- block codes
- source inbox id / handoff id / reconciliation id / readiness id / shadow command id when available
- created at

必须去敏：

- raw provider payload
- provider request / query payload
- signature / certificate / key / API key
- DB URL
- full phone / address / identity / bank card
- executable / workflow / state / success / allowed safety flags
- settlement / commission / payout / fulfillment / logistics mutation hints

## No-Go Conditions

任一条件出现即阻断：

- runtime adapter decision 不安全。
- operator approval candidate 缺失。
- permission evidence 缺失。
- reviewer / initiator separation 缺失。
- audit metadata 未去敏。
- 请求写真实 DB。
- 请求执行 workflow。
- 请求写 refund success state。
- 请求 settlement / commission / payout / fulfillment / logistics side effect。

## 后续 PR 顺序

1. `refund-state-mutation-audit-write-contract`：新增不可执行 audit write intent 纯函数和 focused tests。
2. `refund-state-mutation-audit-write-validation`：验证文件范围、tests 和 No-Go。
3. `refund-state-mutation-workflow-adapter-plan`：规划真实 workflow command adapter，但仍不执行。

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
- 未新增 route、migration、DB、SDK、provider request / query、workflow、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
