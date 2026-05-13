# Refund State Mutation Audit Persistence Adapter Plan

更新时间：2026-05-13 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 audit persistence repository adapter 在 isolated preprod 中的写入边界、查询边界、fail-closed 规则和回滚门槛，不实现 adapter、不连接 production DB、不执行 workflow、不写 production refund success state。

当前 audit persistence 已经有 repository contract 和 validation，但仍停留在 disabled / non-executable 层。下一步必须先把 isolated preprod adapter 的行为边界写清楚，保证未来任何实现都只是 rehearsal 证据链的一部分，而不是执行链路的捷径。

## Adapter Scope

未来 adapter 只允许服务于 isolated preprod rehearsal，且只负责：

1. 写入 append-only audit persistence 主记录
2. 追加 append-only audit persistence event
3. 按 `audit_persistence_idempotency_key` 查询
4. 按 `approval_persistence_idempotency_key`、`platform_refund_id`、`provider_refund_reference` 提供只读 lookup
5. 为 operator review / replay 提供 redacted evidence view

不允许：

- 直接调用 workflow execution
- 直接改变 refund success state
- 直接删除、覆盖或重写既有 audit evidence
- 直接触发 settlement、commission、payout、permission、fulfillment、logistics side effect
- 直接读取或写入 production DB

## Required Preprod Isolation

adapter 落地前必须先明确：

- 连接串只指向 disposable / isolated preprod DB
- audit persistence schema/version 与 production 明确分离
- operator review 只读取 preprod audit evidence
- provider、webhook、secret、merchant id、cert 均为 sandbox / fake
- replay / duplicate 结果不会被 production actor 当作正式结论

## Required Adapter Operations

未来 adapter 至少要有以下受限能力：

- `recordAuditPersistence()`：只写 preprod audit row
- `appendAuditPersistenceEvent()`：只写 redacted append-only event
- `getByAuditPersistenceIdempotencyKey()`：支持 duplicate / replay lookup
- `getByApprovalPersistenceIdempotencyKey()`：支持 approval 链路反查
- `getByPlatformRefundId()` 或等效聚合：支持 operator review 对账

每个写操作都必须：

- 先确认环境 gate 为 isolated preprod
- 先确认 feature flag 仍为 disabled / dry-run / shadow
- 先确认 approval / permission / ownership / terminal conflict 引用完整
- event append 失败即 fail closed
- metadata 未去敏即 fail closed

## Query And Redaction Rules

adapter 查询输出必须默认 redacted，只允许暴露：

- idempotency keys
- block codes
- audit action
- target state audit label
- feature flag snapshot key
- approval / runtime attempt / terminal conflict 交叉引用
- reviewer / actor reference 的安全标识

禁止暴露：

- raw provider payload
- provider request / query payload
- secret、certificate、merchant key、DB URL
- 完整手机号、地址、身份证、银行卡
- executable / workflow / success safety override 字段

## Fail-Closed Rules

以下任一情况必须阻断 adapter write：

- 连接串无法证明是 isolated preprod
- audit persistence idempotency key 缺失
- approval / permission / ownership / terminal conflict 引用缺失
- event append 失败
- duplicate replay 无法稳定返回 existing row
- redaction 失败
- query surface 需要依赖 production evidence 才能补齐

阻断时必须返回：

- operator-visible reason
- block code
- redacted audit event
- rollback not-required / rollback-required 标记

## Rollback Gate

audit persistence adapter 的 isolated preprod 演练前必须准备：

- disposable DB 清理步骤
- rollback owner
- rollback deadline
- audit row / event row 计数核对
- duplicate replay 校验
- append-only 校验
- redaction spot check
- operator review lookup 校验

没有 rollback drill 清单，就不能进入任何 adapter implementation PR。

## Proposed Next PR Sequence

1. `refund-state-mutation-audit-persistence-adapter-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-runtime-attempt-persistence-adapter-plan`：规划 runtime attempt persistence adapter 的 isolated preprod 边界。
3. `refund-state-mutation-terminal-conflict-persistence-adapter-plan`：规划 terminal conflict persistence adapter 的 isolated preprod 边界。
4. `refund-state-mutation-audit-persistence-adapter-review`：汇总 audit adapter 与 approval / runtime attempt / terminal conflict adapter 的耦合点，再决定是否允许进入任何实现型 PR。

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
