# admin-market-settings-readonly-page

## 目标

让 Admin “平台设置 / 市场配置”相关页面读取 `retrieveChinaAdminMarkets()`，展示 `/admin/china/markets` 的只读结果。

本任务只做只读展示，不提供保存、发布、审核或权限变更。

## 允许修改

- `apps/admin/src/components/ChinaAdminOperationsConsole.tsx`
- `apps/admin/src/i18n/**`
- `.codex/tasks/admin-market-settings-readonly-page.md`
- `.codex/queue.md`

## 禁止修改

- `packages/api/**`
- `apps/storefront/**`
- `apps/vendor/**`
- Admin 认证、ProtectedRoute、权限、真实菜单权限
- 支付、订单、退款、结算、佣金、履约和真实配送逻辑

## 实现要求

- 在市场配置/市场能力页增加只读 API 面板。
- 使用 `apps/admin/src/lib/china-admin-market-client.ts`。
- 必须包含 loading、ready、error/fallback 和 empty 状态。
- 状态展示使用 `StatusBadge`，来源/数量可以使用 `Badge`。
- 页面必须明确说明只读，不保存、不影响 checkout、订单、支付、履约或权限。
- API 不可用时保留原页面 mock 内容，不白屏。

## 验证命令

```bash
cd apps/admin && bun run lint
cd apps/admin && bun run build
git diff --check
```

## 非目标

- 不实现市场编辑。
- 不实现商户档口绑定编辑。
- 不实现公告发布。
- 不实现配送规则生效。
- 不让模块开关影响权限或菜单。
