# vendor-profile-market-context

## 目标

在 Vendor 店铺资料页展示市场归属只读块，不提供保存。

## 允许修改

- `apps/vendor/src/App.tsx`
- `.codex/tasks/vendor-profile-market-context.md`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `packages/api/**`
- 禁止修改 Storefront/Admin
- 禁止修改 checkout、shipping option、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止接入真实物流、短信、IM、直播、AI 或支付 Provider
- 禁止写入真实密钥

## 要求

- 使用 `retrieveChinaVendorMarketContext()`。
- API 不可用时必须保留下方静态店铺资料表。
- 不提供市场归属保存、审核、开通、暂停或权限操作。
- 文案必须说明只读，不影响权限、履约、结算或订单归属。

## 验证

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```
