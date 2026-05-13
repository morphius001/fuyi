# Refund State Mutation Isolated Preprod Adapter Implementation Gate Plan

更新时间：2026-05-13 Asia/Shanghai

## 结论

当前真实生产退款成功状态写入仍是 No-Go。本计划只规划 approval / audit / runtime attempt / terminal conflict 四段 persistence adapter 在进入任何 isolated preprod implementation PR 前必须满足的统一环境 gate、operator gate、rollback gate、kill switch 和 fail-closed 前置条件，不实现 adapter、不连接 production DB、不执行 workflow、不写 production refund success state。

## Why A Unified Gate Is Needed

虽然四段 adapter plan 已分别写清了各自边界，但如果没有统一 implementation gate，后续很容易出现：

- 某一段 adapter 先行实现，绕过整体 No-Go 结论
- isolated preprod 环境定义不一致
- operator review、rollback drill、kill switch 标准不统一
- terminal conflict / runtime attempt / approval / audit 之间的交叉引用缺口在实现阶段才暴露

所以在任何 implementation PR 之前，必须先把统一 gate 写清楚。

## Required Environment Gate

任何 isolated preprod implementation PR 落地前，必须先满足：

1. 连接串只能指向 disposable / isolated preprod DB
2. schema / migration 注册范围与 production 明确隔离
3. provider、webhook、secret、merchant id、cert 必须全部为 sandbox / fake
4. workflow / job / subscriber / route runtime 默认不能被 production actor 触发
5. feature flag 必须默认为 `disabled` 或更严格的 non-executable mode
6. global kill switch 必须能在不改代码的前提下立刻关闭所有 adapter write path

任一条件不满足，就不能进入 implementation PR。

## Required Operator Gate

进入 implementation PR 前，必须先证明：

1. operator owner 已指定
2. reviewer separation 方案已明确
3. operator review 所需 evidence 字段全集已定义
4. blocked / duplicate / replay / manual review 的 operator-visible reason 和 block code 已统一
5. approval、audit、runtime attempt、terminal conflict 四段 evidence 的交叉引用键已固定

如果 operator 侧还无法读懂、追溯或阻断这条链路，就不能进入 implementation。

## Required Rollback Gate

进入 implementation PR 前，必须先准备：

1. disposable DB 清理步骤
2. rollback owner
3. rollback deadline / escalation path
4. row / event count 校验清单
5. duplicate replay 校验清单
6. redaction spot check 清单
7. kill switch 触发后的回退步骤

没有 rollback drill 计划，就不能进入 implementation。

## Required Fail-Closed Contract

所有后续 implementation PR 必须承诺以下统一 fail-closed 行为：

- 环境无法证明是 isolated preprod 时，直接阻断
- feature flag 非 disabled / dry-run / shadow-safe mode 时，直接阻断
- approval / audit / runtime attempt / terminal conflict 任一交叉引用缺失时，直接阻断
- metadata 无法 redaction 时，直接阻断
- duplicate replay 无法稳定返回 existing record 时，直接阻断
- operator-visible reason / block code 无法生成时，直接阻断

阻断不得降级为内存模拟、静默跳过或默认成功。

## Required Evidence Before Any Implementation PR

在开始第一个 implementation PR 之前，至少还需要先补齐两类 docs-only 输入：

1. `refund-state-mutation-isolated-preprod-query-surface-plan`
2. 如 query surface 仍不足，再补一个单独的 rollback drill / operator checklist docs-only 计划

如果 query surface 还没写清，就不应该开始实现任何 adapter。

## Recommended Next Steps

下一步建议仍保持 docs-only / contract-first：

1. `refund-state-mutation-isolated-preprod-adapter-implementation-gate-validation`
2. `refund-state-mutation-isolated-preprod-query-surface-plan`
3. `refund-state-mutation-isolated-preprod-query-surface-validation`
4. 视缺口再决定是否需要单独的 rollback drill plan

在这些前置 docs 没完成前，不应进入任何 isolated preprod implementation PR。

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
