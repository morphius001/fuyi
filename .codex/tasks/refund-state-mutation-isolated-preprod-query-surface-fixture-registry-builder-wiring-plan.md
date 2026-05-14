# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Builder Wiring Plan

## 任务

在 implementation gate validation 之后，规划 fixture registry 如何 fail-closed 地接入 query surface builder，明确 builder 输入来源、blocked payload 输出、missing evidence 处理、version mismatch 行为和 redaction 边界。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 fixture registry 到 builder 层的只读 wiring 边界、fallback 规则和 fail-closed 输出。

## 非目标

- 不新增 fixture registry implementation。
- 不新增 builder runtime wiring。
- 不新增 repository resolver runtime。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
