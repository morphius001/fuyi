# payment-workflow-command-contract

## 目标

新增支付 workflow command DTO 和纯函数 mapper，把 state guard result 映射为 command/audit-only decision。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/tasks/payment-workflow-command-contract.md`
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
- 不接 webhook runtime。
- 不连接数据库。
- 不改变交易状态。

## 验证命令

```bash
cd packages/api
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/payment-workflow-command-mapper.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
```
