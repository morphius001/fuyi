# market-read-model-repository-adapter

## 目标

新增真实市场/商户关系表到现有 China market read model 的 repository adapter 和单元测试，但不切换任何现有 API route 的数据源。

## 允许修改

- `packages/api/src/modules/china-market-read-model/**`
- `.codex/tasks/market-read-model-repository-adapter.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 必须覆盖

- 从 `china_market` row 映射到 `ChinaMarket`
- 从 `china_market_membership` row 映射到 `ChinaMarketMembership`
- 从 `china_seller_role` row 映射到 `ChinaSellerRole`
- 从 `china_market_announcement` row 映射到 `ChinaMarketAnnouncement`
- 从 `china_market_business_hour` row 映射到 `ChinaMarketBusinessHour`
- 从 `china_market_delivery_profile` row 映射到 `ChinaMarketDeliveryProfile`
- 过滤软删除、未知枚举和缺失必填字段
- 保持 `runtimeEnabled: false`、`checkoutImpact: none` 语义

## 验证命令

```bash
bun test packages/api/src/modules/china-market-read-model/__tests__/repository-market-read-model-adapter.unit.spec.ts
bun test packages/api/src/modules/china-market-read-model/__tests__
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run build
git diff --check
```

## 完成边界

- 可以新增 adapter 和测试。
- 不注册 Medusa module。
- 不新增 route。
- 不切换 Vendor market context 数据源。
