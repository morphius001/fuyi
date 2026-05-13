# Refund State Mutation Isolated Preprod Query Surface Plan

更新时间：2026-05-13 Asia/Shanghai

## 结论

当前真实生产退款成功状态写入仍是 No-Go。本计划只规划 isolated preprod operator review 查询面如何安全读取 approval / audit / runtime attempt / terminal conflict 四段 persistence evidence，并保持 redacted / fail-closed，不实现 route、不连接 production DB、不执行 workflow、不写 production refund success state。

## Why Query Surface Must Be Planned First

即使四段 adapter plan 和统一 implementation gate 都已经写清，如果 query surface 没定义，后续 implementation 仍会遇到几个问题：

- operator 看不到跨 approval / audit / runtime attempt / terminal conflict 的完整证据链
- duplicate / replay / manual review 的判断依据无法统一
- redaction 边界可能在不同查询入口里漂移
- terminal conflict / runtime attempt 的状态被误读成可执行结论

所以在任何 isolated preprod implementation PR 前，必须先把 query surface 的读模型和 redaction 边界写清楚。

## Allowed Query Scope

未来 isolated preprod query surface 只允许服务于 operator review / rehearsal evidence lookup，且只允许读取：

1. approval persistence redacted summary
2. audit persistence redacted summary
3. runtime attempt persistence redacted summary
4. terminal conflict persistence redacted summary
5. 这四段 summary 之间的交叉引用键
6. block code / operator-visible reason / replay outcome / duplicate outcome

不允许：

- 直接暴露 raw provider payload
- 直接暴露 provider request / query payload
- 直接暴露 secret、certificate、merchant key、DB URL
- 直接暴露完整手机号、地址、身份证、银行卡
- 直接暴露 executable workflow handle
- 直接暴露 production override、success override 或 terminal lock override 字段

## Required Aggregated Read Model

future query surface 至少要能聚合出以下只读视图：

1. `reviewCaseByPlatformRefundId`
2. `reviewCaseByApprovalPersistenceIdempotencyKey`
3. `reviewCaseByRuntimeAttemptPersistenceIdempotencyKey`
4. `reviewCaseByTerminalConflictPersistenceIdempotencyKey`
5. `reviewCaseByProviderRefundReference`

每个 review case 只允许输出：

- platform refund id
- provider refund reference 的安全引用
- approval / audit / runtime attempt / terminal conflict 的 redacted summary
- current review status label
- block code
- operator-visible reason
- replay / duplicate / manual review 标记
- feature flag snapshot key

## Required Cross-Reference Rules

query surface 必须固定以下 cross-reference 键：

- `approval_persistence_idempotency_key`
- `audit_persistence_idempotency_key`
- `runtime_attempt_persistence_idempotency_key`
- `terminal_conflict_persistence_idempotency_key`
- `platform_refund_id`
- `provider_refund_reference`
- `workflow_idempotency_key`
- `terminal_marker_key`

任何一段 evidence 缺少必要 cross-reference 时，query surface 必须返回 fail-closed 的 incomplete case，而不是静默忽略缺口。

## Redaction Rules

所有 query response 都必须默认 redacted，只允许暴露：

- idempotency keys
- block codes
- operator-visible reason
- target state audit label
- retry ordinal / replay outcome / duplicate outcome
- safe actor reference
- timestamps
- feature flag snapshot key

必须明确禁止：

- raw provider body / raw webhook body
- raw provider response
- secret / certificate / merchant credential
- 完整 PII
- 可执行 command / workflow 参数
- 任意能被误用为 production 执行输入的字段

## Fail-Closed Rules

以下任一情况必须阻断 query response 或返回 incomplete / blocked case：

- 环境无法证明是 isolated preprod
- redaction 失败
- approval / audit / runtime attempt / terminal conflict 任一 summary 无法安全构建
- cross-reference 缺失
- duplicate / replay 结论无法稳定回放
- operator-visible reason 无法生成

阻断时必须至少返回：

- block code
- incomplete / blocked label
- safe reason
- missing evidence indicator

## Operator Workflow Expectations

query surface 未来只服务以下 operator 场景：

1. replay 前证据核对
2. duplicate no-op 核对
3. manual review 证据聚合
4. terminal conflict 阻断原因排查
5. rollback drill 事后证据审计

不允许作为：

- production runtime 的在线依赖
- 自动放行器
- 自动改写 refund success state 的输入
- settlement、commission、payout、permission、fulfillment、logistics 副作用触发器

## Recommended Next Steps

下一步建议仍保持 docs-only / contract-first：

1. `refund-state-mutation-isolated-preprod-query-surface-validation`
2. 如 query surface 仍不足，再补一张 rollback drill / operator checklist docs-only 计划
3. 在 query surface 和 rollback 证据都齐前，不进入任何 isolated preprod implementation PR

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

复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 未新增 route、job、subscriber、migration、DB、SDK、provider request / query、workflow execution、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
