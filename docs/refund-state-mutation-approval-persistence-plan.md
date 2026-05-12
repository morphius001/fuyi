# Refund State Mutation Approval Persistence Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 operator approval persistence，不新增 migration、不连接生产 DB、不注册 route / job / subscriber、不执行生产 workflow、不写生产 refund success state。

## Persistence Boundary

未来 approval persistence 必须只接收 disabled operator approval candidate，并持久化以下不可变字段：

- approval id / idempotency key
- source shadow command idempotency key
- readiness / reconciliation / inbox references
- target state audit label
- reviewer actor type / actor id / role
- initiated actor id
- permission evidence id
- separation of duties result
- manual review decision and reason
- rollback runbook evidence
- audit allowlist evidence
- immutable created / decided timestamps

第一版 persistence contract 仍必须固定：

```text
approvalWriteAllowed=false
dbWriteAllowed=false
productionWriteAllowed=false
workflowExecutionAllowed=false
stateMutationAllowed=false
runtimeMutationBlocked=true
refundSuccessState=false
```

## Required Guards

生产持久化前必须证明：

- vendor actor 不能批准平台退款状态写入。
- reviewer 与发起 actor 不能相同。
- permission evidence 必须来自服务端可信来源。
- approval record 必须 append-only 或具备不可篡改审计。
- duplicate idempotency key 必须 no-op。
- rejection / manual review reason 可查询。
- approval 不能由 metadata 覆盖 safety flags。

## No-Go Conditions

任一条件出现即阻断：

- approval 只存在内存、日志或 metadata。
- approval write failure 后继续 runtime adapter / workflow。
- reviewer role 或 permission evidence 由前端自由提交。
- vendor actor 可批准平台退款状态写入。
- approval record 可被覆盖成 approved。
- 请求写 refund success state。
- 请求 settlement / commission / payout / permission / fulfillment / logistics side effect。

## 后续 PR 顺序

1. `refund-state-mutation-approval-persistence-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-approval-persistence-contract`：新增不可执行 approval persistence intent 纯函数和 focused tests。
3. `refund-state-mutation-audit-persistence-plan`：规划 audit write persistence，不写生产 DB。

## Verification Plan

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
