# Task: market-domain-read-model-contract-validation

## 目标

记录 `market-domain-read-model-contract` 合并后的主线验证结果。

## 允许修改

- `.codex/tasks/market-domain-read-model-contract-validation.md`
- `docs/market-domain-read-model-contract-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不新增 migration 或 route。
- 不连接数据库。
- 不影响 checkout、order、payment、refund、settlement、commission、payout 或 permission。

## 验证命令

```bash
cd packages/api && ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-market-read-model/__tests__/market-domain-contract-view.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成标准

- focused unit test 通过。
- API typecheck 通过。
- 只记录验证，不改 runtime。
