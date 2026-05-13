# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Timeline Event Contract Plan

## 任务

在 reference slot contract validation 之后，规划 timeline event 的字段结构、排序键、timestamp redaction 和 event reference handle contract。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 timeline event 字段、排序语义、timestamp redaction、event reference handle 和 empty timeline contract。

## 非目标

- 不新增 timeline event implementation。
- 不新增 reference slot implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
