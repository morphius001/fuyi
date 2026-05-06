# vendor-market-context-data-source-switch

## 目标

让 `GET /vendor/china/market-context` 优先读取真实 China market membership repository rows，并保留静态 seller metadata fallback。

## 允许修改

- `packages/api/src/api/vendor/china/market-context/**`
- `.codex/tasks/vendor-market-context-data-source-switch.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- 其他 API routes
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 必须覆盖

- Vendor seller 身份只能从 `req.seller_context.seller_id` 读取。
- 前端 `sellerId` 不可信，不允许作为查询条件。
- 真实表不存在、查询异常或没有当前 seller membership 时回落到 seller metadata static fallback。
- 查询真实表时必须按当前 seller 过滤 membership 和 role。
- `market_id` 只能作为当前 seller 下的 market 过滤条件。
- 输出仍保持 `runtimeEnabled: false`、`checkoutImpact: none`。
- 不新增 POST/PATCH/DELETE。

## 验证命令

```bash
bun test packages/api/src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
bun test packages/api/src/modules/china-market-read-model/__tests__
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run build
git diff --check
```

## 完成边界

- 可以切换 `GET /vendor/china/market-context` 的只读数据源。
- 不改变订单、支付、退款、结算、佣金、权限或真实履约。
- 不注册新 Medusa module。
