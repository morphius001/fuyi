# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Local Loader Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-implementation-validation` 已完成，当前已经确认 fixture registry implementation 仍然停留在 docs-only 边界。
- 上一轮 implementation plan 已经固定 future module 分层：types、selector parser、local fixture loader、fixture registry adapter。
- 下一步需要单独把 local fixture loader 的 manifest、目录结构、导出 contract 和 fail-closed 读取边界写清楚，避免后续把 fixture loader 做成松散文件扫描、动态拼接或隐式 fallback。

## 本轮目标

本轮只规划 local fixture loader 本身，不进入 registry implementation、route、DB resolver 或 runtime wiring。

## 结论

future local fixture loader 应采用“显式 manifest + 显式导出 registry entry + 显式 scenario default map”的三段式结构，且只允许从 repo 内受控目录读取静态 fixture bundle。

## 目录结构建议

建议 future local fixture loader 固定在：

- `packages/api/src/modules/china-payment-notification/fixtures/review-query-surface/manifest/`
- `packages/api/src/modules/china-payment-notification/fixtures/review-query-surface/scenarios/`
- `packages/api/src/modules/china-payment-notification/fixtures/review-query-surface/registry/`

职责拆分：

1. `manifest/`
   - 保存 source key、scenario type、fixture file id、local-only 标记、version、redaction status 等只读元数据

2. `scenarios/`
   - 保存按 scenario type 聚合的 default fixture 声明

3. `registry/`
   - 保存 future loader / registry adapter 使用的导出入口

不建议：

- 直接在目录里做无约束 `glob`
- 让 scenario default 隐藏在 fixture bundle 文件内部
- 让 route 或 builder 自己绕过 loader 直读 fixture 文件

## manifest shape 建议

future manifest entry 建议至少包含：

- `fixtureSourceKey`
- `scenarioType`
- `fixtureId`
- `localOnly`
- `redacted`
- `version`
- `status`

约束：

- `fixtureSourceKey` 必须全局唯一
- `scenarioType + default=true` 只能对应一个默认 fixture
- `localOnly` 必须恒为 `true`
- `redacted` 必须恒为 `true`
- `status` 只能表达受控只读状态，例如 `active | deprecated`

不允许：

- 空 source key
- 多个 default fixture 指向同一 scenario type
- 一个 manifest 同时声明 local-only 和 repository-backed
- 未 redacted 的 review case fixture

## loader export contract

future loader 应只暴露受控只读出口：

1. `loadFixtureManifestIndex()`
   - 返回 source key -> manifest entry map

2. `loadScenarioDefaultIndex()`
   - 返回 scenario type -> default source key map

3. `loadFixtureBundleBySourceKey(sourceKey)`
   - 返回单个 fixture bundle

4. `listFixtureSourceKeys()`
   - 返回受控 source key 列表，供 diagnostics 或 test 使用

loader 不应暴露：

- 任意路径读取
- 按文件名模糊查找
- 动态注入 fixture 内容
- repository / DB fallback

## fail-closed 读取边界

future loader 必须在以下场景直接 blocked：

1. manifest 缺失
2. manifest entry 缺字段
3. source key 未注册
4. scenario default 缺失或重复
5. fixture bundle 文件不存在
6. fixture bundle 与 manifest cross-reference 不一致
7. fixture bundle 不满足 redacted / local-only 约束

blocked 时应输出明确 block code，例如：

- `fixture_manifest_missing`
- `fixture_manifest_invalid`
- `fixture_manifest_duplicate_source_key`
- `fixture_default_missing`
- `fixture_default_ambiguous`
- `fixture_bundle_missing`
- `fixture_bundle_cross_reference_invalid`
- `fixture_bundle_not_redacted`
- `fixture_bundle_not_local_only`

## future registry wiring 建议

后续进入 implementation 时，推荐 wiring 顺序为：

1. loader 先构建 manifest index
2. loader 再构建 scenario default index
3. registry adapter 只消费这两个 index 与单 bundle loader
4. selector parser 输出 typed selector 后，统一走 registry adapter，不允许上层直接碰 manifest / bundle 文件

这样可以保证：

- registry lookup 行为可测试
- default fixture 规则集中
- future repository resolver 与 local fixture loader 平行而不耦合
- fail-closed 原因能稳定映射到 block code

## 非目标

本轮明确不做以下事项：

- 不新增 local fixture loader implementation
- 不新增 fixture registry implementation
- 不新增 route
- 不连接 production / preprod DB
- 不读取 isolated preprod snapshot
- 不执行 workflow
- 不写 refund success state

## 验证

1. `git diff --check`
2. `git status --short --branch`
3. 文件范围确认仅限 docs / queue / ledger / task

## 下一步建议

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-local-loader-validation`，只做本计划的 docs-only validation 与 ledger 收口。
