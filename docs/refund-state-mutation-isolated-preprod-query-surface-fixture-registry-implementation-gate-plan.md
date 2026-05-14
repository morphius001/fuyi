# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Implementation Gate Plan

更新时间：2026-05-14 Asia/Shanghai

## 目标

在 contract readiness validation 完成之后，为 fixture registry 进入 implementation、builder wiring、resolver runtime、route / query surface execution 之前建立统一 gate。当前阶段仍然保持 gate-first、docs-only，先把必须满足的前置证据、阻断条件和回滚要求写死，再决定是否允许进入任何执行级 PR。

## 结论

当前默认结论仍然是 blocked。只有在以下 gate 同时满足时，后续 implementation 级 PR 才能被视为可评审候选：

1. `contractBaselineGate`
2. `versionCompatibilityGate`
3. `fixtureEvidenceGate`
4. `builderWiringGate`
5. `resolverModeGate`
6. `routeExposureGate`
7. `rollbackGate`
8. `operatorEvidenceGate`

任一 gate 失败都必须 fail-closed，不允许通过局部放行、临时绕过或“先接上再补文档”的方式进入 implementation。

## Gate Matrix

### 1. `contractBaselineGate`

必须已有完整 docs-only baseline，且能稳定对应到以下合同链：

- manifest contract
- bundle metadata contract
- evidence shape contract
- summary / references / timeline / decisionGuards / operatorHints contract
- cross-block consistency
- payload compatibility
- contract readiness review / validation

若任何合同文档仍缺失、命名漂移、或 queue / ledger / handoff 指向不一致，必须阻断并返回：

- `implementation_gate_contract_incomplete`

### 2. `versionCompatibilityGate`

进入 implementation 前，必须先固定 future runtime enforcement 需要遵守的版本矩阵：

- `manifestVersion`
- `bundleVersion`
- `evidenceShapeVersion`
- `consistencyRuleSetVersion`

并明确 mixed bundle、partial upgrade、unsupported version 的真实阻断策略。若 implementation 计划无法说明这些版本如何在 loader、registry、builder、resolver 之间共同 fail-closed，必须阻断并返回：

- `implementation_gate_version_matrix_missing`

### 3. `fixtureEvidenceGate`

local fixture 仍是后续 implementation 的第一落点，因此必须先证明 fixture 层证据足够支撑 builder / resolver / route 的只读输出：

- fixture bundle shape 已固定
- fixture source key / scenario type / localOnly 标记已固定
- summary / references / timeline / decisionGuards / operatorHints 五段证据都能被稳定表达
- redaction boundary 和 missing evidence flags 已可追溯

若 implementation 需要的 evidence 仍依赖隐式字段、非合同化 slot、或未定义 fixture default，则必须阻断并返回：

- `implementation_gate_fixture_evidence_missing`

### 4. `builderWiringGate`

任何 builder wiring 之前，必须先定义 builder 层只能做什么、不能做什么：

- 只允许拼装 redacted read model
- 不允许触发 workflow execution
- 不允许修改 refund success state
- 不允许直接访问 production / preprod DB
- 不允许把 missing evidence 自动当作 allow

同时需要明确 builder fail-closed 行为：

- cross-reference 缺失如何 blocked
- version mismatch 如何 blocked
- empty payload / partial payload 如何 blocked

若 builder 仍缺少这些边界定义，必须阻断并返回：

- `implementation_gate_builder_boundary_missing`

### 5. `resolverModeGate`

resolver runtime 必须先固定三类模式及其前置约束：

- `disabled`
- `local_fixture`
- `isolated_preprod_repository`

进入 implementation 前，必须先写清楚：

- 默认模式仍然是 `disabled`
- `local_fixture` 只能读取受控 fixture
- `isolated_preprod_repository` 不得在没有环境 gate、operator gate、rollback gate 的前提下被启用
- 任意未知 mode、缺失 mode、环境不符时必须 fail-closed

若 resolver mode contract 仍无法支持真实 runtime gate，必须阻断并返回：

- `implementation_gate_resolver_mode_undefined`

### 6. `routeExposureGate`

任何 route / query surface execution 之前，必须先定义暴露层 gate：

- route 默认 disabled
- route 不得直接读取 production / preprod DB
- route 不得在 runtime 中隐式放大 local fixture 数据
- route 响应必须保留 blocked / redacted / unsupported version 的显式结果
- route 不得被前端或 operator 误解为可执行 refund mutation surface

若 route 暴露方式仍可能误导为可执行 runtime、或无法保证 disabled-by-default，必须阻断并返回：

- `implementation_gate_route_exposure_blocked`

### 7. `rollbackGate`

implementation 前必须先定义失败时的统一回滚策略：

- 如何快速退回 `disabled`
- 如何禁用 `local_fixture` 或 `isolated_preprod_repository`
- 如何判定 builder / resolver / route 已进入 unsafe state
- 如何记录 rollback owner、rollback evidence 和 kill-switch 路径

没有 rollback drill、没有 disable path、或没有 kill-switch 前提时，不允许进入 implementation，必须阻断并返回：

- `implementation_gate_rollback_missing`

### 8. `operatorEvidenceGate`

进入 implementation 前，必须先保证 operator review 不会被半成品 query surface 误导：

- blocked 原因必须可见
- missing evidence 必须可见
- recommended action 只能是只读提示
- 决策仍不能脱离人工 review 与 operator sign-off

若 implementation 可能让 operator 误以为 evidence 完整、或误以为系统已具备自动执行资格，必须阻断并返回：

- `implementation_gate_operator_evidence_missing`

## Verification Expectations Before Any Implementation PR

任何后续 implementation 级 PR 至少需要补齐以下验证证据：

1. contract-only diff check 与 file-scope review
2. fixture-level compatibility validation
3. builder-level fail-closed tests
4. resolver mode gate tests
5. route disabled-by-default validation
6. rollback / disable path rehearsal notes

如果这些验证项没有对应的执行计划或不能在 isolated preprod / local fixture 边界内完成，应继续停留在 docs-only。

## Block Codes

本轮统一建议的 implementation gate block code：

- `implementation_gate_contract_incomplete`
- `implementation_gate_version_matrix_missing`
- `implementation_gate_fixture_evidence_missing`
- `implementation_gate_builder_boundary_missing`
- `implementation_gate_resolver_mode_undefined`
- `implementation_gate_route_exposure_blocked`
- `implementation_gate_rollback_missing`
- `implementation_gate_operator_evidence_missing`

## 非目标

本轮不进入以下内容：

- 不新增 fixture registry implementation
- 不新增 payload builder wiring
- 不新增 repository resolver runtime
- 不新增 route / query surface runtime
- 不连接 production / preprod DB
- 不执行 workflow
- 不写 refund success state
- 不触发 settlement、commission、payout、permission、fulfillment 或 logistics mutation

## Verification Plan

本轮计划 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

复核重点：

- 仅修改 docs / queue / ledger / task
- 未引入 `packages/api/src/**` runtime implementation
- 未引入 route、job、subscriber、migration、DB wiring
- 未改变 workflow execution、refund success state 或其他高风险副作用

## 下一步建议

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-implementation-gate-validation`，确认本轮 gate 文档仍然保持 docs-only 边界，并把 queue / ledger / handoff 收口到下一跳。
