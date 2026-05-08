# Task: shop-decoration-readonly-contract

## 目标

新增商家主页装修只读 TypeScript contract，固化店铺头图、公告、商品分组、资质、配送说明、直播状态和高风险禁止项。

## 允许修改

- `packages/api/src/modules/china-shop-decoration-read-model/**`
- `.codex/tasks/shop-decoration-readonly-contract.md`
- `docs/shop-decoration-readonly-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不新增 API route。
- 不新增 migration。
- 不注册 runtime module。
- 不修改 `apps/**`。
- 不保存装修草稿。
- 不发布装修版本。
- 不上传真实文件。
- 不接真实 CDN、直播、IM、短信、物流或快递打印。
- 不修改商品、库存、checkout、订单、支付、退款、结算、佣金、打款、权限或履约逻辑。

## 验证命令

```bash
cd packages/api && ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-shop-decoration-read-model/__tests__/shop-decoration-readonly-contract.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git restore -- packages/api/.mercur/index.d.ts
git diff --check
```

## 完成标准

- 合同输出 `readOnly: true` 和 `runtimeEnabled: false`。
- 模块全部 `editable: false`。
- 商品、库存、checkout、支付、权限、真实文件上传、真实直播和履约均标记为串行阻塞。
