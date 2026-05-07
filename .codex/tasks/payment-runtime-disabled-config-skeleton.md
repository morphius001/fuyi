# payment-runtime-disabled-config-skeleton

## 目标

新增支付通知 runtime disabled-by-default 配置解析纯函数和单元测试。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/payment-runtime-disabled-config-skeleton.md`
- `docs/payment-runtime-disabled-config-skeleton.md`
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

- 不接 runtime。
- 不新增 webhook route。
- 不注册 migration。
- 不调用 payment workflow。
- 不允许真实支付宝/微信支付 provider。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
```
