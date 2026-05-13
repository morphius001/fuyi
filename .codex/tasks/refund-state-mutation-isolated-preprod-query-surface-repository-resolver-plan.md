# Refund State Mutation Isolated Preprod Query Surface Repository Resolver Plan

## 任务

在 isolated preprod query surface validation 完成后，规划 query surface 未来如何安全接入 disabled / local fixture / isolated preprod repository resolver。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 resolver、fixture、environment gate、redaction、fail-closed 和 operator review 的边界。

## 非目标

- 不新增 route。
- 不连接 production / preprod DB。
- 不写 repository implementation。
- 不执行 workflow。
- 不写 refund success state。
- 不接真实 provider refund request / query。

## 验证

- `git diff --check`
- `git status --short --branch`
