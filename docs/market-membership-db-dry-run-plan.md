# Market Membership DB Dry-Run Plan

更新时间：2026-05-07 Asia/Shanghai

## 目标

在真实启用 `china_market_membership` 相关表之前，先完成本地和预发环境的 migration dry-run、rollback、空表兼容、fallback 和只读 API 验证。

本文件只做计划，不运行 migration，不修改数据库，不写 seed，不启用真实业务流程。

## 适用对象

- `china_market`
- `china_market_membership`
- `china_seller_role`
- `china_market_announcement`
- `china_market_business_hour`
- `china_market_delivery_profile`

## 前置门禁

执行前必须确认：

- 当前环境不是生产环境，或已经由负责人明确进入预发 dry-run。
- 已备份数据库或使用可丢弃的测试数据库。
- `DATABASE_URL` 指向 dry-run 数据库。
- 没有真实支付、订单、退款、结算、佣金、权限或履约流程依赖这些表。
- Vendor market context route 的 fallback 仍保留。
- Admin 只读页不会提供保存、发布、启用、禁用操作。

## Dry-Run 步骤

1. 初始化空 dry-run 数据库。
2. 启动 API 依赖安装和类型生成。
3. 运行 migration dry-run 或在可丢弃数据库执行 migration。
4. 检查 6 张表是否存在。
5. 检查关键约束：
   - `china_market.slug` partial unique。
   - `china_market.status` check。
   - `china_market_membership.status` check。
   - `china_seller_role.status` check。
   - `china_market_announcement.audience/status/severity` check。
   - `china_market_business_hour.weekday` check。
   - `china_market_delivery_profile.delivery_type` check。
   - `china_market_delivery_profile.checkout_impact = 'none'` check。
6. 插入最小测试数据，不使用真实商户、真实手机号、真实地址或真实密钥。
7. 验证 repository adapter 能读取 rows 并映射到 `ChinaMarketReadModelSeed`。
8. 验证 `GET /vendor/china/market-context`：
   - 表不存在时 fallback。
   - 表存在但当前 seller 无 membership 时 fallback。
   - 当前 seller 有 membership 时返回 repository。
   - `market_id` 只过滤当前 seller 的市场。
9. 验证 Admin 市场详情只读页：
   - market detail ready。
   - empty memberships。
   - fallback/error。
10. 记录所有 SQL、日志、截图和回滚结果。

## Rollback 步骤

在 dry-run 数据库中验证：

1. 运行 down migration 或等价 rollback。
2. 确认 6 张表按依赖顺序删除。
3. 确认现有 seller、product、order、payment、refund、settlement、commission、permission 表不受影响。
4. 再次启动 API build。
5. 再次访问 Vendor market context，确认 fallback 不阻断页面。

## 最小测试数据规则

测试数据只能使用示例：

- 市场：三门海鲜市场 / 台州 / 三门。
- seller：`sel_dry_run_001`。
- 档口：`A区18号`。
- role：`seafood_stall`。
- delivery type：`market_pickup`、`market_unified_delivery`。

禁止：

- 真实商户资料。
- 真实手机号。
- 真实身份证、营业执照、许可证号。
- 真实支付单号、退款单号、物流单号。
- 真实短信、IM、物流、直播或 AI provider credential。

## 验收标准

必须全部满足才允许进入下一步真实数据接入：

- Migration up/down 均可重复验证。
- 6 张表和约束符合 schema 文档。
- API typecheck 和 Medusa build 通过。
- Vendor route 三态通过：repository、static fallback、market filter empty。
- Admin 只读页三态通过：ready、empty、fallback/error。
- 未出现支付、订单、退款、结算、佣金、权限、履约相关 diff。
- 回滚后系统仍能启动。

## 后续拆分

1. `market-membership-local-migration-dry-run`: 本地 dry-run 执行和记录。
2. `market-membership-seed-fixture`: 仅测试 fixture，不进生产 seed。
3. `vendor-market-context-db-qa`: Vendor route repository/fallback 三态验证。
4. `admin-market-membership-browser-qa`: Admin 市场详情 ready/empty/fallback 浏览器截图。
