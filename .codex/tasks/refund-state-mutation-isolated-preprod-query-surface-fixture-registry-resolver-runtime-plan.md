# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Resolver Runtime Plan

## 任务

在 builder wiring validation 之后，规划 fixture registry query surface resolver 的 runtime 边界，明确 `disabled`、`local_fixture`、`isolated_preprod_repository` 三种模式下的 fail-closed 规则、environment gate、query boundary、redacted result 和 blocked 响应。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 resolver runtime 的模式切换、query source、blocked 响应和环境门禁边界。

## 非目标

- 不新增 fixture registry implementation。
- 不新增 builder runtime wiring。
- 不新增 repository resolver runtime 实现。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
