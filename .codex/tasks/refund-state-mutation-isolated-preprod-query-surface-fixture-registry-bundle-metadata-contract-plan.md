# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Bundle Metadata Contract Plan

## 任务

在 manifest contract validation 之后，规划 fixture bundle metadata schema、redaction markers、local-only markers 和 bundle-to-manifest version 协同规则。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 bundle metadata 字段、redaction / local-only markers、bundle version 和 manifest 协同合同。

## 非目标

- 不新增 bundle metadata implementation。
- 不新增 manifest implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
