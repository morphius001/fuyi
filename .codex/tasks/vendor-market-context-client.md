# vendor-market-context-client

## 目标

在 `apps/vendor` 新增 Vendor 市场上下文只读 client/fallback，不改页面布局、不接真实业务生效逻辑。

## 允许修改

- `apps/vendor/src/lib/**`
- `.codex/tasks/vendor-market-context-client.md`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `packages/api/**`
- 禁止修改 Vendor 页面布局或业务流程
- 禁止修改 Storefront/Admin
- 禁止修改 checkout、shipping option、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止接入真实物流、短信、IM、直播、AI 或支付 Provider
- 禁止写入真实密钥

## 要求

- client 必须可 fallback，不依赖 API 已经存在。
- fallback 必须保持 `runtimeEnabled: false`。
- 不能通过前端传入 `sellerId` 查询其它商户。
- 只新增读取工具，不在 UI 中消费。

## 验证

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```
