# Task: logistics-and-waybill-readonly-contract

## 目标

新增统一配送、自配送、自提、配送供应商和快递面单能力的只读 TypeScript contract。

## 允许修改

- `packages/api/src/modules/china-logistics-read-model/**`
- `.codex/tasks/logistics-and-waybill-readonly-contract.md`
- `docs/logistics-and-waybill-readonly-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不新增 API route。
- 不新增 migration。
- 不注册 runtime module。
- 不修改 `apps/**`。
- 不调用 MockLogisticsProvider。
- 不接真实物流 Provider。
- 不修改 checkout shipping options、cart total、订单、履约、支付、退款、结算、佣金、打款或权限。
- 不生成真实运单号、真实面单或云打印任务。

## 验证命令

```bash
cd packages/api && ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-logistics-read-model/__tests__/logistics-waybill-readonly-contract.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git restore -- packages/api/.mercur/index.d.ts
git diff --check
```

## 完成标准

- 合同输出 `readOnly: true` 和 `runtimeEnabled: false`。
- 所有履约方式 `checkoutImpact: "none"`。
- 面单能力不创建真实 shipment，不打印真实 label。
- checkout、履约、发货、真实运单、云打印、订单物流状态回写均标记为串行阻塞。
