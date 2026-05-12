# Refund State Mutation Approval Persistence Adapter Plan

更新时间：2026-05-13 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 approval persistence repository adapter 在 isolated preprod 中的读写边界、fail-closed 规则和回滚门槛，不实现 adapter、不连接 production DB、不执行 workflow、不写 production refund success state。

当前 approval persistence 已经有 schema plan、migration skeleton、repository contract 和 validation，但这些仍停留在 disabled / non-executable 层。下一步需要先把 adapter 边界写清楚，确保未来任何 isolated preprod 实现都只能服务于 rehearsal，不会误入 production。

## Adapter Scope

未来 adapter 只允许服务于 isolated preprod rehearsal，且只负责：

1. 读写 `china_refund_state_mutation_approval`
2. 追加 `china_refund_state_mutation_approval_event`
3. 按 `approval_idempotency_key` / `platform_refund_id` / `provider_refund_reference` 查询
4. 向 operator review / replay 提供只读 lookup

不允许：

- 直接调用 workflow execution
- 直接改变 refund success state
- 直接触发 settlement、commission、payout、permission、fulfillment、logistics side effect
- 直接读取或写入 production DB

## Required Preprod Isolation

adapter 落地前必须先明确：

- 连接串只指向 disposable / isolated preprod DB
- schema/version 与 production 明确分离
- provider / webhook / secret / merchant id 均为 sandbox 或 fake
- operator review surface 只能读取 preprod evidence
- replay / duplicate 流程不会把 preprod 数据误当成 production 证据

## Required Adapter Operations

未来 adapter 至少要有以下受限能力：

- `recordApprovalPersistence()`：只写 preprod approval row + append-only event
- `appendApprovalPersistenceEvent()`：只写 redacted event
- `getByApprovalIdempotencyKey()`：支持 replay lookup
- `getByPlatformRefundId()`：支持 operator review 聚合
- `getByProviderRefundReference()`：支持 provider 证据对齐

每个写操作都必须：

- 先确认环境 gate 为 isolated preprod
- 先确认 feature flag 仍为 disabled / dry-run / shadow
- 先确认 reviewer separation、permission evidence、ownership evidence 都已通过
- 写失败即 fail closed，不得降级到内存模拟继续执行

## Fail-Closed Rules

以下任一情况必须阻断 adapter write：

- 连接串无法证明是 isolated preprod
- approval idempotency key 缺失
- reviewer / request actor 未分离
- permission evidence 或 ownership evidence 缺失
- approval 已过期或已 rejected
- event append 失败
- duplicate replay 无法稳定返回 existing record
- metadata 未去敏

阻断时必须返回：

- operator-visible reason
- block code
- redacted audit event
- rollback not-required / rollback-required 标记

## Rollback Gate

approval persistence adapter 的 isolated preprod 演练前必须准备：

- disposable DB 清理步骤
- rollback owner
- rollback deadline
- approval row/event row 计数核对
- duplicate replay 校验
- event append-only 校验
- operator review lookup 校验

没有 rollback drill 清单，就不能进入任何 adapter implementation PR。

## Proposed Next PR Sequence

1. `refund-state-mutation-approval-persistence-adapter-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-audit-persistence-adapter-plan`：规划 audit persistence adapter 的 isolated preprod 边界。
3. `refund-state-mutation-runtime-attempt-persistence-adapter-plan`：规划 runtime attempt persistence adapter 的 isolated preprod 边界。
4. `refund-state-mutation-terminal-conflict-persistence-adapter-plan`：规划 terminal conflict persistence adapter 的 isolated preprod 边界。
5. `refund-state-mutation-approval-persistence-adapter-review`：汇总 approval adapter 与其余 adapter plan 的耦合点，再决定是否允许进入任何实现型 PR。

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
