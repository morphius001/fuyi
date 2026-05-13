# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Summary Block Contract Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-operator-hint-contract-validation` 已完成，当前已经确认 `operatorHints` 合同仍停留在 docs-only 边界。
- 上一轮 evidence shape contract 已经固定 `summary` 是 review case 顶层区块之一，但还没有把它内部字段、上下文显示合同和 case status 语义拆细。
- 下一步需要单独把 `summary` 区块合同钉住，避免 future builder / fixture bundle 在 `reviewCaseId`、`scenarioType`、`caseStatus`、`refundReference`、`marketContext`、`sellerContext` 上各写各的。

## 本轮目标

本轮只规划 `summary` 区块合同，不进入 summary implementation、builder wiring、route 或 runtime。

## 结论

future `summary` 区块应采用稳定的只读上下文结构，至少固定 `reviewCaseId`、`scenarioType`、`caseStatus`、`refundReference`、`marketContext`、`sellerContext` 六部分，并明确这些字段只表达 review case 展示语义，不表达真实退款成功。

## 顶层字段建议

`summary` 建议至少包含：

- `reviewCaseId`
- `scenarioType`
- `caseStatus`
- `refundReference`
- `marketContext`
- `sellerContext`

约束：

1. 所有字段必须存在
2. 不允许缺字段表达“未知”
3. 所有上下文字段都必须经过 redaction 或受控显示

## reviewCaseId 建议

- 必须显式存在
- 使用 review-case 维度的稳定标识
- 不允许直接暴露原始 DB 主键或 workflow execution id

用途：

- 供 operator review 定位当前 case
- 供跨区块引用一致对齐

## scenarioType 建议

- 必须显式存在
- 仅允许受控 allowlist
- 与 fixture manifest / bundle metadata / evidence payload 顶层 `scenarioType` 保持一致

不允许：

- 自由字符串
- 不同区块使用不同场景名

## caseStatus 语义建议

`caseStatus` 建议受控为 review-case 展示语义，例如：

- `needs_review`
- `blocked`
- `ready_for_manual_review`
- `insufficient_evidence`

约束：

- 只表达 review case 当前展示状态
- 不表达真实 refund success state
- 不表达 workflow 实际执行结果

## refundReference 建议

`refundReference` 只应承载 redacted / operator-facing 退款引用信息，建议包含：

- `referenceId`
- `referenceLabel`
- `redacted`

约束：

- 不暴露真实 provider 退款凭证原文
- 不暴露 raw payment / refund payload
- `redacted=true` 必须恒成立

## marketContext 建议

`marketContext` 只表达 review 所需的受控市场上下文，建议至少包含：

- `marketId`
- `marketLabel`
- `redacted`

约束：

- 允许 operator 可读标签
- 不暴露与市场无关的敏感运营信息
- 必须与 summary 之外的 evidence cross-link 保持一致

## sellerContext 建议

`sellerContext` 只表达 review 所需的受控商家上下文，建议至少包含：

- `sellerId`
- `sellerLabel`
- `redacted`

约束：

- 不暴露真实联系人 / 手机 / 地址
- 只用于 operator review 定位
- 必须保持 redacted

## 上下文 redaction 边界

`summary` 合同层必须明确：

1. 不暴露真实姓名、手机号、详细地址
2. 不暴露原始 provider 参考号全文
3. 不暴露 raw payment / refund payload
4. 只暴露受控、redacted 的 case / market / seller 上下文

## 跨区块一致性建议

`summary` 内部字段至少要和以下区块保持一致：

- `scenarioType` 与 manifest / bundle metadata / evidence payload 顶层一致
- `refundReference` 与 references / timeline 中的相关 handle 语义一致
- `marketContext` / `sellerContext` 与 summary 之外的 review case 语义不冲突

任何不一致都应由后续 builder / validation 层 fail-closed，而不是让消费方自行修补。

## 非目标

本轮明确不做以下事项：

- 不新增 summary implementation
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

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-summary-block-contract-validation`，只做本计划的 docs-only validation 与 ledger 收口。
