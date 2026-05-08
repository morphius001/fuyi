# Task: mock-china-payment-provider-contract

## 目标

新增未注册 Mock China PaymentProvider contract，用于后续 Provider / Adapter 评审和测试。

本任务只允许纯函数、类型和单元测试，不接 checkout runtime，不执行 payment workflow。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-china-payment-provider-contract.md`
- `docs/mock-china-payment-provider-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不修改 `packages/api/package.json`。
- 不修改 `bun.lock`。
- 不新增依赖。
- 不接真实支付宝、微信支付或任何支付网关。
- 不写真实 app id、merchant id、private key、public key、证书、secret 或 webhook token。
- 不注册 Medusa payment provider。
- 不连接数据库。
- 不调用 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成标准

- Mock provider contract 未注册，只通过 `index.ts` 导出供测试和后续评审。
- 单测覆盖 create/query/close/notification normalize/verify 和敏感信息不外泄。
- Harness 纳入新增单测。
