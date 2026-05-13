# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Reference Slot Contract Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-evidence-shape-contract-validation` 已完成，当前已经确认 evidence shape contract 仍停留在 docs-only 边界。
- 上一轮 evidence shape contract 已经固定 `summary`、`references`、`timeline`、`decisionGuards`、`operatorHints` 五段结构和 redaction boundary。
- 下一步需要单独把 `references` 区块内部的 slot 合同规划清楚，避免 future builder / fixture bundle 对 approval、audit、runtime attempt、terminal conflict、fixture source key 这些引用槽位各写各的。

## 本轮目标

本轮只规划 reference slot contract，不进入 slot implementation、builder wiring、route 或 runtime。

## 结论

future `references` 区块应把每个 slot 建成稳定的 redacted handle 对象，而不是裸字符串或原始 record；同时应为 empty slot、missing slot 和 blocked slot 提供显式 presence contract。

## reference slot 顶层建议

`references` 建议至少固定以下 slot：

- `approvalRecordRef`
- `auditRecordRef`
- `runtimeAttemptRef`
- `terminalConflictRef`
- `fixtureSourceKeyRef`

约束：

1. 所有 slot 字段必须存在
2. slot 可以是 empty / blocked / present 三态之一
3. 不允许直接省略字段表达“无值”

## redacted handle 通用结构

每个 slot 建议共用统一 handle 结构：

- `slotStatus`
- `handleType`
- `handleId`
- `handleLabel`
- `crossReferenceKey`
- `redacted`

约束：

1. `slotStatus`
   - `present | empty | blocked`

2. `handleType`
   - 受控 allowlist，例如 `approval_record`、`audit_record`、`runtime_attempt`、`terminal_conflict`、`fixture_source_key`

3. `handleId`
   - redacted id，不允许原始 DB 主键直出

4. `handleLabel`
   - 仅用于 operator 可读提示，不允许包含 PII 或 raw payload

5. `crossReferenceKey`
   - 供 future builder / loader / registry 做交叉核对

6. `redacted`
   - 必须恒为 `true`

## 各 slot 特定约束

### approvalRecordRef

- `handleType=approval_record`
- 必须只指向 redacted approval evidence
- 不允许携带 reviewer 真实身份信息

### auditRecordRef

- `handleType=audit_record`
- 只允许 redacted audit reference
- 不允许携带 raw audit payload

### runtimeAttemptRef

- `handleType=runtime_attempt`
- 只允许 redacted runtime attempt handle
- 不允许携带 executable workflow payload

### terminalConflictRef

- `handleType=terminal_conflict`
- 只允许 redacted terminal conflict snapshot handle
- 不允许携带 raw lock snapshot body

### fixtureSourceKeyRef

- `handleType=fixture_source_key`
- 允许显示 fixture source key 的 redacted / controlled label
- 必须能和 bundle metadata / manifest source key cross-link

## empty / blocked slot contract

slot 不应只靠 `null` 表达状态，建议：

### empty slot

- `slotStatus=empty`
- `handleType` 保留为受控类型
- 其余 handle 字段为受控空值

适用场景：

- 当前 review case 合法，但某条 evidence 天然不存在

### blocked slot

- `slotStatus=blocked`
- 必须附带 `blockCodes`
- 不允许被上层当成 empty slot

适用场景：

- evidence 本应存在，但 cross-link 缺失
- evidence 因 redaction / version / consistency 问题被 fail-closed

## cross-link 规则

future references slot 至少要支持以下 cross-link：

1. `approvalRecordRef.crossReferenceKey`
2. `auditRecordRef.crossReferenceKey`
3. `runtimeAttemptRef.crossReferenceKey`
4. `terminalConflictRef.crossReferenceKey`
5. `fixtureSourceKeyRef.crossReferenceKey`

目标：

- 让 query surface builder 可按统一 key 做 operator review 展示
- 让 future fixture bundle / manifest / registry 能稳定校验 references 是否与当前 case 对齐

任何 cross-link 缺失或不兼容时，slot 必须 blocked，不允许 silent fallback。

## block code 建议

reference slot contract 层建议预留以下 block code：

- `reference_slot_missing`
- `reference_slot_invalid_status`
- `reference_slot_not_redacted`
- `reference_slot_handle_type_invalid`
- `reference_slot_cross_link_missing`
- `reference_slot_cross_link_mismatch`
- `reference_slot_raw_payload_exposed`

## 非目标

本轮明确不做以下事项：

- 不新增 reference slot implementation
- 不新增 evidence payload implementation
- 不新增 builder wiring
- 不新增 route
- 不连接 production / preprod DB
- 不执行 workflow
- 不写 refund success state

## 验证

1. `git diff --check`
2. `git status --short --branch`
3. 文件范围确认仅限 docs / queue / ledger / task

## 下一步建议

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-reference-slot-contract-validation`，只做本计划的 docs-only validation 与 ledger 收口。
