# vendor-market-context-client-api-polish

## 目标

Vendor client 对接真实 route 的可用 / 空 / fallback 状态。

## 允许修改

- `apps/vendor/src/lib/china-vendor-market-context-client.ts`
- `.codex/tasks/vendor-market-context-client-api-polish.md`
- `.codex/queue.md`

## 禁止修改

- `packages/api/**`
- `apps/admin/**`
- `apps/storefront/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

## 完成边界

- 不重做页面布局。
- Client 必须继续保留 fallback。
- API 不可用时不能阻断商户后台。
- `market_id` 只用于当前 seller 上下文过滤，不传前端 `sellerId`。
