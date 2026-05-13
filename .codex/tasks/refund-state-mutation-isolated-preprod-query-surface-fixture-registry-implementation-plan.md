# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Implementation Plan

## 任务

在 fixture registry API validation 之后，规划 fixture registry implementation 的模块边界、loader 位置、typed selector 和 fail-closed adapter。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 implementation module、loader path、typed selector、adapter edge 和 fail-closed gate。

## 非目标

- 不新增 route。
- 不连接 production / preprod DB。
- 不写 fixture registry implementation。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
