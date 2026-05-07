# payment-command-mapper-audit-tests

## 目标

新增纯函数，把 payment workflow command decision 映射为 event log audit action 和安全 metadata。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/payment-command-mapper-audit-tests.md`
- `docs/payment-command-mapper-audit-tests.md`
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

- 只做纯函数和单元测试。
- 不写 DB。
- 不调用 payment workflow。
- 不接 webhook runtime。
- 不改变 payment/order/refund/settlement/commission/permission 状态。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
```
