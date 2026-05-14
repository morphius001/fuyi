# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Builder Wiring Plan

更新时间：2026-05-14 Asia/Shanghai

## 目标

在 implementation gate validation 之后，继续保持 docs-only / gate-first 节奏，规划 fixture registry 如何 fail-closed 地接入 query surface builder。当前重点不是实现 builder runtime，而是先固定 builder 层的输入优先级、blocked payload 形状、missing evidence 处理、version mismatch 行为和 redaction 边界。

## Builder Wiring Conclusion

future builder wiring 必须遵守以下顺序：

1. 先验证 `resolverMode`
2. 再验证 fixture registry lookup 结果
3. 再验证 version compatibility / consistency gate
4. 再验证 evidence completeness
5. 最后才允许构造 redacted read model

builder 不得把任意未通过 gate 的输入转换成“尽量输出一点”的半成品 payload。任一关键环节失败，都必须直接返回 blocked 结果。

## Allowed Builder Inputs

builder 未来只允许接收以下受控输入：

- 已通过 gate 的 fixture registry selection
- redacted manifest / bundle metadata
- 已固定 shape 的 evidence payload blocks
- explicit mode decision: `disabled` / `local_fixture` / `isolated_preprod_repository`
- explicit block code / missing evidence flags

builder 不允许直接接收：

- 未注册 raw fixture blobs
- 未经 gate 的 repository query 结果
- production / preprod DB 查询结果
- workflow / state mutation side effect
- provider live query 结果

## Wiring Order

### 1. Mode Gate First

builder 入口必须先读取 mode 决策：

- `disabled` 直接返回 blocked payload
- `local_fixture` 才允许继续 fixture lookup
- `isolated_preprod_repository` 只能在未来 resolver gate 满足时进入，当前仍然视为 blocked

若 mode 缺失、未知或与环境不符，必须返回：

- `builder_wiring_mode_blocked`

### 2. Fixture Selection Second

在 `local_fixture` 模式下，builder 只能消费已通过 registry contract 的 fixture selection：

- source key 必须明确
- scenario type 必须明确
- fixture id 必须明确
- localOnly 必须为 true

若 fixture selection 缺失、冲突或回退逻辑不透明，必须返回：

- `builder_wiring_fixture_selection_blocked`

### 3. Compatibility / Consistency Third

builder 组装前必须先确认：

- `manifestVersion`
- `bundleVersion`
- `evidenceShapeVersion`
- `consistencyRuleSetVersion`

都处于 allowlist 内，且 summary / references / timeline / decisionGuards / operatorHints 之间的锚点一致。若 version 或 cross-block consistency 任一项不满足，必须返回：

- `builder_wiring_version_blocked`
- `builder_wiring_consistency_blocked`

### 4. Evidence Completeness Fourth

builder 不允许自动忽略关键缺失证据。至少以下缺口必须显式 blocked：

- summary 缺失
- refund reference 缺失
- approval / audit / runtime attempt / terminal conflict 关键 reference 缺失
- decision guard 缺失
- operator hint 缺失

需要保留：

- `missingEvidenceFlags`
- 顶层 blocked reason
- redacted operator-visible notes

若 evidence 不完整，必须返回：

- `builder_wiring_missing_evidence`

### 5. Read Model Assembly Last

只有前四层全部通过后，builder 才允许输出稳定只读 review payload。输出仍然必须满足：

- 所有字段经过 redaction
- blocked / deny 默认优先于 allow
- timeline 稳定排序
- reference handle 不泄漏原始敏感键
- operator hint 只提供只读建议，不携带执行语义

## Blocked Payload Contract

future builder 必须能够在不暴露 runtime 细节的情况下输出统一 blocked payload：

- `caseStatus = blocked`
- `decisionGuards` 中所有 allow 字段显式为 `false`
- `operatorHints` 仅保留 manual review / retry later / rollback suggested 这类只读提示
- `summary` 中保留 reviewCaseId、scenarioType、blocked reason
- `references` / `timeline` 只返回安全可见的 redacted 信息

不允许返回：

- 空对象
- 部分成功但未标注 blocked 的 payload
- 把错误吞掉后伪装成正常 case

## Redaction Boundary

builder 层必须继续维持严格 redaction：

- 不透出原始数据库主键
- 不透出 provider event 原文
- 不透出 production / preprod 环境标识
- 不透出内部 command / workflow payload
- 不透出可被误用为执行入口的参数

若 builder 需要依赖未 redacted 字段才能工作，应视为 wiring 设计失败并继续 blocked。

## Non-Goals

本轮仍然不做：

- 不新增 fixture registry implementation
- 不新增 builder runtime wiring
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

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-builder-wiring-validation`，确认本轮 builder wiring 规划仍然保持 docs-only 边界；若验证通过，再继续拆 resolver runtime plan。
