# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Operator Hint Contract Plan

## 任务

在 decision guard contract validation 之后，规划 `operatorHints` 区块里的 recommended action、manual review、rollback hint 和 note 字段合同。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 operator hint 字段、只读提示语义、manual review / rollback hint 和 note 结构。

## 非目标

- 不新增 operator hint implementation。
- 不新增 decision guard implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
