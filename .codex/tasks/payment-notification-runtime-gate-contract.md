# Task: payment-notification-runtime-gate-contract

## 目标

新增 payment notification runtime gate 纯函数 contract，默认 blocked，用于未来 route runtime 前置判断。

本任务不接 route、不执行 workflow。

## 允许修改

- `packages/api/src/modules/china-payment-notification/runtime-gate.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/payment-runtime-gate.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/payment-notification-runtime-gate-contract.md`
- `docs/payment-notification-runtime-gate-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不修改 route runtime。
- 不新增依赖。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。
- 不调用 payment workflow。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git diff --check
```

## 完成标准

- runtime gate 默认 blocked。
- production 默认 blocked。
- DB runtime、migration、preprod disposable DB、provider adapter 缺一即 blocked。
- inbox-only / prepare-command 只在所有非 workflow gate 满足时 allowed。
- workflow execution 仍不能通过本任务启用。
