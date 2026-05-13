# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Local Loader Validation

## 任务

在 local loader plan 之后，验证 local fixture loader plan 仍然保持 docs-only，没有混入 loader implementation、registry wiring、route、repository resolver implementation 或 runtime wiring。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许记录 local loader plan 的文件范围、No-Go 边界和下一步 validation 结论。

## 非目标

- 不新增 local fixture loader implementation。
- 不新增 fixture registry implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
