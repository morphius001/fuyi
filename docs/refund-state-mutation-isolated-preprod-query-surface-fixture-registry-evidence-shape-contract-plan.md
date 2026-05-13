# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Evidence Shape Contract Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-bundle-metadata-contract-validation` 已完成，当前已经确认 bundle metadata contract 仍停留在 docs-only 边界。
- 上一轮 bundle metadata contract 已经固定 source key、fixture id、scenario type、bundleVersion、manifestVersion、evidenceShapeVersion、redaction、local-only 和 cross-reference 协同规则。
- 下一步需要单独把 review case evidence payload 的 shape、reference slot、redaction boundary 和 versioned shape contract 规划清楚，避免 future fixture bundle 虽然 metadata 合法，但 evidence payload 自身没有稳定合同。

## 本轮目标

本轮只规划 review case evidence shape contract，不进入 payload implementation、builder wiring、route 或 runtime。

## 结论

future review case evidence payload 应采用 versioned shape contract，最少拆成 `summary`、`references`、`timeline`、`decisionGuards`、`operatorHints` 五个稳定区块，并把 redaction boundary 固定在 contract 层而不是由消费方猜测。

## evidence shape 顶层结构建议

future payload 建议至少包含：

- `evidenceShapeVersion`
- `summary`
- `references`
- `timeline`
- `decisionGuards`
- `operatorHints`

约束：

1. `evidenceShapeVersion`
   - 必须显式声明
   - 不允许缺省

2. 顶层区块必须全部存在
   - 可以为空结构
   - 但不允许缺字段

3. 顶层结构必须只读
   - 不携带 mutation 意图
   - 不表达 workflow 执行命令

## summary 区块建议

`summary` 建议包含：

- `reviewCaseId`
- `scenarioType`
- `caseStatus`
- `refundReference`
- `marketContext`
- `sellerContext`

约束：

- 只允许 redacted 后的标识与上下文
- 不允许真实姓名、手机号、详细地址、支付凭证原文
- `caseStatus` 仅表达 review-case 展示状态，不表达真实退款成功

## references 区块建议

`references` 用于承接 cross-linked 证据槽位，建议至少包含：

- `approvalRecordRef`
- `auditRecordRef`
- `runtimeAttemptRef`
- `terminalConflictRef`
- `fixtureSourceKey`

reference slot 规则：

- 可以为空，但字段必须存在
- 若 slot 存在则必须为 redacted reference
- 不允许把整条原始 persistence record 塞进 reference slot

## timeline 区块建议

`timeline` 用于展示 review case 的受控事件顺序，建议为只读数组：

- `eventType`
- `eventStatus`
- `eventTimestamp`
- `eventReference`

约束：

- 不允许原始 provider payload
- 不允许未 redacted actor 信息
- 时间线只表达 operator 可读事件，不表达 workflow 可执行步骤

## decisionGuards 区块建议

`decisionGuards` 应承载 fail-closed 结果和 review 阻断信息，建议包含：

- `refundStateMutationAllowed`
- `repositoryWriteAllowed`
- `workflowExecutionAllowed`
- `blockCodes`
- `missingEvidenceFlags`

约束：

- 默认值应倾向 fail-closed
- 不允许在 evidence payload 内表达任何 `allowed=true` 以外的隐式放行逻辑
- `blockCodes` 应复用前面 manifest / bundle metadata / resolver contract 的统一 block code 体系

## operatorHints 区块建议

`operatorHints` 只用于展示层提示，建议包含：

- `recommendedAction`
- `manualReviewRequired`
- `rollbackRequired`
- `notes`

约束：

- 只允许提示，不允许执行命令
- 不允许把 operator hint 当成 state transition 输入

## redaction boundary 建议

evidence shape contract 层必须明确以下 redaction 边界：

1. 不暴露真实支付凭证原文
2. 不暴露真实用户 PII
3. 不暴露真实收货地址 / 手机号
4. 不暴露原始 provider webhook body
5. 不暴露可直接执行的 workflow command payload

可以暴露的仅限：

- redacted identifiers
- redacted timestamps
- redacted status / flags / block codes
- redacted reference handles

## versioned shape contract 规则

future payload contract 至少要保证：

1. `evidenceShapeVersion` 显式存在
2. bundle metadata 中的 `evidenceShapeVersion` 与 payload 顶层一致
3. query surface builder 只消费受支持版本
4. 任一 version 缺失或不兼容都必须 fail-closed

version 演进时应优先新增字段，不应无声改写既有字段语义。

## 非目标

本轮明确不做以下事项：

- 不新增 evidence payload implementation
- 不新增 bundle metadata implementation
- 不新增 query surface builder wiring
- 不新增 route
- 不连接 production / preprod DB
- 不执行 workflow
- 不写 refund success state

## 验证

1. `git diff --check`
2. `git status --short --branch`
3. 文件范围确认仅限 docs / queue / ledger / task

## 下一步建议

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-evidence-shape-contract-validation`，只做本计划的 docs-only validation 与 ledger 收口。
