# Task: market-api-post-merge-validation

## 目标

对 PR U-X 合并后的市场 read model skeleton、static adapter、Store/Admin readonly API 做总验证并记录。

## 允许修改

- `docs/market-api-post-merge-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止修改交易、权限或履约逻辑

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/modules/china-market-read-model/__tests__/market-read-model-service.unit.spec.ts src/lib/__tests__/china-read-models.unit.spec.ts --runInBand
cd packages/api && ./node_modules/.bin/medusa build
git diff --check -- docs/market-api-post-merge-validation.md .codex/queue.md project-ledger .codex/tasks/market-api-post-merge-validation.md
```
