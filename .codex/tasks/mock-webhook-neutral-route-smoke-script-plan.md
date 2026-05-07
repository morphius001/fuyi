# mock-webhook-neutral-route-smoke-script-plan

## 目标

规划 neutral mock payment webhook route 的本地 smoke 脚本。

本任务只写文档，不新增脚本。

## 允许修改

- `.codex/tasks/mock-webhook-neutral-route-smoke-script-plan.md`
- `docs/mock-webhook-neutral-route-smoke-script-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `.codex/scripts/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥
- 支付、订单、退款、结算、佣金、权限业务逻辑

## 必须覆盖

- 脚本只打 neutral route `/china/payment-webhooks/mock`。
- 不再测试 Admin route 作为 provider callback。
- disabled case。
- local in-memory accepted case。
- missing signature rejected case。
- malformed payload rejected case。
- production disabled case。
- 响应不泄漏 raw payload、signature、secret、workflow result。
- 不连接 DB、不执行 workflow、不接真实 Provider。

## 验证

```bash
git diff --check
```
