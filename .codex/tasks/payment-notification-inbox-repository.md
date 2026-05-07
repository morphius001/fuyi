# payment-notification-inbox-repository

## 目标

新增未注册的 payment notification inbox repository interface / in-memory implementation，用于测试幂等 replay、状态记录和 event log。

## 允许修改

- `packages/api/src/modules/china-payment-notification/**`
- `.codex/tasks/payment-notification-inbox-repository.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/package.json`
- `bun.lock`
- `.env`

## 必须保持

- 不接 webhook runtime。
- 不注册 migration。
- 不连接数据库。
- 不改变 checkout、cart、order、payment、refund、settlement、commission 或 permission。

## 验证命令

```bash
cd packages/api
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/payment-notification-inbox-repository.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
```

并确认 staged 文件不包含禁止范围：

```bash
git diff --cached --name-only | grep -E '^(apps|packages/api/medusa-config.ts|packages/api/package.json|bun.lock|\.env)' && exit 1 || true
```
