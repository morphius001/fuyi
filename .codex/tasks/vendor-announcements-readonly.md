# vendor-announcements-readonly

## 目标

在 Vendor 公告 / 服务页展示商户侧市场公告，只读不发布。

## 允许修改

- `apps/vendor/src/App.tsx`
- `.codex/tasks/vendor-announcements-readonly.md`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `packages/api/**`
- 禁止修改 Storefront/Admin
- 禁止修改 checkout、shipping option、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止发送真实短信、IM、站内信、邮件或公告
- 禁止接入真实物流、短信、IM、直播、AI 或支付 Provider
- 禁止写入真实密钥

## 要求

- 使用 `retrieveChinaVendorMarketContext()` 读取 `announcements`。
- API 不可用时必须保留下方客服 mock 表。
- 文案必须说明只读，不发布公告、不发送真实消息。
- 不改变售后、订单、履约或风控状态。

## 验证

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```
