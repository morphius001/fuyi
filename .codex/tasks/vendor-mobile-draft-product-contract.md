# Task: vendor-mobile-draft-product-contract

## 目标

新增 Vendor 手机快速上架草稿只读 contract，用纯 TypeScript view shape 固化手机端字段、草稿阶段和高风险禁止项。

## 允许修改

- `packages/api/src/modules/china-product-drafts/**`
- `.codex/tasks/vendor-mobile-draft-product-contract.md`
- `docs/vendor-mobile-draft-product-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不新增 API route。
- 不新增 migration。
- 不注册 runtime module。
- 不修改 `apps/**`。
- 不创建真实商品。
- 不初始化库存。
- 不发布商品。
- 不接真实 AI、微信、图片识别、语音识别、短信、IM、物流或快递打印。
- 不修改订单、支付、退款、结算、佣金、打款、权限或履约逻辑。

## 验证命令

```bash
cd packages/api && ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-product-drafts/__tests__/mobile-draft-product-contract.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git restore -- packages/api/.mercur/index.d.ts
git diff --check
```

## 完成标准

- 合同输出 `readOnly: true` 和 `runtimeEnabled: false`。
- 所有草稿阶段都不创建商品、不创建库存。
- AI、微信、商品发布、订单、支付、权限和履约均保持串行阻塞。
