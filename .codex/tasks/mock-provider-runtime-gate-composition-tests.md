# Task: mock-provider-runtime-gate-composition-tests

## 目标

新增 mock provider registry + runtime gate 的纯函数组合测试。

本任务不接 route、不接 DB、不注册 provider。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-provider-runtime-gate-composition-tests.md`
- `docs/mock-provider-runtime-gate-composition-tests.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不修改 `packages/api/package.json`。
- 不修改 `bun.lock`。
- 不新增依赖。
- 不接支付宝或微信支付。
- 不读取真实密钥。
- 不注册 Medusa payment provider。
- 不连接外部数据库。
- 不调用 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成标准

- 新增组合测试。
- Harness 纳入组合测试。
- 未注册 runtime。
