# vendor-market-context-readonly-route

## 目标

实现只读 Vendor route 和鉴权边界。

## 允许修改

- `packages/api/src/api/vendor/china/market-context/**`
- `.codex/tasks/vendor-market-context-readonly-route.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/api/src/api/vendor/**` 中其它订单、支付、退款、履约、结算、佣金、权限路由
- `package.json`
- `bun.lock`
- `.env*`
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
cd packages/api && bun run build
git diff --check
```

## 完成边界

- Route 必须从 `req.seller_context.seller_id` 解析当前 seller。
- 不接受前端传入 `sellerId`。
- `market_id` 只能过滤当前 seller 的上下文；不匹配时返回 empty context，不泄露其它商户。
- 只提供 `GET /vendor/china/market-context`。
- 不新增 POST / PATCH / DELETE。
