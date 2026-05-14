# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Payload Compatibility Plan

## 背景

- `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-cross-block-consistency-validation` 已完成，当前已经确认各顶层区块之间的一致性规划仍停留在 docs-only 边界。
- 上一轮已经固定 bundle metadata、evidence shape、cross-block consistency 的单块和跨块约束，但还没有把 future payload 版本演进、mixed fixture bundle、partial upgrade 和 unsupported shape 的兼容策略拆出来。
- 下一步需要单独规划 compatibility contract，避免 future builder / loader / registry 对“旧版本还能不能读、混合版本能不能容忍、何时必须 blocked”各写一套半兼容逻辑。

## 本轮目标

本轮只规划 payload compatibility contract，不进入 payload implementation、builder wiring、repository resolver runtime、route 或 DB。

## 结论

future fixture registry payload 应采用明确的 compatibility matrix，把 `manifestVersion`、`bundleVersion`、`evidenceShapeVersion`、cross-block consistency rule set 一起作为 version gate。任何 unsupported version、mixed bundle、partial upgrade 或 rule-set mismatch 都应显式 fail-closed，而不是依赖 best-effort 兼容。

## compatibility 维度建议

至少要同时考虑以下维度：

- `manifestVersion`
- `bundleVersion`
- `evidenceShapeVersion`
- `consistencyRuleSetVersion`
- `fixtureSourceKey`

约束：

1. 版本字段必须显式存在
2. 不允许靠缺字段推断“沿用默认版本”
3. compatibility 判断不能只看单一版本号

## compatibility matrix 建议

future builder / loader / registry 至少应维护一份受控 matrix，表达：

- 哪些 `manifestVersion` 可以和哪些 `bundleVersion` 共存
- 哪些 `evidenceShapeVersion` 需要哪些 `consistencyRuleSetVersion`
- 哪些版本组合只能 read-only accepted
- 哪些版本组合必须 blocked

建议按三类结果表达：

- `compatible`
- `compatible_with_restrictions`
- `unsupported`

当前阶段建议默认偏保守，只要不是明确兼容就进入 `unsupported`。

## mixed fixture bundle 规则

同一个 review case 或同一个 fixture registry snapshot 中，如果出现 mixed bundle：

- `bundleVersion` 不一致
- `evidenceShapeVersion` 不一致
- `consistencyRuleSetVersion` 不一致

则必须进入受控判断：

1. 若 matrix 明确允许同代混用，最多进入 `compatible_with_restrictions`
2. 若 matrix 没有明确允许，必须 blocked
3. 不允许消费方在 mixed bundle 情况下自行挑“最新一个”

## partial upgrade 规则

若发生 partial upgrade，例如：

- metadata 已升级但 payload shape 未升级
- summary / references / timeline 升级了，但 decisionGuards / operatorHints 仍是旧规则
- cross-block consistency rule set 已升级，但旧 fixture 仍输出旧 key

则应视为高风险不一致：

- 不允许 silent fallback
- 不允许只对部分 block 忽略校验
- 必须追加兼容层 block code，并保持 fail-closed

## forward / backward compatibility 建议

### backward compatibility

仅在以下前提下允许：

- 旧版本字段语义未变
- 新系统仍保留旧版必要锚点
- matrix 明确声明支持

### forward compatibility

默认不应承诺：

- 旧系统读取新字段时不能假设“忽略未知字段就安全”
- 若新版本引入新的一致性锚点或新的 block 语义，旧 reader 应 blocked 而不是宽松接受

## version gate 建议

future query surface builder 至少要有以下 gate：

1. metadata gate
   - 检查 `manifestVersion` / `bundleVersion`
2. shape gate
   - 检查 `evidenceShapeVersion`
3. consistency gate
   - 检查 `consistencyRuleSetVersion`
4. mixed-bundle gate
   - 检查同一 case 是否混入多个不兼容版本

任一 gate 不通过：

- 不允许继续组装 review case
- 必须 blocked
- 必须产生可追溯 block code

## deprecation 策略建议

compatibility contract 层应明确：

- 哪些旧版本进入 `deprecated_but_supported`
- 哪些版本在下一个阶段会被移除支持
- 何时必须强制重建 fixture bundle

但当前阶段不需要给具体日期，只要先固定策略：

1. deprecated 版本必须可识别
2. deprecated 不等于永远允许
3. 一旦跨过支持窗口，必须 blocked

## block code 建议

compatibility 层建议预留以下 block code：

- `payload_manifest_version_unsupported`
- `payload_bundle_version_unsupported`
- `payload_shape_version_unsupported`
- `payload_consistency_rule_set_unsupported`
- `payload_version_matrix_mismatch`
- `payload_mixed_bundle_blocked`
- `payload_partial_upgrade_blocked`
- `payload_deprecated_version_blocked`

## operator / review 可读性建议

虽然 compatibility 是底层合同，但后续应支持把 blocked 原因映射为 operator 可读信息：

- 是版本太旧
- 是 shape 不匹配
- 是 mixed bundle
- 是 partial upgrade

这里仍然只规划合同，不在本轮定义文案。

## 非目标

本轮明确不做以下事项：

- 不新增 payload implementation
- 不新增 builder wiring
- 不新增 repository resolver runtime
- 不新增 route
- 不连接 production / preprod DB
- 不执行 workflow
- 不写 refund success state

## 验证

1. `git diff --check`
2. `git status --short --branch`
3. 文件范围确认仅限 docs / queue / ledger / task

## 下一步建议

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-payload-compatibility-validation`，只做本计划的 docs-only validation 与 ledger 收口。
