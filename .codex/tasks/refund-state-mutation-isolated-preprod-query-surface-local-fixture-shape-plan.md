# Refund State Mutation Isolated Preprod Query Surface Local Fixture Shape Plan

## 任务

在 repository resolver validation 之后，规划 query surface local fixture 的数据形状、fixture registry 和 local-only 标记边界。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 fixture shape、registry、fixture source key、local-only 标记、redaction 和 fail-closed 边界。

## 非目标

- 不新增 route。
- 不连接 production / preprod DB。
- 不写 fixture loader 或 repository implementation。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
