# API Post Merge Validation

更新时间：2026-05-07 Asia/Shanghai

## 结论

第十四轮 API skeleton PR 已经合并到 `main`，合并后验证通过。

本轮只建立只读 read model、Storefront discovery view shape、未注册 Vendor product draft skeleton、Admin module config readonly API。它们仍然不改变支付、订单、退款、结算、佣金、权限、checkout、履约或真实 Provider 行为。

## 已合并 PR

- PR #17: `[china] PR O API read model skeleton`
- PR #18: `[china] PR P Storefront discovery view shapes`
- PR #19: `[china] PR Q Vendor product draft skeleton`
- PR #20: `[china] PR R Admin config readonly API`

当前验证基线：

- `origin/main`: `9ff26e6` `[china] PR R Admin config readonly API`
- Worktree: `/home/codex/code/fuyi-pr-s-api-validation-cn`

## 验证命令

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/lib/__tests__/china-read-models.unit.spec.ts src/modules/china-product-drafts/__tests__/vendor-product-draft-service.unit.spec.ts src/modules/china-service-providers/__tests__/mock-service-providers.unit.spec.ts --runInBand
cd packages/api && ./node_modules/.bin/medusa build
```

## 验证结果

- API TypeScript typecheck 通过。
- Unit tests 通过：3 个 test suites，16 个 tests。
- Medusa build 通过。
- Build 期间未留下需要提交的 generated type diff。

## 覆盖范围

验证覆盖：

- `packages/api/src/lib/china-read-models.ts`
- `packages/api/src/api/store/china/discovery/route.ts`
- `packages/api/src/api/admin/china/module-configs/**`
- `packages/api/src/modules/china-product-drafts/**`
- `packages/api/src/modules/china-service-providers/**`

## 仍然没有生效的内容

- 没有真实 migration。
- 没有真实 product draft 写 API。
- 没有真实 Admin 配置写 API。
- 没有 Storefront UI 接 read model。
- 没有 Vendor UI 接 draft skeleton。
- 没有 checkout shipping options 生效。
- 没有支付、退款、结算、佣金、权限或履约变化。
- 没有真实 AI、短信、IM、直播、物流或支付 Provider。

## 下一阶段门禁

进入真实模型或写 API 前必须满足：

- 每个 PR 只落一个小能力。
- 先读后写。
- 先 draft 后 publish。
- 先 mock/provider skeleton 后真实 provider。
- 所有写接口必须有权限、审计、幂等、回滚说明。
- 任何影响 checkout、订单、支付、退款、结算、佣金、权限、真实履约的任务必须串行。

## 建议下一轮

1. `real-model-next-pr-plan`: 整理真实 migration/API route 的拆分顺序和风险门禁。
2. `market-read-model-module-skeleton`: 市场 read model module skeleton，不接 checkout。
3. `admin-config-draft-design-to-code-plan`: Admin 配置草稿写入前的代码方案，不直接写接口。
4. `vendor-product-draft-api-design-to-code-plan`: Vendor 草稿 API 写入前的代码方案，不创建商品。
