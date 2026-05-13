# Refund State Mutation Isolated Preprod Query Surface Local Fixture Shape Validation

## 任务

在 local fixture shape plan 完成后，做 docs-only validation 与 ledger 收口。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。

## 非目标

- 不新增 route。
- 不连接 production / preprod DB。
- 不写 fixture loader 或 registry implementation。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
