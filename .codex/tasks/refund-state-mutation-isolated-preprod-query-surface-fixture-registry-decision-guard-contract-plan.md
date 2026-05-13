# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Decision Guard Contract Plan

## 任务

在 timeline event contract validation 之后，规划 `decisionGuards` 区块里的 allow/deny 字段、block code 聚合、missing evidence flags 和 fail-closed 默认值。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 decision guard 字段、allow/deny 语义、block code 聚合、missing evidence flag 和 default fail-closed contract。

## 非目标

- 不新增 decision guard implementation。
- 不新增 timeline implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
