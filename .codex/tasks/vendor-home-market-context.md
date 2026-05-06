# vendor-home-market-context

## 目标

在 Vendor 首页展示市场 / 档口 / 公告只读摘要，不影响订单和履约。

## 允许修改

- `apps/vendor/src/App.tsx`
- `apps/vendor/src/lib/china-vendor-market-context-client.ts`
- `.codex/tasks/vendor-home-market-context.md`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `packages/api/**`
- 禁止修改 Storefront/Admin
- 禁止修改 checkout、shipping option、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止接入真实物流、短信、IM、直播、AI 或支付 Provider
- 禁止写入真实密钥

## 要求

- 使用 `retrieveChinaVendorMarketContext()`。
- API 不可用时必须保留现有静态市场 mock 展示。
- 文案必须说明只读，不影响订单、配送、结算、佣金或权限。
- 不改变首页待办、订单、履约、财务和权限数据来源。

## 验证

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```
