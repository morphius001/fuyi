# Refund State Mutation Isolated Preprod Query Surface Repository Resolver Plan

更新时间：2026-05-14 Asia/Shanghai

## 结论

当前 query surface builder 已经存在，但后续如果要进入 resolver / fixture / isolated preprod repository wiring，必须先固定 resolver 边界。

本计划只定义 query surface 在 `disabled`、`local_fixture`、`isolated_preprod_repository` 三种来源之间如何安全切换，保持 redacted / fail-closed，不实现 route、不连接 production DB、不写 repository implementation、不执行 workflow、不写 refund success state。

## Why Resolver Planning Is Required

query surface builder 目前只消费内存中的 records / events。后续若直接跳到 repository wiring，会出现几个风险：

- local fixture 与未来 isolated preprod repository 的优先级可能漂移
- environment gate 可能被绕过，导致非 isolated preprod 也能误读 review case
- fixture 数据可能被误当成 runtime truth
- redaction、cross-reference 和 fail-closed 规则可能在 resolver 层失守
- operator review 入口和 future route 之间的职责可能混淆

所以在任何 resolver implementation 前，必须先把 source mode、resolver contract 和 gate 固定下来。

## Planned Resolver Modes

未来 query surface resolver 只允许三种模式：

1. `disabled`
   - 默认模式
   - 所有查询直接返回 blocked / unavailable
   - 只允许输出 safe reason，不返回伪 review case

2. `local_fixture`
   - 仅限本地开发 / focused tests / rehearsal fixture
   - 只读取 repo 内 fixture 或内存 fixture
   - 必须明确标记 `fixture_backed=true`
   - 不允许把 fixture source 冒充 isolated preprod evidence

3. `isolated_preprod_repository`
   - 仅限未来 isolated preprod 且环境证明齐全时
   - 只允许读取 redacted persistence records / events
   - 必须通过 environment gate、repository readiness gate、redaction gate 和 fail-closed gate

不允许：

- `production_repository`
- `mixed_runtime`
- `provider_live_query`
- `shadow_execute`
- 任何会触发 workflow / state mutation 的 resolver mode

## Resolver Precedence

未来 resolver 必须固定以下优先级：

1. 环境不满足时 -> `disabled`
2. 明确请求 fixture mode 时 -> `local_fixture`
3. 只有 isolated preprod 证明齐全、repository readiness 齐全时 -> `isolated_preprod_repository`

不允许自动从 `disabled` 回退到 `fixture`
不允许自动从 `fixture` 升级到 `isolated_preprod_repository`
不允许在同一查询里混合多个 source mode 的半成品数据

## Environment Gate Requirements

进入 `isolated_preprod_repository` 之前，至少必须证明：

- 当前环境不是 production
- 当前环境不是普通 local dev 假装的 preprod
- isolated preprod evidence key 可验证
- query surface implementation gate 已通过
- rollback drill 仍然保持 No-Go 之外的只读边界

如果任一条件缺失，resolver 必须回到 `disabled`，而不是尝试 best-effort 查询。

## Local Fixture Rules

`local_fixture` 模式必须满足：

- fixture 文件或内存 seed 必须明确标记为 local-only
- fixture 只允许覆盖 approval / audit / runtime attempt / terminal conflict 的 redacted shapes
- fixture 中仍然必须满足 cross-reference 完整性
- fixture 缺字段时，也必须返回 incomplete / blocked case
- fixture 不允许包含 raw provider payload、provider request/query、secret、DB URL、PII

fixture mode 的目标只是：

1. focused tests
2. operator review UI 预演
3. local smoke

不允许作为：

- 真正 preprod evidence
- production fallback
- 自动放行条件

## Repository Resolver Contract

未来 resolver contract 至少应包含：

- `environment`
- `sourceMode`
- `isIsolatedPreprodVerified`
- `fixtureSourceKey?`
- `repositoryReadiness`
- `redactionReadiness`
- `crossReferenceReplayReady`
- `query(input)`

其中 `query(input)` 只允许接受只读 key：

- `platform_refund_id`
- `approval_persistence_idempotency_key`
- `runtime_attempt_persistence_idempotency_key`
- `terminal_conflict_persistence_idempotency_key`
- `provider_refund_reference`

不允许接受：

- raw provider payload
- provider request body
- workflow command
- success override
- terminal lock override
- production DB handle

## Fail-Closed Rules

resolver 层新增的 fail-closed 触发器至少包括：

- source mode 不在 allowlist
- environment proof 缺失
- fixture source 未标记 local-only
- repository readiness 不完整
- redaction gate 失败
- cross-reference replay 失败
- 同一 review case 被多个 source mode 混合构建

阻断时只允许返回：

- blocked / incomplete label
- block code
- safe reason
- missing evidence indicator

## Recommended Next Steps

下一步建议仍保持 docs-only：

1. `refund-state-mutation-isolated-preprod-query-surface-repository-resolver-validation`
2. 如验证通过，再考虑 local fixture shape / fixture registry plan
3. 在 resolver validation 和 fixture contract 都齐前，不进入 repository resolver implementation

## Verification Plan

本计划 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

复核重点：

- 本轮只改 docs / task / queue / ledger
- 未修改 `packages/api/**` runtime
- 未新增 route、repository implementation、DB、workflow、provider request/query、refund success state mutation
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics
