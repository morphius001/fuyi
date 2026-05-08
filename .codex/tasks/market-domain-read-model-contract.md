# Task: market-domain-read-model-contract

## 目标

新增市场域 TypeScript view shape skeleton，用纯函数表达市场域合同，不新增 migration、route 或写入逻辑。

## 允许修改

- `packages/api/src/modules/china-market-read-model/types.ts`
- `packages/api/src/modules/china-market-read-model/index.ts`
- `packages/api/src/modules/china-market-read-model/market-domain-contract-view.ts`
- `packages/api/src/modules/china-market-read-model/__tests__/market-domain-contract-view.unit.spec.ts`
- `.codex/tasks/market-domain-read-model-contract.md`
- `docs/market-domain-read-model-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不新增 migration。
- 不新增 API route。
- 不连接数据库。
- 不影响 checkout、order、payment、refund、settlement、commission、payout 或 permission。

## 验证命令

```bash
cd packages/api && TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-market-read-model/__tests__/market-domain-contract-view.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成标准

- 纯函数 view shape 有测试。
- API typecheck 通过。
- 未新增 runtime route 或 migration。
