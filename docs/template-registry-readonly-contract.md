# Template Registry Readonly Contract

更新时间：2026-05-08 Asia/Shanghai

## 目标

为三端 UI 模板系统新增只读合同 skeleton：

- Storefront 消费者模板
- Admin 平台运营后台模板
- Vendor 商户后台模板

本轮只新增 TypeScript view shape、builder 和 focused unit tests。不新增 API route，不接 DB，不注册 Medusa module，不修改任何页面。

## 文件范围

新增：

- `packages/api/src/modules/china-template-registry-read-model/README.md`
- `packages/api/src/modules/china-template-registry-read-model/index.ts`
- `packages/api/src/modules/china-template-registry-read-model/types.ts`
- `packages/api/src/modules/china-template-registry-read-model/template-registry-readonly-contract.ts`
- `packages/api/src/modules/china-template-registry-read-model/__tests__/template-registry-readonly-contract.unit.spec.ts`

## 合同内容

`buildChinaTemplateRegistryReadonlyContract()` 返回：

- `surfaces`: `storefront`、`admin`、`vendor`
- `templates`: 各 surface 的模板 id、slot、view model contract 和可见性规则
- `highRiskBoundaries`: 模板 registry 不能决定的高风险事实
- `readOnly: true`
- `runtimeEnabled: false`

## 风险边界

模板 registry 不能作为以下内容的事实来源：

- RBAC / permission
- feature flag 生效
- payment success
- order status
- refund status
- settlement / commission / payout
- checkout shipping options
- fulfillment / logistics / waybill
- provider configuration
- real credentials

## 本轮验证

已执行：

```bash
cd packages/api && bun run test:unit -- template-registry-readonly-contract.unit.spec.ts
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

结果：

- Focused unit test：1 suite / 4 tests passed。
- API typecheck：通过。
- `git diff --check`：通过。

备注：API typecheck 曾触发 `packages/api/.mercur/index.d.ts` generated diff，本任务不需要更新 generated route types，已恢复该文件，未纳入 PR。

## 结论

模板 registry 现在只是一个只读合同。它让后续设计稿、页面模板、预览模板和三端工作台可以按模板 id 演进，但不会改变交易链路和高风险状态来源。
