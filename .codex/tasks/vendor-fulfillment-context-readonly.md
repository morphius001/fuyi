# vendor-fulfillment-context-readonly

## 目标

在 Vendor 物流 / 配送页展示 delivery profiles，只读不影响 checkout。

## 允许修改

- `apps/vendor/src/App.tsx`
- `.codex/tasks/vendor-fulfillment-context-readonly.md`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `packages/api/**`
- 禁止修改 Storefront/Admin
- 禁止修改 checkout、shipping option、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止创建真实运单、确认真实发货或调用真实物流服务
- 禁止接入真实物流、短信、IM、直播、AI 或支付 Provider
- 禁止写入真实密钥

## 要求

- 使用 `retrieveChinaVendorMarketContext()` 读取 `deliveryProfiles`。
- API 不可用时必须保留下方静态物流 mock 表。
- 文案必须说明 checkoutImpact 为 none，`runtimeEnabled` 为 false。
- 不提供保存配送规则、创建运单、确认发货、打印面单或修改订单状态。

## 验证

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```
