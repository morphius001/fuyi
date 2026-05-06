# market-membership-migration-skeleton

## 目标

为中国市场/商户关系读模型准备后端 migration skeleton，先落可审查的表结构，不注册运行时模块，不切换任何现有 API 数据源。

## 允许修改

- `packages/api/src/modules/china-market-membership/**`
- `.codex/tasks/market-membership-migration-skeleton.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- 已有 API routes
- 已有 Vendor/Admin/Storefront client
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 必须覆盖

- `china_market`
- `china_market_membership`
- `china_seller_role`
- `china_market_announcement`
- `china_market_business_hour`
- `china_market_delivery_profile`
- `up` 和 `down`
- 索引和基础 check constraints
- 明确说明未注册模块、未写 seed、未切数据源

## 验证命令

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run build
git diff --check
```

## 完成边界

- 可以新增 migration skeleton。
- 不运行真实迁移。
- 不注册 `medusa-config.ts`。
- 不新增 route。
- 不切换 Vendor market context 数据源。
