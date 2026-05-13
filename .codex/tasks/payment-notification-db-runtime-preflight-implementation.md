# Payment Notification DB Runtime Preflight Implementation

## 任务

把 payment notification runtime gate、DB 连接白名单、redaction 和 fail-closed 前置条件推进到可执行代码层。

## 范围

- 仅允许修改 `packages/api/src/modules/china-payment-notification/**` 的 preflight / config / pure gate 层。
- 必要时新增 focused tests。
- 更新对应 docs / ledger。

## 非目标

- 不接真实支付宝 / 微信支付。
- 不执行 workflow。
- 不改 payment / order state。
- 不连接 production DB。

## 验证

- focused tests
- API typecheck
- runtime grep / registration check
- `git diff --check`
