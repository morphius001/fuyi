# Readonly Market UI Post-Merge Validation

更新时间：2026-05-07 Asia/Shanghai

## 范围

本报告验证 PR AC-AF/AG 合并后的只读 markets 接入：

- PR AC: Admin markets API client
- PR AD: Storefront 首页读取 markets client
- PR AE: Admin 市场配置页展示 markets 只读 API 面板
- PR AF: Storefront 搜索页读取 market context
- PR AG: Storefront 店铺页读取 market detail context

本轮没有修改支付、订单、退款、结算、佣金、权限、真实履约、真实物流、真实直播、真实 IM、真实短信或真实支付 provider。

## 验证结果

在 `/home/codex/code/fuyi-pr-ah-market-validation-cn` 从 `origin/main` 创建验证 worktree，基准提交为：

```text
662b985 [china] PR AG Storefront seller market context
```

通过项：

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- src/lib/__tests__/china-read-models.unit.spec.ts src/modules/china-market-read-model/__tests__/market-read-model-service.unit.spec.ts
cd packages/api && bun run build
cd apps/admin && bun run lint
cd apps/admin && bun run build
cd apps/storefront && bun run build
git diff --check
```

单测结果：

```text
Test Suites: 2 passed, 2 total
Tests: 8 passed, 8 total
```

## 已知 Warning

Storefront build 仍报告既有 React Hook dependency warnings，涉及：

- `src/components/cells/CartDropdown/CartDropdown.tsx`
- `src/components/cells/PasswordValidator/PasswordValidator.tsx`
- `src/components/organisms/ShippingAddress/ShippingAddress.tsx`
- `src/components/sections/CartAddressSection/CartAddressSection.tsx`

这些 warning 在本轮 Storefront markets 接入前已经存在，不是 PR AC-AF/AG 引入的问题。本轮不修改购物车、地址或结算相关组件，避免扩大风险面。

Admin build 报告 Vite chunk size warning，为现有打包体积提示，不影响本轮只读 markets 接入。

## 安全边界复核

确认未修改：

- payment / refund / payout / settlement / commission 逻辑
- order 状态、checkout、shipping options、fulfillment mutation
- RBAC / permission / ProtectedRoute / 登录逻辑
- Stripe、Algolia、Resend、TalkJS 集成删除或替换
- 真实微信支付、支付宝、短信、IM、物流、直播、AI provider
- 真实密钥、商户号、token 或生产 credential

确认保留：

- Storefront markets API 不可用时有空 fallback。
- Admin markets API 不可用时有只读 fallback。
- Storefront 首页、搜索页、店铺页都保留 discovery/static fallback。
- 市场配送能力只作为展示信息，不影响 checkout shipping options。
- 店铺页将商家履约方式和市场展示能力分开说明。

## 子 Agent 复核

已尝试新建验证子 AG，但当前线程达到上限。随后向已有子 AG 发送只读复核任务；截至本报告生成时，子 AG 尚未返回结果。

主 agent 已完成本地验证和边界复核。若子 AG 后续返回新增风险，应单独记录到下一份 handoff 或修复 PR。

## 生产配置边界

本轮只读接入没有新增生产域名或本地硬编码。

现有配置仍遵循：

- Admin 后端地址：`VITE_MEDUSA_BACKEND_URL`，本地默认 `http://127.0.0.1:9000`
- Storefront 后端地址：`MEDUSA_BACKEND_URL`，本地默认 `http://localhost:9000`
- Storefront publishable key：`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`

上线前仍需统一审计 `.env*`、CORS、cookie/session 域名、dashboard backend URL、Storefront backend URL 和 publishable key。

## 下一步建议

低风险下一步：

1. Admin market detail readonly page：读取 `/admin/china/markets/:id`，展示 memberships、deliveryProfiles、businessHours，继续只读。
2. Storefront seller market sellers bridge：店铺页可校验当前 seller 是否属于 market membership，仍只读。
3. Vendor market context readonly plan：商户端读取所属市场、档口号、营业时间、公告，先做只读工作台信息。

暂停边界：

- 不进入真实 market migration。
- 不让市场配送规则影响 checkout。
- 不改订单、支付、退款、结算、佣金、权限。
- 不接真实物流、直播、IM、短信或支付 provider。
