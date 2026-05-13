# Refund State Mutation Isolated Preprod Rollback Drill Plan

更新时间：2026-05-13 Asia/Shanghai

## 结论

当前真实生产退款成功状态写入仍是 No-Go。本计划只规划 isolated preprod refund state mutation rehearsal 的 rollback drill、operator checklist、evidence capture、kill-switch 回退步骤和失败升级路径，不执行 rehearsal、不连接 production DB、不执行 workflow、不写 production refund success state。

## Why Rollback Drill Must Be Planned First

即使四段 adapter plan、统一 implementation gate 和 query surface 都已经写清，如果 rollback drill 仍未定义，后续任何 isolated preprod implementation 仍然是不完整的，因为：

- operator 无法确认失败后先关什么、回退什么、由谁签字
- 证据链可能在回退前后丢失
- kill switch 触发顺序不一致会让 duplicate / replay 判断失真
- 失败升级路径不清会把 isolated preprod 演练拖成半执行状态

所以在任何 implementation PR 或 rehearsal 之前，必须先把 rollback drill 写清楚。

## Required Rollback Owners

rollback drill 至少要明确以下责任人角色：

1. rollback owner
2. operator reviewer
3. evidence recorder
4. kill-switch executor
5. escalation approver

每个角色都必须有明确交接顺序；任何一个角色缺位时，rehearsal 必须 fail-closed，不得继续。

## Required Rollback Sequence

未来 isolated preprod rehearsal 进入 rollback 时，至少要按以下顺序执行：

1. 触发 global kill switch，阻断任何新的 adapter write path
2. 记录触发时间、触发人、触发原因和 feature flag snapshot
3. 冻结当前 review case 查询输出，只允许 evidence read-only
4. 核对 approval / audit / runtime attempt / terminal conflict 当前 row / event count
5. 执行 disposable DB 清理或回退脚本
6. 重新读取 query surface，确认 incomplete / blocked 状态符合预期
7. 由 rollback owner 和 operator reviewer 完成签字

任一步骤失败，都必须升级，不得默默跳到下一步。

## Required Evidence Capture

rollback drill 至少要捕获以下证据：

- feature flag snapshot key
- platform refund id
- approval / audit / runtime attempt / terminal conflict 的 redacted summary
- row / event count before rollback
- row / event count after rollback
- duplicate / replay outcome before rollback
- duplicate / replay outcome after rollback
- kill-switch trigger timestamp / actor
- rollback complete timestamp / actor

这些证据必须默认 redacted，不得包含 raw provider body、secret、certificate、merchant key、DB URL 或完整 PII。

## Required Operator Checklist

operator checklist 至少要覆盖：

1. 环境已确认为 isolated preprod
2. global kill switch 可用
3. current case query surface 可读
4. disposable DB 清理路径已确认
5. escalation approver 在线
6. rollback owner 在线
7. evidence recorder 在线
8. duplicate / replay / blocked / manual review 的预期结果已记录

任一项不满足时，rehearsal 必须取消，不得带条件推进。

## Required Escalation Rules

以下情况必须立刻升级并中止：

- kill switch 无法生效
- query surface 无法读回当前 redacted evidence
- row / event count 无法核对
- duplicate / replay 结果不稳定
- rollback 后仍残留未解释的 evidence mismatch
- operator-visible reason 无法生成

升级后必须返回：

- escalation code
- blocked label
- safe reason
- next human action

## Recommended Next Steps

下一步建议仍保持 docs-only / contract-first：

1. `refund-state-mutation-isolated-preprod-rollback-drill-validation`
2. `refund-state-mutation-launch-readiness-review`
3. 如果 launch readiness 仍是 No-Go，则停止任何“8 小时内上线”的误判，不进入 implementation PR

在 rollback drill 和 launch readiness 明确放行前，不应进入任何 isolated preprod implementation PR。

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
