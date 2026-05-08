# Task: mock-payment-provider-registry-contract

## 目标

新增 payment provider adapter registry 纯函数 contract，用于后续 runtime gate 前的 provider 选择边界。

本任务不注册 Provider，不读取真实密钥，不接 checkout runtime。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-payment-provider-registry-contract.md`
- `docs/mock-payment-provider-registry-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不修改 `packages/api/package.json`。
- 不修改 `bun.lock`。
- 不新增依赖。
- 不读取真实支付宝、微信支付或支付网关密钥。
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

- Registry 默认 disabled。
- Production 默认 blocked。
- 仅 mock provider 在显式 contract-only 配置下可解析。
- Harness 纳入新增单测。
