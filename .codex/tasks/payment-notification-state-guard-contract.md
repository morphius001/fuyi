# payment-notification-state-guard-contract

## 目标

新增支付通知状态机守卫的纯函数 contract 和单元测试。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/tasks/payment-notification-state-guard-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/package.json`
- `bun.lock`
- `.env`

## 必须保持

- 纯函数。
- 不调用 payment workflow。
- 不连接数据库。
- 不注册 runtime。
- 不改变 checkout、order、payment、refund、settlement、commission 或 permission。

## 验证命令

```bash
cd packages/api
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/payment-notification-state-guard.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
```
