# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Operator Hint Contract Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-decision-guard-contract-validation` 已完成，当前已经确认 `decisionGuards` 合同仍停留在 docs-only 边界。
- 上一轮 evidence shape contract 已经固定 `operatorHints` 是 review case 顶层区块之一，但还没有把它内部字段、recommended action、manual review、rollback hint 和 note 结构拆细。
- 下一步需要单独把 `operatorHints` 合同钉住，避免 future builder / fixture bundle 把 operator 提示变成半结构化自由文本。

## 本轮目标

本轮只规划 `operatorHints` 区块合同，不进入 hint implementation、builder wiring、route 或 runtime。

## 结论

future `operatorHints` 区块应采用稳定的只读提示结构，至少固定 `recommendedAction`、`manualReviewRequired`、`rollbackSuggested`、`notes` 四部分，并明确这些字段只提供 operator 可读提示，绝不表达可执行命令。

## 顶层字段建议

`operatorHints` 建议至少包含：

- `recommendedAction`
- `manualReviewRequired`
- `rollbackSuggested`
- `notes`

约束：

1. 所有字段必须存在
2. 不允许缺字段表达“无提示”
3. 所有字段都只能是只读提示，不是执行指令

## recommendedAction 建议

`recommendedAction` 建议采用受控值：

- `review_only`
- `collect_missing_evidence`
- `escalate_to_operator`
- `hold_for_manual_review`
- `prepare_rollback_review`

约束：

- 只能表达建议动作类别
- 不允许出现可直接执行 workflow / state mutation 的命令性值
- 当前阶段默认应偏向保守值，如 `review_only` 或 `hold_for_manual_review`

## manualReviewRequired 建议

- 布尔字段
- 必须显式存在
- 默认建议为 `true`，除非合同后续明确定义了无需人工复核的只读场景

语义：

- 仅表达 operator 是否需要继续人工检查
- 不等于权限、也不等于真实审批结果

## rollbackSuggested 建议

- 布尔字段
- 必须显式存在
- 仅表达“是否应提醒 operator 检查 rollback 条件”

约束：

- 不允许把 `rollbackSuggested=true` 解读为自动回滚
- 不允许承载 rollback 命令参数

## notes 结构建议

`notes` 建议为只读字符串数组或受控 note 对象数组：

- 仅承载 redacted、operator-facing 提示
- 不允许携带 raw payload、PII、可执行参数

若采用对象结构，建议至少包含：

- `noteType`
- `noteText`
- `redacted`

## 只读提示边界

`operatorHints` 合同层必须明确：

1. 不是 command
2. 不是 workflow input
3. 不是 mutation permission
4. 不是审批结果

它只能服务于：

- review case 展示
- operator 复核提示
- rollout / rehearsal 说明

## 与 decisionGuards 的关系

`operatorHints` 与 `decisionGuards` 应分层：

- `decisionGuards` 负责结构化 allow/deny、block code、missing evidence
- `operatorHints` 负责人可读的下一步提示

不允许：

- 在 `operatorHints` 里重复发明 allow/deny 语义
- 在 `decisionGuards` 里塞大段操作说明文案

## 非目标

本轮明确不做以下事项：

- 不新增 operator hint implementation
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

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-operator-hint-contract-validation`，只做本计划的 docs-only validation 与 ledger 收口。
