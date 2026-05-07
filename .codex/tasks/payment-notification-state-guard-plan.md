# payment-notification-state-guard-plan

## 目标

规划未来支付通知 handler 进入 payment workflow 前的状态机守卫，不写运行时代码。

## 允许修改

- `docs/payment-notification-state-guard-plan.md`
- `.codex/tasks/payment-notification-state-guard-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 必须覆盖

- handler 前置条件。
- 状态机 guard 输入/输出。
- 金额、币种、provider、payment session、order 状态校验。
- duplicate / invalid / out-of-order / unknown reference 处理。
- 不允许前端 return URL 写成功状态。
- 后续 PR 拆分和验证。

## 禁止行为

- 不实现 handler。
- 不调用 payment workflow。
- 不注册 webhook route。
- 不修改 payment/order/refund/settlement/commission/permission。

## 验证命令

```bash
git diff --check -- \
  docs/payment-notification-state-guard-plan.md \
  .codex/tasks/payment-notification-state-guard-plan.md \
  .codex/queue.md \
  project-ledger
```
