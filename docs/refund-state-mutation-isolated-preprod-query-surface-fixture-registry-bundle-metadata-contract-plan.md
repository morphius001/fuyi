# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Bundle Metadata Contract Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-manifest-contract-validation` 已完成，当前已经确认 manifest contract 仍然停留在 docs-only 边界。
- 上一轮 manifest contract 已经固定 manifest entry、scenario default、versioning 和 cross-reference 规则。
- 下一步需要单独把 fixture bundle metadata schema、redaction markers、local-only markers 和 bundle-to-manifest version 协同规则规划清楚，避免 future loader / registry 只校验 manifest 而忽略 bundle 自身约束。

## 本轮目标

本轮只规划 bundle metadata contract，不进入 bundle implementation、loader implementation、registry wiring、route 或 runtime。

## 结论

future fixture bundle metadata 应作为每个 review-case bundle 的必备头信息，至少覆盖 source key、fixture id、scenario type、bundle version、redaction、local-only 和 cross-reference digest，并作为 loader / registry / query surface fail-closed 校验的第二真相源。

## bundle metadata schema 建议

每个 bundle metadata 建议至少包含：

- `fixtureSourceKey`
- `fixtureId`
- `scenarioType`
- `bundleVersion`
- `manifestVersion`
- `redacted`
- `localOnly`
- `crossReferenceKey`
- `evidenceShapeVersion`
- `status`

约束：

1. `fixtureSourceKey`
   - 必须与 manifest entry 完全一致

2. `fixtureId`
   - 必须与 manifest entry 对齐

3. `scenarioType`
   - 必须属于受控 allowlist

4. `bundleVersion`
   - 必须显式声明
   - 不允许缺省或隐式推断

5. `manifestVersion`
   - 必须显式记录当前 bundle 期望对齐的 manifest contract version

6. `redacted`
   - 必须恒为 `true`

7. `localOnly`
   - 必须恒为 `true`

8. `crossReferenceKey`
   - 必须与 manifest entry 的 cross-reference key 一致

9. `evidenceShapeVersion`
   - 必须显式声明 review case evidence payload 的结构版本

10. `status`
   - 建议受控为 `active | deprecated | blocked`

## redaction marker 规则

bundle metadata 层应把 redaction 视为强约束，而不是描述性标签：

- `redacted=true` 必须存在
- 不允许省略 redaction marker
- 不允许 `redacted=false`
- 任何 evidence payload 若未满足 redacted contract，整个 bundle 必须 blocked

future loader / registry 不应假设“fixture 在 repo 内所以天然安全”，而应显式检查 redaction marker 与 payload shape 是否匹配。

## local-only marker 规则

bundle metadata 层应显式声明：

- `localOnly=true`

约束：

- 不允许缺失 local-only marker
- 不允许 `localOnly=false`
- 不允许同一 bundle 同时宣称 local fixture 与 repository-backed fixture

目的：

- 防止 future resolver mode 引入时误把 bundle 当成 preprod repository 数据
- 让 query surface / adapter 可以稳定向上游暴露 local-only gate

## bundle-to-manifest version 协同规则

future loader / registry 至少要校验：

1. `bundleVersion` 存在且合法
2. `manifestVersion` 存在且合法
3. bundle metadata 的 `manifestVersion` 与 manifest entry / default contract 兼容
4. `evidenceShapeVersion` 与 query surface builder 期望的受控版本兼容
5. 任一 version 缺失、越级或不兼容都必须 fail-closed

建议 future contract 采用以下原则：

- manifest version 控制“登记合同”
- bundle version 控制“单 bundle 包装格式”
- evidence shape version 控制“review case payload 结构”

三者不必完全相同，但必须显式协同。

## cross-check 规则

future loader / registry 对 bundle metadata 至少要做以下 cross-check：

1. `fixtureSourceKey`
2. `fixtureId`
3. `scenarioType`
4. `crossReferenceKey`
5. `manifestVersion`
6. `redacted`
7. `localOnly`
8. `status`

任何 mismatch 都必须 blocked，不允许：

- 静默 fallback
- 自动修正
- 按路径名猜测
- 用 default fixture 替代当前 bundle

## block code 建议

bundle metadata contract 层建议预留以下 block code：

- `fixture_bundle_metadata_missing`
- `fixture_bundle_metadata_missing_field`
- `fixture_bundle_metadata_invalid_scenario_type`
- `fixture_bundle_metadata_version_missing`
- `fixture_bundle_metadata_version_incompatible`
- `fixture_bundle_not_redacted`
- `fixture_bundle_not_local_only`
- `fixture_bundle_cross_reference_mismatch`
- `fixture_bundle_status_invalid`
- `fixture_bundle_evidence_shape_unsupported`

## 合同边界

bundle metadata contract 只解决“什么算合法 bundle metadata”，不解决：

- bundle 文件如何加载
- evidence payload 如何被 builder 消费
- selector 如何选择 bundle
- route / resolver / runtime 如何接入

这些继续留给后续独立任务。

## 非目标

本轮明确不做以下事项：

- 不新增 bundle metadata implementation
- 不新增 manifest implementation
- 不新增 loader implementation
- 不新增 route
- 不连接 production / preprod DB
- 不执行 workflow
- 不写 refund success state

## 验证

1. `git diff --check`
2. `git status --short --branch`
3. 文件范围确认仅限 docs / queue / ledger / task

## 下一步建议

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-bundle-metadata-contract-validation`，只做本计划的 docs-only validation 与 ledger 收口。
