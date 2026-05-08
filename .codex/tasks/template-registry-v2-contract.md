# template-registry-v2-contract

## 目标

把第九十八轮已经合并的四个 template v2 surface 登记到未注册的只读 template registry contract 中。

## 允许修改

- `packages/api/src/modules/china-template-registry-read-model/**`
- `docs/template-registry-v2-contract.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

## 禁止修改

- `apps/**`
- `packages/api/src/api/**`
- `packages/api/medusa-config.ts`
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment runtime

## 必须覆盖

- `storefront-home-market-shop-v2`
- `storefront-shop-stall-v2`
- `admin-dashboard-ops-v2`
- `vendor-role-workspace-v2`
- 每个模板必须保持 `runtimeEnabled: false`
- 每个模板必须保持 `canWriteBusinessState: false`
- 高风险边界必须继续覆盖 RBAC、feature flag、payment、order、refund、settlement、commission、payout、checkout shipping options、provider config、credentials 和 fulfillment

## 验证

```bash
cd packages/api && bun run test:unit -- template-registry-readonly-contract.unit.spec.ts
cd ../..
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。提交时必须排除 `docs/visual-qa-artifacts/**`。
