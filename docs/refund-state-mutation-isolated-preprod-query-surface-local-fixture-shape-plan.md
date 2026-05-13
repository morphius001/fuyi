# Refund State Mutation Isolated Preprod Query Surface Local Fixture Shape Plan

更新时间：2026-05-14 Asia/Shanghai

## 结论

在进入任何 future fixture loader 或 resolver implementation 之前，必须先固定 local fixture 的数据形状、fixture registry 和 source key 规则。

本计划只规划 local fixture 如何为 query surface 提供 redacted、cross-reference-complete、local-only 的 review case evidence，不实现 fixture loader、不连接 DB、不新增 route、不执行 workflow、不写 refund success state。

## Why Fixture Shape Must Be Planned

resolver mode 已经固定为 `disabled`、`local_fixture`、`isolated_preprod_repository` 三档。现在如果不先定义 fixture shape，后续 implementation 会出现几个风险：

- fixture records 与真实 repository records 形状漂移
- fixture 可能缺少 cross-reference，却被误当成完整 review case
- fixture source key 命名无约束，后续 UI / smoke / tests 难以复用
- local-only 标记不足，容易把 fixture 伪装成 preprod evidence
- 同一 fixture registry 里混入 raw payload、provider request/query 或其他敏感字段

所以在写任何 fixture loader 或 registry 代码前，必须先把 shape 和 naming contract 写死。

## Required Fixture Bundles

每个 local fixture bundle 至少应包含四段 redacted records：

1. `approvalRecords`
2. `auditRecords`
3. `runtimeAttemptRecords`
4. `terminalConflictSnapshots`

如需事件级回放，可选包含：

5. `approvalEvents`
6. `auditEvents`
7. `runtimeAttemptEvents`
8. `terminalConflictEvents`

每个 bundle 还必须带：

- `fixtureSourceKey`
- `fixtureVersion`
- `fixtureLabel`
- `localOnly: true`
- `scenarioType`
- `createdAt`

## Supported Scenario Types

future fixture registry 只允许先支持这些场景：

1. `happy_path_review_case`
2. `duplicate_noop_review_case`
3. `manual_review_required_case`
4. `retryable_failure_case`
5. `missing_cross_reference_case`
6. `cross_reference_mismatch_case`
7. `environment_gate_blocked_case`

不允许在第一阶段直接引入：

- `production_like_success_override`
- `live_provider_query_case`
- `workflow_execute_case`
- `raw_payload_debug_case`

## Fixture Source Key Rules

`fixtureSourceKey` 必须：

- 带 `local_fixture:` 前缀
- 稳定、可读、可 grep
- 不包含 merchant secret、provider key、DB handle、手机号、地址、身份证等敏感信息

推荐格式：

```text
local_fixture:refund_review:<scenario>:<provider>:<version>
```

示例：

```text
local_fixture:refund_review:happy_path:wechat_pay:v1
local_fixture:refund_review:duplicate_noop:mock_china_pay:v1
```

## Shape Compatibility Rules

fixture shape 必须与现有 query surface builder 的输入保持兼容：

- 字段命名优先与 approval / audit / runtime attempt / terminal conflict record types 对齐
- 所有必要 cross-reference 必须齐：
  - `approval_persistence_idempotency_key`
  - `audit_persistence_idempotency_key`
  - `runtime_attempt_persistence_idempotency_key`
  - `terminal_conflict_persistence_idempotency_key`
  - `platform_refund_id`
  - `provider_refund_reference`
  - `workflow_idempotency_key`
  - `terminal_marker_key`

fixture 若故意模拟缺失或错配，也必须：

- 只缺本场景设计要缺的那一项
- 明确标记 `expectedResultType=incomplete|blocked`
- 明确标记 `expectedBlockCode`

## Local-Only Marking Rules

future fixture bundle 必须显式带：

- `localOnly: true`
- `allowedResolverMode: local_fixture`
- `isolatedPreprodEvidence: false`

不允许默认省略这些标记。

任何缺少 local-only 标记的 fixture，都必须在 resolver 层被 fail-closed 拒绝。

## Redaction Rules

fixture 内容只允许包含：

- redacted reason
- operator-visible reason
- idempotency keys
- block codes
- timestamps
- safe actor / reviewer reference
- feature flag snapshot key

fixture 内容禁止包含：

- raw provider payload
- provider request / query body
- secret、certificate、merchant credential
- DB URL
- 完整 PII
- workflow executable input
- production override / success override / terminal lock override

## Registry Rules

future registry 至少要支持：

- `getFixtureBySourceKey(fixtureSourceKey)`
- `listFixtureSourceKeys()`
- `listFixturesByScenarioType(scenarioType)`

registry 不允许：

- 动态联网拉 fixture
- 从 production / preprod DB 导出 fixture
- 自动混合多个 fixture bundle 组装一个 review case

## Recommended Next Steps

下一步建议仍保持 docs-only：

1. `refund-state-mutation-isolated-preprod-query-surface-local-fixture-shape-validation`
2. 如验证通过，再考虑 fixture registry API plan
3. 在 fixture validation 和 registry plan 都齐前，不进入 fixture loader implementation

## Verification Plan

本计划 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

复核重点：

- 本轮只改 docs / queue / ledger / task 文件
- 未修改 `packages/api/**` runtime
- 未新增 route、fixture loader、repository implementation、DB、workflow、refund success state mutation
