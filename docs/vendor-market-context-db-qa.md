# Vendor Market Context DB QA

更新时间：2026-05-07 Asia/Shanghai

## 目标

验证 Vendor market context 只读 route 的 DB reader 边界，确保后续接入真实 market membership 表时，仍然只读、可 fallback、不影响 checkout 或真实履约。

## 本轮变更

本轮先补单元测试，并根据 QA 发现做了一个只读 selector 最小修复：

```text
packages/api/src/api/vendor/china/market-context/helpers.ts
packages/api/src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
```

QA 发现：`readVendorMarketContextRepositoryRows()` 读取 `china_market` 时使用 `market_id` 过滤，但市场表主键是 `id`。这会导致 repository ready 时 market rows 为空，Vendor context 无法进入 repository mode。本轮仅把 `china_market` 的过滤 key 调整为 `id`，其它 membership、role、announcement、business hour、delivery profile 查询仍保持原只读边界。

测试中新增一个轻量 in-memory query builder，模拟 `readVendorMarketContextRepositoryRows()` 需要的 Knex 只读子集：

- `schema.hasTable(tableName)`
- `whereNull("deleted_at")`
- `where("seller_id", sellerId)`
- `where("market_id", marketId)`
- `whereIn("market_id", marketIds)`
- `select("*")`

## 覆盖三态

1. Repository ready
   - 使用 `market-membership-test-fixture.ts`。
   - 当前商户能读取两个市场档口。
   - context data source 为 `repository`。
   - `runtimeEnabled` 保持 `false`。

2. Owned market filter
   - 传入当前商户拥有的 secondary market id。
   - 只返回该 market 的 membership 和 market row。
   - 不返回没有对应 market 数据的公告和配送 profile。

3. Required table missing
   - 缺少 `china_market_membership` 时返回 `undefined`。
   - 由 route 维持现有 fallback 行为。

4. No seller membership
   - DB 表存在但当前 seller 没有 membership。
   - repository rows 为空。
   - `buildVendorMarketContextFromRepositoryRows()` 保持 `static_fallback`。

## 安全边界

本轮没有：

- 修改 route handler、鉴权、写入接口或响应安全边界。
- 修改 migration、生产 seed 或真实数据库。
- 修改 Admin、Vendor、Storefront UI。
- 接入真实支付、短信、IM、物流、直播或 AI provider。
- 改变 checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 验证

已验证：

- `bun --cwd packages/api test:unit -- --runTestsByPath src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts`: passed，1 suite / 10 tests.
- `bunx tsc --noEmit -p packages/api/tsconfig.json`: passed.
- `git diff --check`: passed.
- `prettier --check` for task/doc/queue/helper/test files: passed.
