# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Decision Guard Contract Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-timeline-event-contract-validation` 已完成，当前已经确认 timeline event contract 仍停留在 docs-only 边界。
- 上一轮 evidence shape contract 已经固定 `decisionGuards` 是 review case 顶层区块之一，但还没有把它内部字段、allow/deny 语义、block code 聚合和 fail-closed 默认值拆细。
- 下一步需要单独把 `decisionGuards` 合同钉住，避免 future builder / fixture bundle 在阻断语义上各自扩展一套半兼容字段。

## 本轮目标

本轮只规划 `decisionGuards` 区块合同，不进入 guard implementation、builder wiring、route 或 runtime。

## 结论

future `decisionGuards` 区块应采用“默认 deny、显式 allow、集中 block code、显式 missing evidence flag”的 fail-closed 结构，至少固定 `refundStateMutationAllowed`、`repositoryWriteAllowed`、`workflowExecutionAllowed`、`blockCodes`、`missingEvidenceFlags` 五部分。

## 顶层字段建议

`decisionGuards` 建议至少包含：

- `refundStateMutationAllowed`
- `repositoryWriteAllowed`
- `workflowExecutionAllowed`
- `blockCodes`
- `missingEvidenceFlags`

约束：

1. 所有字段必须存在
2. 不允许省略字段表达“默认允许”
3. 没有明确证据时必须保持 deny

## allow/deny 语义建议

### refundStateMutationAllowed

- 默认 `false`
- 仅表达 review case 视角下“是否具备进入真实状态写入前提”
- 绝不等价于真实已写入 refund success state

### repositoryWriteAllowed

- 默认 `false`
- 仅表达 persistence 维度 readiness
- 不应被 UI 或 operator hint 误解为“可以直接写库”

### workflowExecutionAllowed

- 默认 `false`
- 仅表达 theoretical readiness，不代表系统会执行 workflow
- 当前阶段必须维持 blocked / disabled 语义

所有 allow 字段都必须显式写出 `false`，不允许缺失。

## blockCodes 聚合建议

`blockCodes` 建议为只读字符串数组：

- 统一收敛 manifest / bundle metadata / evidence shape / reference slot / timeline 各层的 block code
- 不允许不同层用不同拼写表达同一阻断原因
- 应支持多原因并存

约束：

1. `blockCodes` 字段必须存在
2. 无阻断时也应为空数组而不是缺失
3. 不允许 `null`

## missingEvidenceFlags 建议

`missingEvidenceFlags` 建议为显式对象：

- `missingApprovalRecord`
- `missingAuditRecord`
- `missingRuntimeAttempt`
- `missingTerminalConflict`
- `missingFixtureSourceKey`

约束：

1. 所有 flag 都必须存在
2. 默认应为 `true` 或 `false` 的显式值
3. 不能靠缺字段表达未知

用途：

- 区分“slot empty but acceptable”与“slot missing and blocked”
- 让 operator review 看到证据缺口，而不是只看到黑箱 blocked

## fail-closed 默认值

future `decisionGuards` contract 应固定默认值：

- `refundStateMutationAllowed=false`
- `repositoryWriteAllowed=false`
- `workflowExecutionAllowed=false`
- `blockCodes` 默认可为空，但任何 contract 不确定性都应追加 block code
- `missingEvidenceFlags` 默认按最保守值显式填充

不允许：

- 任何 allow 字段默认 `true`
- 任何 allow 字段依赖 absence 推断

## block code 分层建议

`decisionGuards.blockCodes` 应能容纳：

1. 结构层 block code
   - 来自 manifest / bundle metadata / evidence shape / timeline / references

2. 证据缺失层 block code
   - 如 approval / audit / runtime attempt / terminal conflict / fixture source key 缺失

3. 运行边界层 block code
   - 如 `workflow_execution_disabled`
   - `repository_write_blocked`
   - `refund_state_mutation_blocked`

## operator 可读性建议

虽然 `decisionGuards` 是机器合同，但仍应考虑 operator review 展示：

- allow / deny 字段语义要直白
- block code 应能映射到可读文案
- missing evidence flag 应可直接转成“缺少哪类证据”

但这里仍然只规划合同，不在本轮定义展示文案。

## 非目标

本轮明确不做以下事项：

- 不新增 decision guard implementation
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

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-decision-guard-contract-validation`，只做本计划的 docs-only validation 与 ledger 收口。
