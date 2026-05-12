# Refund State Mutation Preprod Dry-Run Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划一次性预发 dry-run gate，不实现 dry-run runtime、不新增 route / job / subscriber、不执行生产 workflow、不写生产 refund success state。

允许的下一步是 `refund-state-mutation-preprod-dry-run-contract`：新增不可执行纯函数合同，把 disabled workflow adapter command candidate 映射为 preprod dry-run request / audit event。第一版仍只输出 disabled / non-executable dry-run intent，不连接真实生产 DB。

## Dry-Run Boundary

未来 preprod dry-run 只能串行接收：

1. disabled workflow adapter command candidate。
2. audit write intent idempotency key。
3. runtime adapter idempotency key。
4. operator approval idempotency key。
5. state shadow command idempotency key。
6. reviewer actor / permission evidence。
7. target state audit label。
8. redacted metadata and block codes。

第一版 preprod dry-run contract 必须固定：

```text
preprodDryRunEnabled: false
productionExecutionAllowed: false
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

`dryRunRequestPrepared=true` 只能代表不可执行 dry-run request shape 已成形，不代表预发 workflow 已运行、生产 workflow 可执行、退款已成功，或财务/履约/物流链路可变更。

## Required Gates Before Any Future Preprod Execution

真实预发 dry-run execution 前必须有单独 PR 逐项证明：

- 预发环境隔离，不指向生产 DB、生产 provider、生产 webhook 或生产密钥。
- fixture / sandbox provider 明确，不调用真实 provider refund request / query API。
- dry-run workflow 不写平台生产 refund success state。
- dry-run command idempotency key 可复用，重复请求 no-op。
- audit write intent、workflow command candidate、permission evidence 和 reviewer separation 均可追溯。
- dry-run 输出必须可回放、可审计、可人工复核。
- dry-run 失败不会重试成真实 workflow execution。
- dry-run 完成不触发 settlement、commission、payout、fulfillment 或 logistics。
- rollback runbook、报警、人工复核入口和 replay 策略已验证。

## No-Go Conditions

任一条件出现即阻断：

- workflow adapter command candidate 缺失或安全旗标不为 disabled。
- 请求连接生产 DB、生产 provider、生产 webhook 或生产密钥。
- 请求执行生产 workflow。
- 请求写生产 refund success state。
- 请求真实 provider refund request / query。
- 请求 settlement / commission / payout / permission / fulfillment / logistics side effect。
- 请求弱化 permission、ownership、reviewer separation 或 audit guard。
- dry-run 输出无法审计、无法回放或不可幂等。

## Planned Contract Shape

后续 contract 可新增纯函数：

```text
mapWorkflowAdapterCommandToPreprodDryRun(input) -> {
  dryRunRequest,
  auditEvent,
  blockCodes,
  productionExecutionAllowed: false,
  workflowExecutionAllowed: false,
  stateMutationAllowed: false,
  runtimeMutationBlocked: true,
  refundSuccessState: false
}
```

dry-run request 至少包含：

- dry-run request id
- workflow adapter command idempotency key
- audit intent idempotency key
- runtime adapter idempotency key
- operator approval idempotency key
- state shadow command idempotency key
- reviewer actor / role / permission evidence id
- target state audit label
- preprod environment label
- block codes
- created at

必须去敏：

- raw provider payload
- provider request / query payload
- signature / certificate / key / API key
- production DB URL
- full phone / address / identity / bank card
- executable / workflow / state / success / allowed safety flags
- settlement / commission / payout / permission / fulfillment / logistics mutation hints

## 后续 PR 顺序

1. `refund-state-mutation-preprod-dry-run-contract`：新增不可执行 preprod dry-run request 纯函数和 focused tests。
2. `refund-state-mutation-preprod-dry-run-validation`：验证文件范围、tests 和 No-Go。
3. `refund-state-mutation-final-go-no-go-plan`：真实状态写入前最终 Go / No-Go 清单。

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

复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 未新增 route、job、subscriber、migration、DB、SDK、provider request / query、workflow execution、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
