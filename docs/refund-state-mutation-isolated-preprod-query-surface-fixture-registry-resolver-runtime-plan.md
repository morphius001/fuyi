# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Resolver Runtime Plan

更新时间：2026-05-14 Asia/Shanghai

## 目标

在 builder wiring validation 之后，继续保持 docs-only / gate-first 节奏，规划 fixture registry query surface resolver 的 runtime 边界。当前重点不是落 resolver 实现，而是先固定 `disabled`、`local_fixture`、`isolated_preprod_repository` 三种模式下的 fail-closed 行为、environment gate、query boundary、redacted result 和 blocked 响应。

## Resolver Runtime Conclusion

future resolver runtime 必须遵守以下总原则：

1. 默认模式始终是 `disabled`
2. 任意 mode 提升都必须显式配置，不能隐式回退或自动升级
3. 未满足环境门禁时，resolver 只能返回 blocked result
4. resolver 只负责安全读取与 redacted 聚合，不得触发 workflow 或状态变更

## Runtime Modes

### 1. `disabled`

这是默认模式，也是所有异常场景的最终回退点。

resolver 在以下任一情形下都必须回落到 `disabled`：

- mode 未配置
- mode 值未知
- 环境不匹配
- fixture / repository source 未通过 gate
- version / consistency 校验失败

在 `disabled` 下必须返回：

- 显式 blocked result
- `caseStatus = blocked`
- redacted blocked reason
- deny-first `decisionGuards`
- 只读 `operatorHints`

不允许返回空对象、静默失败或伪装成正常 review case。

### 2. `local_fixture`

这是当前唯一允许继续规划的准执行模式，但仍然只允许依赖受控静态 fixture：

- source key 必须来自 fixture registry
- fixture id / scenario type 必须明确
- `localOnly` 必须为 true
- 不允许动态拼接未注册 fixture 路径

resolver 在 `local_fixture` 下仍然必须先经过：

- mode gate
- fixture registry selection gate
- version compatibility gate
- cross-block consistency gate
- evidence completeness gate

任何一步失败都必须返回 blocked result，而不是回退为“部分可见数据”。

### 3. `isolated_preprod_repository`

这是未来模式，当前只能规划边界，不能落实现。

若未来进入该模式，必须先满足：

- isolated preprod environment gate
- repository readiness gate
- query boundary gate
- rollback gate
- operator sign-off gate

并明确：

- 不连接 production DB
- 不混读 production / preprod / local fixture 数据
- 不绕过 builder fail-closed 规则
- 不把 repository query 直接暴露为 route output

在这些前置条件未满足前，`isolated_preprod_repository` 仍应被 resolver 视为 blocked。

## Environment Gate

resolver runtime 必须先验证执行环境，再决定是否允许进入具体 mode：

- `disabled` 可在任意环境存在
- `local_fixture` 只允许 local / disposable / explicitly flagged 环境
- `isolated_preprod_repository` 只允许 isolated preprod 且必须有额外 gate

不允许：

- 在 production 中启用 `local_fixture`
- 在未隔离的 preprod 中启用 `isolated_preprod_repository`
- 通过缺省环境变量自动提升 mode

环境不符合时，必须返回：

- `resolver_runtime_environment_blocked`

## Query Boundary

resolver runtime 未来只允许做只读查询和 redacted 聚合：

- 不允许写数据库
- 不允许执行 workflow
- 不允许触发 refund success state mutation
- 不允许发起 provider request / query
- 不允许触发 settlement、commission、payout、permission、fulfillment、logistics mutation

同时必须明确 source boundary：

- `local_fixture` 只能读 fixture registry
- `isolated_preprod_repository` 只能读 isolated preprod repository adapter
- 不允许同一 review case 混合多种 source mode 数据

source boundary 不明确时，必须返回：

- `resolver_runtime_query_boundary_blocked`

## Redacted Result Contract

resolver 无论在哪种模式下输出，都必须返回 redacted result：

- 不透出原始数据库主键
- 不透出 provider event 原文
- 不透出内部 command / workflow payload
- 不透出 production / preprod 环境标识
- 不透出任何可被误用为执行入口的参数

当 resolver 进入 blocked path 时，仍然必须维持统一结果形状：

- `summary`
- `references`
- `timeline`
- `decisionGuards`
- `operatorHints`

都应保持结构稳定，只是值转入 redacted / blocked 状态。

## Blocked Runtime Reasons

建议统一以下 resolver runtime block code：

- `resolver_runtime_mode_blocked`
- `resolver_runtime_environment_blocked`
- `resolver_runtime_source_gate_blocked`
- `resolver_runtime_version_blocked`
- `resolver_runtime_consistency_blocked`
- `resolver_runtime_missing_evidence`
- `resolver_runtime_query_boundary_blocked`
- `resolver_runtime_redaction_boundary_blocked`

## Non-Goals

本轮仍然不做：

- 不新增 fixture registry implementation
- 不新增 builder runtime wiring
- 不新增 resolver runtime 实现
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

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-resolver-runtime-validation`，确认本轮 resolver runtime 规划仍然保持 docs-only 边界；若验证通过，再继续拆 route execution plan。
