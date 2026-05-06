# market-membership-post-migration-validation

## 目标

对 PR AZ-BC 的 market membership schema、migration skeleton、repository adapter 和 Vendor route 数据源切换做合并后验证报告。

## 允许修改

- `docs/market-membership-post-migration-validation.md`
- `.codex/tasks/market-membership-post-migration-validation.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
bun test packages/api/src/modules/china-market-read-model/__tests__
bun test packages/api/src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
cd packages/api && bunx tsc --noEmit -p tsconfig.json
cd packages/api && bun run build
git diff --check
```

## 完成边界

- 只记录验证结果和下一步建议。
- 不新增业务代码。
- 不启用真实 migration。
