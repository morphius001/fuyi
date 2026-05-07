# mock-webhook-inbox-only-route-readiness

## 目标

检查 mock webhook inbox-only route 真正实现前的 readiness，不新增 route。

## 允许修改

- `docs/mock-webhook-inbox-only-route-readiness.md`
- `.codex/tasks/mock-webhook-inbox-only-route-readiness.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 必须覆盖

- 允许的未来 route 文件边界。
- runtime config 前置条件。
- repository / migration 前置条件。
- request / response contract。
- 测试清单。
- 禁止触碰 payment workflow、order/payment/refund/settlement/commission/permission。

## 禁止行为

- 不新增 API route。
- 不注册 migration。
- 不接 runtime。
- 不调用 payment workflow。

## 验证命令

```bash
git diff --check -- \
  docs/mock-webhook-inbox-only-route-readiness.md \
  .codex/tasks/mock-webhook-inbox-only-route-readiness.md \
  .codex/queue.md \
  project-ledger
```
