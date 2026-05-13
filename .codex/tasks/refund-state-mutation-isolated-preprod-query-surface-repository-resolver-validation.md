# Refund State Mutation Isolated Preprod Query Surface Repository Resolver Validation

## 任务

在 repository resolver plan 完成后，做 docs-only validation 与 ledger 收口。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。

## 非目标

- 不新增 route。
- 不连接 production / preprod DB。
- 不写 repository implementation。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
