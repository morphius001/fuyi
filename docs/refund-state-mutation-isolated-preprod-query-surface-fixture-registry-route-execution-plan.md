# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Route Execution Plan

更新时间：2026-05-14 Asia/Shanghai

## 目标

在 resolver runtime validation 之后，继续保持 docs-only / gate-first 节奏，规划 query surface route 的暴露边界。当前重点不是新增 route，而是先固定 disabled-by-default、operator-only 入口、blocked result、response envelope、cache / pagination 边界和 fail-closed 规则。

## Route Execution Conclusion

future route execution 必须遵守以下原则：

1. route 默认 disabled
2. route 只能暴露只读 review surface
3. route 只能返回 redacted result 或 blocked result
4. route 不得放大 resolver / builder 的未完成能力

## Exposure Boundary

route 层未来只能作为 review payload 的只读暴露面：

- 不允许写数据库
- 不允许执行 workflow
- 不允许触发 refund success state mutation
- 不允许发起 provider request / query
- 不允许把 route 变成 operator action endpoint

任何需要 mutation、acknowledge、approve、retry、rollback 的诉求，都必须继续 blocked 并留在 operator hint 层。

## Disabled By Default

route 必须默认保持 disabled：

- 未配置 feature flag 时 blocked
- 未通过 environment gate 时 blocked
- 未通过 resolver mode gate 时 blocked
- 未通过 redaction gate 时 blocked

blocked route 响应必须显式返回：

- route disabled reason
- safe blocked payload 或空数据占位协议
- 不可执行说明

不允许静默 200 且返回误导性的“空成功”。

## Operator-Only Query Surface

future route 即便开放，也只能是 operator-only review surface：

- 不面向消费者 storefront
- 不面向 merchant seller runtime
- 不作为 public API
- 不混入 payment / refund mutation 链路

如果无法明确 operator-only 边界，应继续 blocked。

## Response Envelope

route 返回必须维持稳定 envelope：

- `status`
- `reviewCaseId`
- `mode`
- `blockedReason` 或 `data`
- redacted `summary / references / timeline / decisionGuards / operatorHints`

不允许：

- 裸 payload
- 模式不明确的半结构化 JSON
- 把内部错误直接透传给调用方

## Cache / Pagination Boundary

当前阶段只允许规划，不允许落实现，但必须先写清：

- blocked result 是否允许缓存
- review case payload 是否允许分页 timeline
- cache key 是否受 mode / scenario / version 影响
- cache 失效是否必须回退到 blocked

若 cache / pagination 设计会导致混用不同 mode 或不同 version 的 payload，应继续 blocked。

## Block Codes

建议统一以下 route execution block code：

- `route_execution_disabled`
- `route_execution_environment_blocked`
- `route_execution_mode_blocked`
- `route_execution_redaction_blocked`
- `route_execution_operator_scope_blocked`
- `route_execution_response_envelope_blocked`
- `route_execution_cache_boundary_blocked`

## Non-Goals

本轮仍然不做：

- 不新增 route 实现
- 不新增 fixture registry implementation
- 不新增 builder runtime wiring
- 不新增 resolver runtime 实现
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

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-route-execution-validation`，确认本轮 route execution 规划仍然保持 docs-only 边界；若验证通过，再决定是否继续拆 implementation review 或 launch-readiness review。
