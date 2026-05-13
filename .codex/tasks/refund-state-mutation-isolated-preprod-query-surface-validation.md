# Refund State Mutation Isolated Preprod Query Surface Validation

## 任务

在 isolated preprod query surface builder 落成后，完成合并前 focused validation 与 ledger 收口。

## 范围

- 允许修改 docs / queue / ledger / task 文件。
- 如有必要，只允许对 `packages/api/src/modules/china-payment-notification/refund-state-mutation-isolated-preprod-query-surface.ts` 和对应 focused tests 做小范围修补。

## 非目标

- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。
- 不接真实 provider refund request / query。

## 验证

- focused tests
- API typecheck
- runtime grep / registration check
- `git diff --check`
