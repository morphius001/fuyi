# Payment Refund RBAC Ownership Enforcement

## 任务

在 payment runtime disabled command adapter 证据成立之后，先补 payment / refund 相关 ownership、RBAC 和 audit hooks 的后端强校验边界。

## 范围

- 仅允许修改 `packages/api/src/modules/china-payment-notification/**` 与必要的 pure guard / audit / ownership contract 层。
- 必要时新增 focused tests。
- 更新对应 docs / ledger / task 文件。

## 非目标

- 不执行 payment workflow。
- 不写 payment success 或 refund success state。
- 不改 checkout、cart、settlement、commission、payout、permission 真实运行时行为。
- 不连接 preprod / production DB。

## 验证

- focused tests
- API typecheck
- runtime grep / registration check
- `git diff --check`
