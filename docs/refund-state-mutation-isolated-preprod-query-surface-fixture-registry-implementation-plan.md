# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Implementation Plan

## 背景

- 当前 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-api-validation` 已完成，fixture registry API、selector 优先级、lookup contract 和 local-only gate 已经固定。
- 下一步不是直接写 route、DB resolver 或 workflow wiring，而是先把 fixture registry implementation 的模块边界、loader 位置、typed selector 和 fail-closed adapter 规划清楚。
- 当前高风险边界继续保持不变：不连接 production / preprod DB，不执行 workflow，不写 refund success state，不触发 settlement、commission、payout、permission、fulfillment 或 logistics mutation。

## 本轮目标

本轮只规划 future fixture registry implementation 的结构边界，确保后续即使进入 code-level implementation，也能保持 local fixture only、typed、fail-closed，并且不把 isolated preprod query surface 误接到真实 runtime。

## 结论

后续 fixture registry implementation 应拆成四层，并继续限定在 `packages/api/src/modules/china-payment-notification/` 这一条隔离链路下：

1. `fixture-registry-types`
   - 定义 fixture bundle、scenario type、selector input、registry lookup result、registry error code。
   - 所有 selector / loader / adapter 共享同一套 typed contract，避免 route 或 review case builder 自己拼字符串。

2. `fixture-selector-parser`
   - 只负责把 query surface 输入解析为 typed selector。
   - 支持 `fixtureSourceKey`、`scenarioType`、default fixture 和显式 `selectorMode`。
   - 解析失败必须 fail-closed，不允许 silent fallback 到任意 fixture。

3. `local-fixture-registry-loader`
   - 只负责加载本地 fixture bundle 和 registry map。
   - loader 位置建议固定在 `packages/api/src/modules/china-payment-notification/fixtures/review-query-surface/` 或同级 local-only 子目录。
   - 不允许从 DB、env secret、远程 URL 或 preprod snapshot 拉取 fixture。

4. `fixture-registry-adapter`
   - 负责把 typed selector 接到 local fixture registry，并返回 query surface builder 可消费的 redacted review case input。
   - adapter 必须显式暴露 `disabled` / `local_fixture` 两档 readiness；未来若要规划 `isolated_preprod_repository`，也必须继续留在 resolver 层，而不是直接混进 fixture adapter。

## 模块边界

### 1. types 层

建议 future implementation 至少覆盖以下类型：

- `RefundReviewFixtureScenarioType`
- `RefundReviewFixtureSourceKey`
- `RefundReviewFixtureSelectorInput`
- `RefundReviewFixtureSelectorResolution`
- `RefundReviewFixtureRegistryEntry`
- `RefundReviewFixtureRegistryLookupResult`
- `RefundReviewFixtureRegistryBlockCode`

这些类型必须保持只读、local-only，并把 fail-closed 原因编码成明确 block code，而不是用 `null` / `undefined` 让上层猜测。

### 2. selector parser 层

selector parser 只做三件事：

1. 解析输入来源
   - 显式 `fixtureSourceKey`
   - `scenarioType + default fixture`
   - `selectorMode`

2. 产出 typed selector resolution
   - `resolvedBy=explicit_source_key`
   - `resolvedBy=default_scenario_fixture`
   - `resolvedBy=blocked`

3. 失败时输出 block code
   - `fixture_selector_missing`
   - `fixture_selector_invalid`
   - `fixture_selector_local_only_required`
   - `fixture_selector_ambiguous`

它不负责读取 fixture，也不负责拼 review case。

### 3. local fixture loader 层

loader 只允许处理 repo 内静态 fixture：

- local fixture manifest
- local fixture bundle export
- source key -> bundle entry map
- scenario type -> default bundle entry map

loader 约束：

- 不从 runtime request 动态生成 fixture。
- 不读取 production / preprod DB。
- 不读取 operator upload 文件。
- 不依赖 workflow、job、subscriber 或 route context。
- fixture 缺失时必须 fail-closed，不允许自动降级成空 evidence。

### 4. adapter 层

adapter 是 fixture registry implementation 对 query surface 的唯一出口，职责是：

- 接收 typed selector input
- 调用 parser + loader / registry lookup
- 输出 redacted review case seed
- 输出 block code / readiness / resolution metadata

adapter 不允许直接：

- 执行 review case builder 之外的业务逻辑
- 修改 approval / audit / runtime attempt / terminal conflict persistence
- 触发 workflow
- 改写 refund state

## loader 路径建议

后续若进入 implementation，建议固定为：

- `packages/api/src/modules/china-payment-notification/fixtures/review-query-surface/registry/`
- `packages/api/src/modules/china-payment-notification/fixtures/review-query-surface/scenarios/`

理由：

- 与当前 refund / payment notification 高风险链路放在同一受控模块下，避免散落到 `lib/`、`api/` 或三端 UI。
- 明确这是 review query surface 的 local fixture，不是通用 seed、测试数据库 fixture 或 preprod snapshot。
- 未来即使增加 resolver mode，也可以让 fixture registry 和 repository resolver 保持平行，而不是相互缠绕。

## typed selector 建议

future selector contract 建议采用显式字段，而不是自由字符串：

- `selectorMode`: `explicit_source_key | scenario_default`
- `fixtureSourceKey?: string`
- `scenarioType?: RefundReviewFixtureScenarioType`
- `localOnly: true`

约束：

- `selectorMode=explicit_source_key` 时必须提供 `fixtureSourceKey`
- `selectorMode=scenario_default` 时必须提供 `scenarioType`
- 任一字段缺失或不匹配时必须 fail-closed
- 不允许 `selectorMode` 缺失后自动猜测

## fail-closed 规则

future fixture registry implementation 必须保持以下 fail-closed 行为：

1. 未显式 local-only
   - 直接 blocked

2. source key 不存在
   - 直接 blocked

3. scenario type 没有 default fixture
   - 直接 blocked

4. fixture bundle 缺字段或 cross-reference 不完整
   - 直接 blocked

5. resolution 过程出现 ambiguous match
   - 直接 blocked

6. adapter readiness 不满足
   - 直接 blocked

任何 blocked 都必须带 block code，且上层 query surface 不得把 blocked case 渲染成看似完整的 review case。

## 非目标

本轮明确不做以下事项：

- 不新增 fixture registry implementation 代码
- 不新增 route
- 不新增 repository resolver implementation
- 不连接 production / preprod DB
- 不读取 isolated preprod snapshot
- 不执行 workflow
- 不写 refund success state

## 验证

本轮为 docs-only 任务，验证要求：

1. `git diff --check`
2. `git status --short --branch`
3. 文件范围确认仅限 docs / queue / ledger / task

## 下一步建议

下一步进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-implementation-validation`，只做本计划的 docs-only validation 与 ledger 收口，不进入 runtime implementation。
