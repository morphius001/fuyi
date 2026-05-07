# mock-payment-webhook-inbox-route-plan

## 目标

设计 mock payment webhook inbox-only route，不写 route 代码。

## 允许修改

- `docs/mock-payment-webhook-inbox-route-plan.md`
- `.codex/tasks/mock-payment-webhook-inbox-route-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 必须覆盖

- URL 和 method 草案。
- runtime feature flag。
- mock provider 限制。
- 请求 headers / body。
- 响应语义。
- 验签失败、重复通知、未知类型、非 CNY、schema 错误。
- inbox-only 行为。
- 不执行 payment workflow。
- 测试和验收。

## 禁止行为

- 不新增 API route。
- 不注册 migration。
- 不接真实支付 Provider。
- 不调用 payment workflow。
- 不改变 order/payment/refund/settlement/commission/permission。

## 验证命令

```bash
git diff --check -- \
  docs/mock-payment-webhook-inbox-route-plan.md \
  .codex/tasks/mock-payment-webhook-inbox-route-plan.md \
  .codex/queue.md \
  project-ledger
```
