# Refund State Mutation Terminal Conflict Persistence Adapter Plan

更新时间：2026-05-13 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 terminal conflict persistence repository adapter 在 isolated preprod 中的写入边界、查询边界、fail-closed 规则和回滚门槛，不实现 adapter、不连接 production DB、不执行 workflow、不写 production refund success state。

当前 terminal conflict persistence 已经有 repository plan、contract 和 validation，但这些仍停留在 disabled / non-executable 层。下一步需要先把 isolated preprod adapter 的行为边界写清楚，确保未来任何实现只承担 terminal marker / conflict snapshot 记录与只读查询，不会越界变成 workflow execution、terminal lock 生效或退款状态写入的旁路。

## Adapter Scope

未来 adapter 只允许服务于 isolated preprod rehearsal，且只负责：

1. 写入 terminal conflict persistence snapshot 主记录
2. 追加 append-only terminal conflict persistence event
3. 按 `terminal_conflict_persistence_idempotency_key` 查询
4. 按 `terminal_marker_key`、`platform_refund_id`、`approval_persistence_idempotency_key` 提供只读 lookup
5. 为 operator review / replay 提供 redacted terminal conflict evidence view

不允许：

- 直接调用 workflow execution
- 直接改变 refund success state
- 直接让 terminal lock 或 terminal marker 在 production 生效
- 直接触发 settlement、commission、payout、permission、fulfillment、logistics side effect
- 直接读取或写入 production DB

## Required Preprod Isolation

adapter 落地前必须先明确：

- 连接串只指向 disposable / isolated preprod DB
- terminal conflict persistence schema/version 与 production 明确分离
- workflow / job / subscriber / route runtime 默认不接入 production actor
- provider、webhook、secret、merchant id、cert 均为 sandbox / fake
- operator review 只读取 preprod terminal conflict evidence
- duplicate / replay / blocked 结果不会被 production actor 当作正式结论

## Required Adapter Operations

未来 adapter 至少要有以下受限能力：

- `recordTerminalConflictPersistence()`：只写 preprod terminal conflict snapshot row
- `appendTerminalConflictPersistenceEvent()`：只写 redacted append-only event
- `getByTerminalConflictPersistenceIdempotencyKey()`：支持 duplicate / replay lookup
- `getByTerminalMarkerKey()`：支持 terminal marker evidence 反查
- `getByPlatformRefundId()` 或等效聚合：支持 operator review 对账
- `getByApprovalPersistenceIdempotencyKey()`：支持 approval 链路交叉定位

每个写操作都必须：

- 先确认环境 gate 为 isolated preprod
- 先确认 feature flag 仍为 disabled / dry-run / shadow
- 先确认 approval、audit、runtime attempt 引用完整
- 先确认 terminal marker 仍是 rehearsal-only，不会进入 production lock path
- event append 失败即 fail closed
- metadata 未去敏即 fail closed

## Query And Snapshot Rules

adapter 查询输出必须默认 redacted，只允许暴露：

- idempotency keys
- terminal marker key
- conflict class / conflict reason code
- block codes
- feature flag snapshot key
- approval / audit / runtime attempt 交叉引用
- operator review 所需的安全 actor 标识

禁止暴露：

- raw provider payload
- provider request / query payload
- secret、certificate、merchant key、DB URL
- 完整手机号、地址、身份证、银行卡
- executable workflow handle
- production terminal lock override 字段

## Fail-Closed Rules

以下任一情况必须阻断 adapter write：

- 连接串无法证明是 isolated preprod
- terminal conflict persistence idempotency key 缺失
- terminal marker key 缺失
- approval / audit / runtime attempt 引用缺失
- terminal marker 无法证明仍是 rehearsal-only
- event append 失败
- duplicate replay 无法稳定返回 existing row
- redaction 失败
- query surface 需要依赖 production evidence 才能补齐

阻断时必须返回：

- operator-visible reason
- block code
- redacted terminal conflict event
- rollback not-required / rollback-required 标记

## Rollback Gate

terminal conflict persistence adapter 的 isolated preprod 演练前必须准备：

- disposable DB 清理步骤
- rollback owner
- rollback deadline
- terminal conflict snapshot / event row 计数核对
- duplicate replay 校验
- terminal marker uniqueness 校验
- redaction spot check
- operator review lookup 校验

没有 rollback drill 清单，就不能进入任何 adapter implementation PR。

## Proposed Next PR Sequence

1. `refund-state-mutation-terminal-conflict-persistence-adapter-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-persistence-adapter-readiness-review`：汇总 approval / audit / runtime attempt / terminal conflict adapter plan 的耦合点，重新给出是否允许进入任何 isolated preprod implementation PR 的结论。
3. 如 readiness 仍为 No-Go，则继续只做 docs-only gap close，不进入实现型 PR。

## Verification Plan

本计划 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

本计划 PR 已验证：

```text
git diff --check passed
No apps/** or packages/** runtime diff
```

复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 未新增 route、job、subscriber、migration、DB、SDK、provider request / query、workflow execution、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
