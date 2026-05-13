# Refund State Mutation Isolated Preprod Query Surface Fixture Registry API Plan

更新时间：2026-05-14 Asia/Shanghai

## 结论

在 local fixture shape 和 validation 都完成后，下一步必须先把 fixture registry API、selector、lookup contract 和 local-only gate 固定下来，才能考虑 future fixture registry implementation。

本计划只规划 fixture registry 的只读 API 边界，不实现 loader、不连接 DB、不新增 route、不执行 workflow、不写 refund success state。

## Why Registry API Must Be Planned

即使 fixture bundle shape 已经固定，如果 registry API 没定义，后续 implementation 仍会出现风险：

- selector 行为漂移，导致同一个 source key 读到不同 fixture
- scenario type 和 source key 的查找入口不一致
- UI / smoke / focused tests 无法共享同一 lookup contract
- local-only gate 可能只在 loader 层做，registry API 本身却能暴露 unsafe enumerate 行为
- operator review 未来若接 fixture mode，调用边界可能和 repository mode 混淆

所以在任何 registry code 之前，必须先把 API surface 和 fail-closed 规则写清。

## Required Registry API Surface

future fixture registry 至少应支持以下只读 API：

1. `getFixtureBySourceKey(fixtureSourceKey)`
2. `listFixtureSourceKeys()`
3. `listFixturesByScenarioType(scenarioType)`
4. `getDefaultFixtureForScenarioType(scenarioType)`
5. `resolveFixtureSelector(selector)`

其中 `selector` 只允许三类：

- `fixtureSourceKey`
- `scenarioType`
- `scenarioType + providerName + version`

不允许：

- raw payload lookup
- provider request lookup
- merchant credential lookup
- production refund id lookup
- 动态网络查询

## Resolve Rules

`resolveFixtureSelector(selector)` 必须固定以下行为：

1. 优先按显式 `fixtureSourceKey` 精确匹配
2. 否则按 `scenarioType + providerName + version` 精确匹配
3. 否则按 `scenarioType` 返回默认 fixture
4. 任一结果若不唯一或不满足 local-only gate，则 fail-closed

不允许：

- fuzzy search
- 模糊前缀匹配
- 自动回退到任意 provider
- 自动回退到最新版本
- 混合多个 fixture bundle 拼接返回

## List API Rules

`listFixtureSourceKeys()` 和 `listFixturesByScenarioType()` 只能返回：

- `fixtureSourceKey`
- `fixtureLabel`
- `scenarioType`
- `providerName`
- `fixtureVersion`
- `localOnly`

不允许返回 fixture 内部 records / events 本体。

如果未来 UI 需要 summary，也只能返回安全 metadata，不得展开 approval / audit / runtime attempt / terminal conflict record 内容。

## Local-Only Gate

任何 registry API 调用前都必须先验证：

- 当前 source mode 为 `local_fixture`
- fixture bundle `localOnly: true`
- fixture source key 符合 `local_fixture:` 前缀规则

如果任一条件不成立：

- `get*` API 返回 blocked
- `list*` API 返回空集合或 blocked
- 不允许 silently downgrade

## Failure Modes

registry API 层至少要预留以下 fail-closed block code：

- `fixture_registry_mode_blocked`
- `fixture_source_key_invalid`
- `fixture_not_found`
- `fixture_selector_ambiguous`
- `fixture_local_only_gate_failed`
- `fixture_registry_metadata_incomplete`

这些 block code 未来应与 query surface 的 incomplete / blocked label 保持可映射。

## Recommended Next Steps

下一步建议仍保持 docs-only：

1. `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-api-validation`
2. 如验证通过，再考虑 fixture registry implementation plan
3. 在 registry API validation 和 implementation plan 都齐前，不进入 fixture registry code

## Verification Plan

本计划 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

复核重点：

- 本轮只改 docs / queue / ledger / task 文件
- 未修改 `packages/api/**` runtime
- 未新增 fixture registry implementation、route、DB、workflow、refund success state mutation
