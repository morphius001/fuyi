# Task: non-payment-readonly-contracts-validation

## 目标

验证非支付 read-only contracts 合并后的 focused tests、API typecheck 和账本状态。

## 允许修改

- `.codex/tasks/non-payment-readonly-contracts-validation.md`
- `docs/non-payment-readonly-contracts-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增依赖。
- 不新增 API route。
- 不新增 migration。
- 不修改 checkout、订单、支付、退款、结算、佣金、打款、权限或履约逻辑。

## 验证命令

```bash
cd packages/api && ./node_modules/.bin/jest --runInBand --forceExit --runTestsByPath \
  src/modules/china-market-read-model/__tests__/merchant-role-capability-contract.unit.spec.ts \
  src/modules/china-product-drafts/__tests__/mobile-draft-product-contract.unit.spec.ts \
  src/modules/china-shop-decoration-read-model/__tests__/shop-decoration-readonly-contract.unit.spec.ts \
  src/modules/china-logistics-read-model/__tests__/logistics-waybill-readonly-contract.unit.spec.ts \
  src/modules/china-pickup-card-read-model/__tests__/pickup-card-consumer-flow-contract.unit.spec.ts \
  src/modules/china-live-commerce-read-model/__tests__/live-commerce-readonly-contract.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git restore -- packages/api/.mercur/index.d.ts
git diff --check
```

## 完成标准

- 记录测试结果。
- 记录没有业务 runtime、route、migration 或交易链路变更。
- 队列推进到下一轮建议。
