# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Cross Block Consistency Plan

## 任务

在 evidence payload readiness validation 之后，规划 `summary`、`references`、`timeline`、`decisionGuards`、`operatorHints` 之间的一致性键、引用方向和 fail-closed 约束。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 cross-block consistency key、reference direction、timestamp / scenarioType 对齐和 block code 对齐规则。
- 只允许记录 future builder / validation 应如何 fail-closed，而不是让消费方自行补洞。

## 非目标

- 不新增 payload implementation。
- 不新增 builder wiring。
- 不新增 repository resolver runtime。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
