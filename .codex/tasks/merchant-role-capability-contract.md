# Task: merchant-role-capability-contract

## 目标

新增商户角色能力只读合同，把普通商品商户、物料供应商、配送供应商、养殖户、种植户、种苗供应商和外地批发商的默认可见性、能力和高风险禁止项固化为纯 TypeScript view shape。

## 允许修改

- `packages/api/src/modules/china-market-read-model/**`
- `.codex/tasks/merchant-role-capability-contract.md`
- `docs/merchant-role-capability-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不新增 API route。
- 不新增 migration。
- 不注册 runtime module。
- 不修改 `apps/**`。
- 不修改支付、订单、退款、结算、佣金、打款、权限或真实履约逻辑。
- 不接真实物流、快递打印、IM、短信、支付宝或微信支付。

## 验证命令

```bash
cd packages/api && ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-market-read-model/__tests__/merchant-role-capability-contract.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成标准

- 合同输出 `readOnly: true` 和 `runtimeEnabled: false`。
- 物料供应商和配送供应商默认不进入消费者商品流。
- 养殖户、种植户、种苗供应商和外地批发商默认保持商户侧或上游侧可见。
- 高风险项必须标记为串行阻塞工作。
