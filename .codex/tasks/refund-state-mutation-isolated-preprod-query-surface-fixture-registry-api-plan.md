# Refund State Mutation Isolated Preprod Query Surface Fixture Registry API Plan

## 任务

在 local fixture shape validation 之后，规划 fixture registry API、selector、lookup contract 和 local-only gate 边界。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 registry API、selector、lookup key、local-only gate、fail-closed 和 operator review 调用边界。

## 非目标

- 不新增 route。
- 不连接 production / preprod DB。
- 不写 fixture registry implementation。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
