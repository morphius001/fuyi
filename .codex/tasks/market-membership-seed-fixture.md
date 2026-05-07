# market-membership-seed-fixture

## 目标

新增只用于单元测试和本地 dry-run QA 的 market membership fixture，让后续 Vendor/Admin 数据源验证复用同一套假数据。

## 允许修改

- `packages/api/src/modules/china-market-read-model/__tests__/**`
- `packages/api/src/api/vendor/china/market-context/__tests__/**`
- `docs/market-membership-seed-fixture.md`
- `.codex/tasks/market-membership-seed-fixture.md`
- `.codex/queue.md`

## 禁止修改

- 生产 seed 脚本
- migration SQL
- route 运行时逻辑
- Admin/Vendor/Storefront UI
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
bun --cwd packages/api test:unit -- --runTestsByPath src/modules/china-market-read-model/__tests__/repository-market-read-model-adapter.unit.spec.ts src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
bun --cwd packages/api test:unit -- --runTestsByPath src/modules/china-market-read-model/__tests__/vendor-market-context-builder.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成边界

- fixture 必须是测试文件，不进入 production seed。
- fixture 不得包含真实商户、真实手机号、真实证照、真实订单或真实 provider credential。
- fixture 只能验证 read-only market membership/read model 行为。
- 不改变 checkout、订单、支付、退款、结算、佣金、权限或真实履约。
