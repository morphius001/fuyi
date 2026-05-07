# mock-payment-notification-skeleton

## 目标

新增未注册的 Mock China Payment notification skeleton，用于后续支付通知验签、幂等和 payload normalize 的测试基线。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/tasks/mock-payment-notification-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/package.json`
- `bun.lock`
- `.env`
- 真实支付 Provider、真实密钥、商户号、证书、app id 或 webhook token

## 必须保持

- Mock-only。
- 未注册 runtime。
- 不接 checkout。
- 不新增 API route、workflow、subscriber、job、link。
- 不修改 payment、order、refund、payout、settlement、commission 或 permission 运行时逻辑。

## 验收

必须覆盖：

- fake signature verified。
- fake signature invalid。
- same event id -> same idempotency key。
- fallback idempotency key 包含 event type。
- amount mismatch 只加 risk flag，不输出状态变更 command。
- unknown merchant order ref 只加 risk flag。

## 验证命令

```bash
cd packages/api
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/mock-payment-notification.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
```

并确认 staged 文件不包含禁止范围：

```bash
git diff --cached --name-only | grep -E '^(apps|packages/api/medusa-config.ts|packages/api/package.json|bun.lock|\.env)' && exit 1 || true
```
