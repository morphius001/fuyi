# Refund State Mutation Isolated Preprod Query Surface Implementation

## 任务

在 payment / refund ownership、RBAC 和 audit boundary 证据成立之后，实现 isolated preprod query surface 的只读聚合读模型。

## 范围

- 仅允许修改 `packages/api/src/modules/china-payment-notification/**` 的 query surface / read model / pure aggregator 层，以及必要的 focused tests。
- 更新对应 docs / ledger / task 文件。

## 非目标

- 不写 refund success state。
- 不执行 production workflow。
- 不接真实 provider refund request / query。
- 不连接 production DB。

## 验证

- focused tests
- API typecheck
- runtime grep / registration check
- `git diff --check`
