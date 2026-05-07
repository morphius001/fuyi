# payment-inbox-repository-interface

## 目标

新增 payment notification inbox repository interface / types / error classifier，不写 DB adapter。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/payment-inbox-repository-interface.md`
- `docs/payment-inbox-repository-interface.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `packages/api/src/workflows/**`
- `packages/api/src/subscribers/**`
- `packages/api/src/jobs/**`
- `packages/api/src/links/**`
- `bun.lock`
- `package.json`
- `.env`

## 安全边界

- 不写 DB adapter。
- 不连接数据库。
- 不接 webhook route。
- 不注册 migration。
- 不调用 payment workflow。
- 不改变 payment/order/refund/settlement/commission/permission 状态。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
```
