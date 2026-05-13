# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Local Loader Plan

## 任务

在 fixture registry implementation validation 之后，规划 local fixture loader 的 manifest、目录结构、导出 contract、fail-closed 读取边界和 future registry wiring。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 local fixture loader 的文件组织、manifest shape、registry export contract 和 local-only gate。

## 非目标

- 不新增 fixture loader implementation。
- 不新增 registry implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
