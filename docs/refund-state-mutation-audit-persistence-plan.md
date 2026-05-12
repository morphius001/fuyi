# Refund State Mutation Audit Persistence Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 audit write persistence，不新增 migration、不连接生产 DB、不注册 route / job / subscriber、不执行生产 workflow、不写生产 refund success state。

## Persistence Boundary

未来 audit persistence 必须只接收 disabled approval persistence intent 或 disabled runtime / audit intent，并持久化以下不可变字段：

- audit event id / idempotency key
- approval persistence idempotency key
- operator approval candidate idempotency key
- runtime adapter idempotency key
- workflow adapter command idempotency key
- target state audit label
- reviewer / permission evidence references
- source inbox / handoff / reconciliation / readiness references
- block codes
- redacted metadata
- immutable created timestamp

第一版 audit persistence contract 仍必须固定：

```text
auditWriteAllowed=false
dbWriteAllowed=false
productionWriteAllowed=false
workflowExecutionAllowed=false
stateMutationAllowed=false
runtimeMutationBlocked=true
refundSuccessState=false
```

## Required Guards

生产持久化前必须证明：

- audit log append-only 或具备不可篡改审计。
- audit write failure 必须 fail closed，不允许继续 workflow execution。
- audit metadata 不能覆盖 safety flags。
- raw provider payload、密钥、DB URL、完整手机号/地址/身份证/银行卡不能写入 metadata。
- duplicate idempotency key 必须 no-op。
- operator 可以按 refund / provider / approval / workflow reference 查询 audit trail。
- audit retention / export policy 明确。

## No-Go Conditions

任一条件出现即阻断：

- audit write 只存在内存、日志或 metadata。
- audit write failure 后继续 runtime adapter / workflow。
- audit metadata 可覆盖 `workflowExecutionAllowed`、`stateMutationAllowed`、`refundSuccessState` 等安全旗标。
- provider route / query job 可绕过 audit write 直接执行 workflow。
- 请求写 refund success state。
- 请求 settlement / commission / payout / permission / fulfillment / logistics side effect。

## 后续 PR 顺序

1. `refund-state-mutation-audit-persistence-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-audit-persistence-contract`：新增不可执行 audit persistence intent 纯函数和 focused tests。
3. `refund-state-mutation-runtime-idempotency-plan`：规划 workflow execution idempotency / replay，不执行 workflow。

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
