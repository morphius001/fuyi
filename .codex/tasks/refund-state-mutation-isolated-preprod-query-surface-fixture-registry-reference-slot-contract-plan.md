# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Reference Slot Contract Plan

## 任务

在 evidence shape contract validation 之后，规划 approval / audit / runtime attempt / terminal conflict / fixture source key 各 reference slot 的字段结构、presence 规则和 redacted handle contract。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 reference slot 字段、presence 规则、redacted handle、empty slot contract 和 cross-link 约束。

## 非目标

- 不新增 reference slot implementation。
- 不新增 evidence payload implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
