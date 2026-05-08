# Template Registry V2 Contract

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮把四个已经合并的 template v2 surface 纳入未注册的只读 template registry contract：

- `storefront-home-market-shop-v2`
- `storefront-shop-stall-v2`
- `admin-dashboard-ops-v2`
- `vendor-role-workspace-v2`

这是纯 TypeScript 合同更新，不新增 API route，不注册 Medusa module，不接数据库，不改变任何页面。

## 本轮改动

- 在 `ChinaTemplateRegistrySlotKey` 中补充 v2 需要的 slot：`focus_modules`、`role_workspace_cards`、`market_announcements`、`service_links`。
- 在 Storefront 模板中加入首页 v2 和店铺页 v2。
- 在 Admin 模板中加入运营首页 v2。
- 在 Vendor 模板中加入多角色经营看板 v2。
- 补充 focused unit tests，确认 v2 模板仍然 `runtimeEnabled: false`、`canWriteBusinessState: false`。

## 安全边界

Template registry v2 仍然不能作为以下事实来源：

- RBAC / permission
- feature flag 生效
- payment success
- order status
- refund status
- settlement / commission / payout
- checkout shipping options
- fulfillment / logistics / waybill
- provider configuration
- real credentials
- live streaming / IM runtime
- pickup card redemption result

## 验证

- `cd packages/api && bun run test:unit -- template-registry-readonly-contract.unit.spec.ts`
- `./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json`
- `git diff --check`

## 风险与回滚

- 风险：这是只读合同层，低风险；主要风险是后续页面误把 registry 当成真实权限或 feature flag 来源。
- 回滚：回滚本 PR 会移除 v2 template ids 和新增 slot，不需要数据迁移或服务回滚。
