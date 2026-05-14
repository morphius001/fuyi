# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Payload Compatibility Plan

## 任务

在 cross block consistency validation 之后，规划 bundle metadata version、evidence shape version、cross block consistency 规则在 future payload 演进中的兼容和 fail-closed 策略。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 payload compatibility matrix、version gate、deprecation 方式和 forward / backward compatibility block code。
- 只允许记录 unsupported version、partial upgrade、mixed fixture bundle 的 fail-closed 策略。

## 非目标

- 不新增 payload implementation。
- 不新增 builder wiring。
- 不新增 repository resolver runtime。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
