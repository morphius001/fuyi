# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Cross Block Consistency Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-evidence-payload-readiness-validation` 已完成，当前已经确认 payload contract baseline 仍停留在 docs-only 边界。
- 上一轮 payload readiness review 已经汇总 bundle metadata、evidence shape，以及 `summary`、`references`、`timeline`、`decisionGuards`、`operatorHints` 五个顶层区块的单块合同。
- 下一步需要单独把这些区块之间的一致性键、引用方向和 fail-closed 约束规划清楚，避免 future builder / validation 各自用不同规则“拼起来再猜”。

## 本轮目标

本轮只规划 cross-block consistency contract，不进入 payload implementation、builder wiring、repository resolver runtime、route 或 DB。

## 结论

future evidence payload 应把跨区块一致性视为一等合同层，而不是消费方容错逻辑。至少要固定 `reviewCaseId`、`scenarioType`、`crossReferenceKey`、`caseStatus`、`blockCodes`、`eventReference` 这些一致性锚点，并规定任一关键锚点缺失或冲突时必须 fail-closed。

## 一致性锚点建议

future payload 至少应固定以下跨区块锚点：

- `reviewCaseId`
- `scenarioType`
- `crossReferenceKey`
- `refundReference.referenceId`
- `marketContext.marketId`
- `sellerContext.sellerId`
- `blockCodes`
- `eventReference.referenceId`

约束：

1. 所有锚点都必须来自受控字段
2. 不允许依赖自由文本或位置推断一致性
3. 任一关键锚点缺失时必须 blocked，而不是 silent fallback

## summary 与 references 一致性

`summary` 和 `references` 至少应满足：

- `summary.reviewCaseId` 与所有 present slot 的 `crossReferenceKey` 属于同一 review case
- `summary.scenarioType` 与 `references.fixtureSourceKeyRef` 指向的 fixture scenario 一致
- `summary.refundReference.referenceId` 应能和相关 `approvalRecordRef` / `auditRecordRef` / `runtimeAttemptRef` / `terminalConflictRef` 的 `crossReferenceKey` 对齐
- `summary.marketContext.marketId`、`summary.sellerContext.sellerId` 不允许与 present slot 隐含的上下文冲突

不允许：

- `summary` 指向 A case，而 references 指向 B case
- `summary` 的 scenarioType 与 fixture source key 所属场景不一致
- 用缺字段把上下文冲突伪装成“未知”

## references 与 timeline 一致性

`references` 和 `timeline` 至少应满足：

- timeline 中每个 `eventReference.referenceId` 都应能映射到一个合法 slot 或其受控子引用
- timeline 中出现的 `referenceType` 必须与 references 区块的 handleType allowlist 对齐
- timeline 不允许指向不存在的 slot，也不允许绕过 `slotStatus=blocked`
- 若某个 slot 为 `blocked`，timeline 中相关 event 必须以 blocked / warning 语义显式表达，而不是装作正常 info

## decisionGuards 与其他区块一致性

`decisionGuards` 应是跨区块 fail-closed 结果的统一出口，至少满足：

- 任一关键 references slot 缺失或 cross-link mismatch 时，`missingEvidenceFlags` 与 `blockCodes` 必须同步反映
- timeline 出现 `blocked` 事件时，`decisionGuards.blockCodes` 不允许为空
- `workflowExecutionAllowed=true`、`repositoryWriteAllowed=true`、`refundStateMutationAllowed=true` 不能与 blocked slot、blocked event、缺失 evidence flag 共存
- 当前阶段即使没有冲突，`workflowExecutionAllowed` 也不得因为 hints 或 summary 看起来完整就变成 true

## operatorHints 与 decisionGuards 一致性

`operatorHints` 只能解释 `decisionGuards`，不能推翻它：

- 当 `manualReviewRequired=true` 时，至少要能从 `decisionGuards` 或 `timeline` 找到支持证据
- 当 `rollbackSuggested=true` 时，必须有对应的 blocked / warning 语义来源，不能凭空建议回滚
- `recommendedAction` 不允许与 `decisionGuards` 的 deny 语义冲突，例如 allow 字段全是 false 时不能给出看似可执行的动作建议
- `notes` 不允许补写任何缺失的一致性锚点

## scenarioType 对齐规则

`scenarioType` 至少要在以下位置对齐：

- bundle metadata
- evidence payload 顶层
- `summary.scenarioType`
- `references.fixtureSourceKeyRef`
- timeline 中任何场景相关 event

任一位置冲突时：

- 不允许消费方“挑一个最像的”
- 必须进入 fail-closed
- 应追加统一 block code，如 `cross_block_scenario_type_mismatch`

## reviewCaseId 与 crossReferenceKey 对齐规则

推荐采用两层一致性：

1. `reviewCaseId`
   - 负责标识同一 review case
2. `crossReferenceKey`
   - 负责标识 case 内部各 evidence slot / event / context 的可比对引用

约束：

- 不能只有 `reviewCaseId` 没有 slot / event 级 crossReferenceKey
- 也不能只有 `crossReferenceKey` 而无法确认它属于哪个 review case
- case id 与 cross reference 任何一层冲突都应 blocked

## caseStatus 与 blockCodes 对齐规则

`summary.caseStatus` 不能和 `decisionGuards.blockCodes`、`timeline.eventStatus` 冲突：

- 若存在关键 block code，`caseStatus` 不应表现为无风险完成态
- 若 `missingEvidenceFlags` 有关键缺口，`caseStatus` 至少应保持 `blocked` 或 `insufficient_evidence`
- `ready_for_manual_review` 只能用于证据链基本齐全但仍需人工复核的语义，不能掩盖 cross-block mismatch

## fail-closed 触发条件建议

future builder / validation 至少在以下场景 fail-closed：

1. `summary.scenarioType` 与 metadata / fixture source key 不一致
2. timeline event 引用了不存在或 blocked 的 reference slot
3. `decisionGuards` deny 语义与 `operatorHints` 建议动作冲突
4. `caseStatus` 与 `blockCodes` / `missingEvidenceFlags` 冲突
5. `marketContext` / `sellerContext` 与 present evidence 的 crossReferenceKey 指向不一致
6. 任一关键锚点缺失、不是 redacted、或类型不合法

## block code 建议

cross-block consistency 层建议预留以下 block code：

- `cross_block_review_case_mismatch`
- `cross_block_scenario_type_mismatch`
- `cross_block_reference_unresolved`
- `cross_block_timeline_reference_mismatch`
- `cross_block_decision_hint_conflict`
- `cross_block_case_status_conflict`
- `cross_block_context_mismatch`
- `cross_block_anchor_missing`

## 非目标

本轮明确不做以下事项：

- 不新增 payload implementation
- 不新增 builder wiring
- 不新增 repository resolver runtime
- 不新增 route
- 不连接 production / preprod DB
- 不执行 workflow
- 不写 refund success state

## 验证

1. `git diff --check`
2. `git status --short --branch`
3. 文件范围确认仅限 docs / queue / ledger / task

## 下一步建议

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-cross-block-consistency-validation`，只做本计划的 docs-only validation 与 ledger 收口。
