# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Manifest Contract Plan

## 任务

在 local loader validation 之后，规划 fixture manifest entry schema、scenario default contract、versioning 和 cross-reference 校验规则。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 manifest entry、default map、version 字段、redaction / local-only gate 和 cross-reference 校验合同。

## 非目标

- 不新增 manifest implementation。
- 不新增 local fixture loader implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
