# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Timeline Event Contract Validation

## 验证对象

- PR `#520`
- 任务：`refund-state-mutation-isolated-preprod-query-surface-fixture-registry-timeline-event-contract-plan`
- 分支：`china/pr-tc-refund-state-mutation-isolated-preprod-query-surface-fixture-registry-timeline-event-contract-plan`

## 验证结论

本轮 timeline event contract plan 仍然保持 docs-only 边界，未混入 timeline implementation、evidence payload implementation、builder wiring、route、repository resolver implementation 或 runtime wiring。

## 文件范围检查

PR `#520` 只包含以下范围：

- `docs/refund-state-mutation-isolated-preprod-query-surface-fixture-registry-timeline-event-contract-plan.md`
- `.codex/tasks/refund-state-mutation-isolated-preprod-query-surface-fixture-registry-timeline-event-contract-validation.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

未包含：

- `packages/api/src/**` runtime 源码
- `apps/**`
- route / workflow / subscriber / job
- production / preprod DB wiring
- refund success state mutation

## 边界确认

本轮只新增和收口了以下 docs-only 结论：

1. `timeline` 必须显式存在，且为稳定的只读 event 数组，不允许缺省整个区块
2. 每个 event 至少要声明 `eventType`、`eventStatus`、`eventTimestamp`、`sortKey`、`eventReference`、`redacted`
3. timeline 的排序必须依赖显式 `sortKey` 与受控 tie-break 规则，不能依赖数组原始顺序
4. `eventTimestamp` 必须 redacted / normalized，`eventReference` 必须是 redacted handle，不能暴露 raw payload

以上都仍然是规划，不是实现。

## 验证步骤

1. `git diff --check`
2. `git status --short --branch`
3. PR 文件范围人工复核，确认只涉及 docs / queue / ledger / task

## 验证结果

- `git diff --check`：通过
- `git status --short --branch`：通过；唯一持续存在的无关脏改动是 `packages/api/.mercur/index.d.ts`，未被 stage，未进入 PR `#520`
- 文件范围复核：通过；PR `#520` 未混入 runtime / DB / workflow / refund success state 改动

## 风险与结论

- 当前仍然没有 timeline implementation、evidence payload implementation、builder wiring、repository resolver implementation 或 runtime wiring。
- 当前仍不连接 production / preprod DB，不执行 workflow，不写 refund success state。
- 结论继续保持 No-Go：此链路仍不能被视为可执行 runtime，只能继续以 docs-only / isolated preprod query surface planning 方式推进。

## 下一步建议

进入 `refund-state-mutation-isolated-preprod-query-surface-fixture-registry-decision-guard-contract-plan`，单独规划 `decisionGuards` 区块里的 allow/deny 字段、block code 聚合、missing evidence flags 和 fail-closed 默认值。
