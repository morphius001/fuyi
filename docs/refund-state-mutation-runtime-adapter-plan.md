# Refund State Mutation Runtime Adapter Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实退款状态写入仍是 No-Go。本计划只规划 future runtime adapter 的边界，不实现 adapter、不注册 route/job/subscriber、不执行 workflow、不写 refund success state。

允许的下一步是 `refund-state-mutation-runtime-adapter-contract`：新增不可执行 / disabled adapter contract，证明即使输入 operator approval candidate，也仍然不执行 mutation。

## Adapter Boundary

未来 runtime adapter 必须串行接收：

1. 已验签或 fixture-only 的 provider evidence。
2. state owner handoff decision。
3. workflow shadow command。
4. provider query reconciliation result。
5. state mutation readiness decision。
6. state mutation shadow command。
7. operator approval candidate。

第一版 adapter contract 必须固定：

```text
enabled: false
environmentAllowed: false
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

## Required Gates Before Any Future Go

真实 runtime 之前必须有单独 PR 证明：

- feature flag 默认关闭，生产必须显式开启且可快速回滚。
- adapter 只接受 operator approval candidate，不接受 provider inbox / query 直接输入。
- approval candidate idempotency key 可复用，重复请求 no-op。
- audit write 成功后才允许进入下一阶段；audit 失败必须阻断。
- Medusa workflow command adapter 独立存在，且能 dry-run。
- state mutation owner 明确归属，不由 provider route 直接写状态。
- settlement / commission / payout 是后续独立 gate，不和 refund state mutation 同 PR。
- fulfillment / logistics 是后续独立 gate，不和 refund state mutation 同 PR。
- permission / ownership / reviewer separation 的运行时检查不能被 metadata 覆盖。
- rollback runbook、报警、人工复核入口和 replay 策略已验证。

## No-Go Conditions

任一条件出现即阻断：

- provider payload 未验签或未去敏。
- operator approval candidate 缺失或来自非 admin reviewer。
- reviewer 与发起 actor 相同。
- permission evidence 缺失。
- approval candidate 要求 runtime mutation。
- settlement / commission / payout / fulfillment / logistics side-effect request。
- terminal platform refund state conflict。
- feature flag / environment gate 未通过。
- audit write 不可用。

## 后续 PR 顺序

1. `refund-state-mutation-runtime-adapter-contract`：新增 disabled / non-executable adapter contract 和 focused tests。
2. `refund-state-mutation-runtime-adapter-validation`：验证文件范围、tests 和 No-Go。
3. `refund-state-mutation-audit-write-plan`：规划 approval candidate 到 audit write 的 local-only / disabled 边界。
4. `refund-state-mutation-workflow-adapter-plan`：规划真实 workflow command adapter，但仍不执行。

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
