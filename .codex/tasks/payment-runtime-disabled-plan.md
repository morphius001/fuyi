# payment-runtime-disabled-plan

## 目标

规划支付通知 runtime 接入前的 disabled-by-default 门禁，不实现 runtime。

## 允许修改

- `docs/payment-runtime-disabled-plan.md`
- `.codex/tasks/payment-runtime-disabled-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 必须覆盖

- runtime 默认 disabled。
- mock provider 先行。
- webhook route 何时可以新增。
- migration 何时可以注册。
- workflow command 何时可以执行。
- 支付成功以后端异步通知为准。
- 验签、幂等、可重试、状态 guard、审计要求。
- 回滚和 feature flag 要求。

## 禁止行为

- 不接真实微信支付、支付宝。
- 不新增 webhook route。
- 不注册 migration。
- 不调用 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission 或 permission。

## 验证命令

```bash
git diff --check -- \
  docs/payment-runtime-disabled-plan.md \
  .codex/tasks/payment-runtime-disabled-plan.md \
  .codex/queue.md \
  project-ledger
```
