# admin-market-readonly-api-db-qa

## 目标

让 Admin market readonly API 优先读取 market membership repository rows，并用单元测试覆盖 repository ready、missing required table、static fallback 三态。

## 允许修改

- `packages/api/src/api/admin/china/markets/helpers.ts`
- `packages/api/src/api/admin/china/markets/route.ts`
- `packages/api/src/api/admin/china/markets/[id]/route.ts`
- `packages/api/src/api/admin/china/markets/__tests__/**`
- `docs/admin-market-readonly-api-db-qa.md`
- `.codex/tasks/admin-market-readonly-api-db-qa.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- migration SQL
- production seed
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实微信支付、支付宝、短信、IM、物流、直播、AI provider

## 验证命令

```bash
bun --cwd packages/api test:unit -- --runTestsByPath src/api/admin/china/markets/__tests__/helpers.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
bun run prettier --check packages/api/src/api/admin/china/markets/helpers.ts packages/api/src/api/admin/china/markets/route.ts packages/api/src/api/admin/china/markets/[id]/route.ts packages/api/src/api/admin/china/markets/__tests__/helpers.unit.spec.ts docs/admin-market-readonly-api-db-qa.md .codex/tasks/admin-market-readonly-api-db-qa.md .codex/queue.md
```

## 完成边界

- Admin API 仍然只读。
- 不新增写接口。
- 不改变权限、订单、支付、退款、结算、佣金或真实履约。
- repository 数据不可用时必须保留 static fallback。
