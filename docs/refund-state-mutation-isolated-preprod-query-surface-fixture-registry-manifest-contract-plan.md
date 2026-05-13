# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Manifest Contract Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-local-loader-validation` 已完成，当前已经确认 local fixture loader 仍停留在 docs-only 边界。
- 上一轮 local loader plan 已经固定三段式结构：manifest、scenario default index、registry export contract。
- 下一步需要单独把 manifest entry schema、scenario default contract、versioning 和 cross-reference 校验规则规划清楚，避免后续 loader 实现把关键约束散落到多处 if/else 中。

## 本轮目标

本轮只规划 fixture manifest contract，不进入 manifest implementation、loader implementation、registry wiring、route 或 runtime。

## 结论

future fixture manifest contract 应把单条 fixture entry、scenario default entry 和 bundle cross-reference 校验分成三层，并通过显式 version 字段与 block code 保持 fail-closed。

## manifest entry schema 建议

单条 manifest entry 建议至少包含：

- `fixtureSourceKey`
- `fixtureId`
- `scenarioType`
- `version`
- `localOnly`
- `redacted`
- `status`
- `bundleRef`
- `crossReferenceKey`

约束：

1. `fixtureSourceKey`
   - 全局唯一
   - 稳定、可读、不可依赖运行时随机值

2. `fixtureId`
   - 用于 bundle 与 manifest 对齐
   - 同一 source key 下唯一

3. `scenarioType`
   - 必须属于受控 allowlist
   - 不允许自由字符串

4. `version`
   - 必须显式声明
   - 不允许缺省为 `1`

5. `localOnly`
   - 必须恒为 `true`

6. `redacted`
   - 必须恒为 `true`

7. `status`
   - 建议受控为 `active | deprecated | blocked`

8. `bundleRef`
   - 必须能稳定指向 repo 内静态 bundle
   - 不允许指向 DB、URL 或用户上传资源

9. `crossReferenceKey`
   - 用于 manifest 与 bundle 的一致性校验
   - 不允许空值

## scenario default contract 建议

future default map 不应隐藏在单条 manifest entry 里，而应使用单独 contract：

- `scenarioType`
- `defaultFixtureSourceKey`
- `version`
- `status`

约束：

1. 一个 `scenarioType` 最多一个 `active` default fixture
2. `defaultFixtureSourceKey` 必须指向现存且 `active` 的 manifest entry
3. `defaultFixtureSourceKey` 对应 entry 必须与当前 `scenarioType` 一致
4. default contract 也必须显式 versioned

不允许：

- 一个 scenario type 配多个 active default
- default 指向 deprecated / blocked fixture
- default contract 不声明 version

## versioning 规则建议

manifest contract 建议至少支持以下 version 规则：

1. `version` 为必填字符串或受控整数
2. manifest entry version 与 default contract version 不必强制相同，但必须可比较且可审计
3. bundle metadata 也必须带同一类 version 字段，用于 cross-check
4. 任何 version 缺失或不匹配都必须 fail-closed

version 主要用于：

- manifest schema 演进
- bundle 结构升级
- future fixture refresh 审计
- 避免 loader 在 schema 演进后静默吞错

## cross-reference 校验规则

future loader / registry implementation 应至少校验：

1. manifest entry `fixtureSourceKey` 与 bundle metadata `fixtureSourceKey` 一致
2. manifest entry `fixtureId` 与 bundle metadata `fixtureId` 一致
3. manifest entry `scenarioType` 与 bundle metadata `scenarioType` 一致
4. manifest entry `crossReferenceKey` 与 bundle metadata `crossReferenceKey` 一致
5. manifest entry `redacted=true` 与 bundle redaction metadata 一致
6. manifest entry `localOnly=true` 与 bundle local-only metadata 一致
7. default contract 的 source key 能解析到同 scenario type 的 active entry

任一不一致都必须 blocked，不允许 silent repair 或自动猜测。

## block code 建议

manifest contract 层建议预留以下 block code：

- `fixture_manifest_entry_missing_field`
- `fixture_manifest_duplicate_source_key`
- `fixture_manifest_invalid_scenario_type`
- `fixture_manifest_invalid_status`
- `fixture_manifest_version_missing`
- `fixture_default_entry_missing`
- `fixture_default_entry_invalid`
- `fixture_default_entry_ambiguous`
- `fixture_bundle_reference_missing`
- `fixture_bundle_cross_reference_mismatch`
- `fixture_bundle_version_mismatch`

这样后续 loader / registry adapter / query surface 可以共享同一套 fail-closed 原因，而不是各自定义错误文案。

## 合同边界

manifest contract 只解决“什么算合法 fixture manifest”，不解决：

- 如何读取 bundle 文件
- 如何解析 selector
- 如何渲染 review case
- 如何接 repository resolver
- 如何接 route 或 runtime

这些应继续留给后续独立任务。

## 非目标

本轮明确不做以下事项：

- 不新增 manifest implementation
- 不新增 local fixture loader implementation
- 不新增 registry implementation
- 不新增 route
- 不连接 production / preprod DB
- 不执行 workflow
- 不写 refund success state

## 验证

1. `git diff --check`
2. `git status --short --branch`
3. 文件范围确认仅限 docs / queue / ledger / task

## 下一步建议

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-manifest-contract-validation`，只做本计划的 docs-only validation 与 ledger 收口。
