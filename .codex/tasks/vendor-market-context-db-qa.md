# vendor-market-context-db-qa

## 目标

用 market membership 测试 fixture 验证 Vendor market context 的 DB reader 三态：repository ready、required table missing、no membership fallback。

## 允许修改

- `packages/api/src/api/vendor/china/market-context/helpers.ts`
- `packages/api/src/api/vendor/china/market-context/__tests__/**`
- `docs/vendor-market-context-db-qa.md`
- `.codex/tasks/vendor-market-context-db-qa.md`
- `.codex/queue.md`

## 禁止修改

- `packages/api/src/api/vendor/china/market-context/route.ts`
- migration SQL
- production seed
- Admin/Vendor/Storefront UI
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
bun --cwd packages/api test:unit -- --runTestsByPath src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成边界

- 优先只新增/调整单元测试；如果测试发现只读 DB selector bug，只允许做最小 helper 修复。
- DB reader 测试必须证明只用 `seller_context.seller_id` 作用域，不信任前端 seller id。
- required table missing 时返回 `undefined`，由 route 保持 fallback。
- 当前 seller 无 membership 时保持 static fallback。
- `runtimeEnabled` 必须保持 `false`，`checkoutImpact` 必须保持 `none`。
