# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Evidence Shape Contract Plan

## 任务

在 bundle metadata contract validation 之后，规划 review case evidence payload 的 shape、redaction boundary、reference slots 和 versioned shape contract。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 evidence payload 字段、reference slot、redaction boundary 和 versioned shape contract。

## 非目标

- 不新增 evidence shape implementation。
- 不新增 bundle metadata implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
