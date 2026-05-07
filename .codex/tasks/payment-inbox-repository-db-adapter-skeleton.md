# payment-inbox-repository-db-adapter-skeleton

## 目标

新增 payment notification inbox DB adapter skeleton 和 mocked transaction 单元测试。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/payment-inbox-repository-db-adapter-skeleton.md`
- `docs/payment-inbox-repository-db-adapter-skeleton.md`
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

- adapter 只接注入的 transaction client。
- 不创建数据库连接。
- 不接 webhook route。
- 不注册 migration。
- 不调用 payment workflow。
- 不改变 payment/order/refund/settlement/commission/permission。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
```
