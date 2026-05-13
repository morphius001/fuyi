# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Timeline Event Contract Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-reference-slot-contract-validation` 已完成，当前已经确认 reference slot contract 仍停留在 docs-only 边界。
- 上一轮 reference slot contract 已经固定 approval / audit / runtime attempt / terminal conflict / fixture source key 的 redacted handle、presence 规则和 cross-link 约束。
- 下一步需要单独把 `timeline` 区块里的 event contract 规划清楚，避免 future review case builder 在事件排序、时间戳脱敏和 event reference handle 上各写各的。

## 本轮目标

本轮只规划 timeline event contract，不进入 event implementation、builder wiring、route 或 runtime。

## 结论

future `timeline` 区块应采用稳定的只读 event 数组结构，至少显式声明 `eventType`、`eventStatus`、`eventTimestamp`、`sortKey`、`eventReference` 和 `redacted`，并把时间排序与时间戳脱敏规则写进合同层。

## timeline 顶层结构建议

`timeline` 建议固定为只读数组，每个 event 至少包含：

- `eventType`
- `eventStatus`
- `eventTimestamp`
- `sortKey`
- `eventReference`
- `redacted`

约束：

1. `timeline` 字段必须存在
2. 可以为空数组
3. 不允许缺省整个 timeline 区块

## event 字段建议

### eventType

应为受控 allowlist，例如：

- `approval_recorded`
- `audit_logged`
- `runtime_attempt_blocked`
- `runtime_attempt_prepared`
- `terminal_conflict_detected`
- `fixture_selected`

不允许：

- 自由拼接字符串
- 把 workflow step 名称直接暴露给 operator

### eventStatus

建议受控为：

- `info`
- `warning`
- `blocked`

只表达 operator review 语义，不表达真实退款成功或 workflow 已执行。

### eventTimestamp

- 必须存在
- 必须为 redacted / normalized 时间表示
- 不允许直接暴露未处理原始 provider 时间戳文本

### sortKey

- 必须显式存在
- 用于稳定排序
- 不允许依赖数组天然顺序或文件顺序

### eventReference

- 应采用 redacted handle
- 可复用 reference slot 合同的一致结构或其子集
- 不允许携带 raw payload

### redacted

- 必须恒为 `true`

## 排序规则建议

future timeline 排序合同建议：

1. 先按 `sortKey` 排序
2. 同 key 再按 `eventTimestamp` 稳定排序
3. 若时间戳相同，允许使用受控 tie-break 规则

不允许：

- 依赖插入顺序
- 依赖文件物理顺序
- 让消费方自己猜排序

## timestamp redaction 规则

timeline contract 层应明确：

1. 时间戳可以标准化为统一时区显示值
2. 时间戳需要满足 operator review 可读性
3. 不暴露原始 provider 文本时间字段
4. 不暴露可用于还原敏感链路的隐式时间字段

允许的是：

- redacted / normalized ISO-like 时间
- review-case 受控展示时间

## event reference handle 建议

`eventReference` 建议至少包含：

- `referenceType`
- `referenceId`
- `referenceLabel`
- `crossReferenceKey`
- `redacted`

约束：

- `referenceType` 受控 allowlist
- `referenceId` 为 redacted handle
- `crossReferenceKey` 用于与 references 区块或 manifest / bundle metadata 做交叉核对
- `redacted=true` 必须恒成立

## empty timeline contract

若某个 fixture / review case 没有 timeline 事件：

- `timeline=[]`
- 不允许缺失 `timeline`
- 不允许用 `null`

如果 timeline 本应存在但校验失败：

- 应在上层 `decisionGuards.blockCodes` 或对应 event-level blocked 状态中表达
- 不应把 blocked timeline 伪装成正常 empty timeline

## block code 建议

timeline contract 层建议预留以下 block code：

- `timeline_event_missing_field`
- `timeline_event_invalid_type`
- `timeline_event_invalid_status`
- `timeline_event_timestamp_missing`
- `timeline_event_not_redacted`
- `timeline_event_reference_invalid`
- `timeline_event_sort_key_missing`
- `timeline_event_order_ambiguous`

## 非目标

本轮明确不做以下事项：

- 不新增 timeline event implementation
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

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-timeline-event-contract-validation`，只做本计划的 docs-only validation 与 ledger 收口。
