# Task: api-post-merge-validation

## 目标

对第十四轮 PR O-R 合并后的 `main` 做 API 总验证，并固化验证报告。

## 允许修改

- `docs/api-post-merge-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止修改支付、订单、退款、结算、佣金、权限、履约逻辑

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/lib/__tests__/china-read-models.unit.spec.ts src/modules/china-product-drafts/__tests__/vendor-product-draft-service.unit.spec.ts src/modules/china-service-providers/__tests__/mock-service-providers.unit.spec.ts --runInBand
cd packages/api && ./node_modules/.bin/medusa build
git diff --check -- docs/api-post-merge-validation.md .codex/queue.md project-ledger .codex/tasks/api-post-merge-validation.md
```
