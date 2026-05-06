# vendor-market-context-post-api-validation

## 目标

对 PR AS-AU 合并后的 API + Vendor 总验证。

## 允许修改

- `docs/vendor-market-context-post-api-validation.md`
- `.codex/tasks/vendor-market-context-post-api-validation.md`
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
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- src/modules/china-market-read-model/__tests__/vendor-market-context-builder.unit.spec.ts src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
cd packages/api && bun run build
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

## 完成边界

- 只记录验证结果和风险边界。
- 不修改业务代码。
