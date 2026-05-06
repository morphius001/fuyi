# Market Membership Post-Migration Validation

更新时间：2026-05-07 Asia/Shanghai

## 范围

本报告收口 PR AZ-BC：

- PR AZ: market membership schema finalization
- PR BA: market membership migration skeleton
- PR BB: market read model repository adapter
- PR BC: Vendor market context data source switch

## 合并后验证结果

通过：

```bash
bun test packages/api/src/modules/china-market-read-model/__tests__
bun test packages/api/src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
cd packages/api && bunx tsc --noEmit -p tsconfig.json
cd packages/api && bun run build
git diff --check
```

测试结果：

- China market read model: 9 tests passed.
- Vendor market context helpers: 6 tests passed.
- API typecheck: passed.
- Medusa backend build: passed.
- Diff whitespace check: passed.

## 验证环境说明

- Node: v24.15.0 via local nvm.
- Bun: 1.3.13.
- `cd packages/api && bunx tsc --noEmit -p tsconfig.json` and `cd packages/api && bun run build` should run with `packages/api/node_modules/.bin` visible on `PATH`.
- Running the API typecheck from repo root with only root `node_modules/.bin` can produce false missing-module errors for Medusa/Mercur workspace dependencies.

## 安全边界复核

本轮没有引入：

- Admin/Storefront/Vendor UI 改动。
- `packages/api/medusa-config.ts` 注册改动。
- POST/PATCH/DELETE 写接口。
- 真实 seed。
- 真实微信支付、支付宝、短信、IM、物流、直播、AI provider。
- checkout、订单、支付、退款、结算、佣金、权限或真实履约变更。

Vendor market context route 当前行为：

- seller 身份只来自 `req.seller_context.seller_id`。
- 前端不允许传 `sellerId` 作为可信身份。
- repository 查询按当前 seller 过滤 membership 和 role。
- `market_id` 只作为当前 seller 下的市场过滤条件。
- 表不存在、查询异常或没有当前 seller membership 时回落 seller metadata static fallback。
- 输出继续保持 `runtimeEnabled: false` 和 `checkoutImpact: none`。

## 剩余风险

- 还没有在真实数据库里运行 migration。下一轮如果要启用真实表，需要先做 migration dry-run / rollback 验证。
- 当前 Vendor route 已具备 repository 读取路径，但如果真实表为空，会使用 static fallback；上线前需要明确是否允许 fallback 暂时存在。
- Admin 侧还没有真实 market membership 只读管理页。建议下一轮作为低风险只读 PR。

## 下一步建议

1. `admin-market-membership-readonly-view`: Admin 只读查看市场、商户市场关系、档口、公告、营业时间、配送 profile，不保存。
2. `market-membership-db-dry-run-plan`: 设计本地/预发 migration dry-run、rollback、空表和兼容性检查。
3. `vendor-market-context-authenticated-db-qa`: 在有真实表或测试 seed 的环境中验证 Vendor route 的 repository/fallback 三态。
