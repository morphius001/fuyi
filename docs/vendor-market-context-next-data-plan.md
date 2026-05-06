# Vendor Market Context Next Data Plan

更新时间：2026-05-07 Asia/Shanghai

## 目标

规划 Vendor market context 从 static adapter + seller metadata 过渡到真实 market membership 数据源的路径。

本计划只做文档，不写 migration、不新增真实数据表、不修改运行时业务逻辑。

## 当前状态

已完成：

- `ChinaMarketReadModelService`
- `buildChinaVendorMarketContext()`
- `GET /vendor/china/market-context`
- Vendor client fallback / `market_id` 查询参数
- API + Vendor 合并后验证

当前限制：

- 市场、档口、配送 profile 仍来自 static adapter 和 seller metadata。
- 没有真实 `market` / `market_membership` / `market_announcement` / `market_delivery_profile` migration。
- Vendor route 第一版只能表达当前 seller 的静态上下文，不能作为权限、履约、配送、结算或订单归属来源。

## 推荐 PR 顺序

### PR AZ：Market Membership Schema Design Finalization

范围：

- 整理最终 schema 字段、索引、唯一约束、软删除策略。
- 明确 market、seller membership、stall/booth、announcement、business hours、delivery profile 的关系。
- 只写 docs，不写 migration。

重点字段：

- market：名称、slug、省市区、地址、营业状态、时区、公告状态。
- membership：marketId、sellerId、boothNo、stallName、isPrimary、status、merchantTypeKeys。
- delivery profile：deliveryType、enabled、displayName、serviceAreaNote、cutoffTime、merchantSelectable、runtimeEnabled false。

### PR BA：Market Membership Migration Skeleton

范围：

- 新增 migration skeleton 和模型文件。
- 不接 Vendor route。
- 不改 checkout、shipping options、order、fulfillment、payment、settlement、commission、permission。

验证：

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run build
git diff --check
```

门禁：

- migration 必须可回滚。
- 不写生产 seed。
- 不迁移真实商户数据。

### PR BB：Read Model Repository Adapter

范围：

- 新增 repository adapter，把真实 tables 转成 `ChinaMarketReadModelSeed`。
- 保留 static adapter fallback。
- 不改变 Storefront/Admin/Vendor route 的响应合同。

验证：

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- <新增 adapter 单测>
cd packages/api && bun run build
git diff --check
```

### PR BC：Vendor Route Data Source Switch

范围：

- `GET /vendor/china/market-context` 优先读取 repository adapter。
- repository 不可用或无数据时继续 fallback 到 static adapter / empty context。
- 继续只读。

禁止：

- 不允许 Vendor 端写 market membership。
- 不允许通过 query 传 sellerId。
- 不允许影响 checkout shipping options 或履约。

### PR BD：Admin Readonly Market Membership View

范围：

- Admin 只读展示真实 membership 数据。
- 不提供编辑、发布、开通、停用。
- 为后续 Admin 写入 API 做视觉和数据验收准备。

### PR BE：Post-Migration Validation

范围：

- API typecheck/build。
- migration smoke check。
- market read model adapter 单测。
- Admin/Vendor/Storefront read-only API 验证。
- 安全边界复核。

## 高风险边界

以下内容必须拆成单独高风险串行任务，不能混入以上 PR：

- 市场配送规则影响 checkout shipping options。
- 商户端或后台写入 membership 后立即影响订单、履约、结算或权限。
- 真实配送供应商接单。
- 真实快递打印 / 电子面单。
- 真实支付、退款、对账、商家结算、佣金。
- 真实短信、IM、直播、AI provider。

## 数据迁移注意事项

- 现有 seller metadata 只能作为开发/测试迁移输入参考，不能默认覆盖生产数据。
- 多市场商户必须支持多个 membership，其中只能有一个 primary membership 或按 market 维度有唯一 primary。
- boothNo 在同一 market 内应可配置唯一约束策略；如果存在历史重复，先进入冲突报告，不强行迁移。
- 商户类型要支持普通经营商户、物料供应商、配送供应商、养殖户、种植户、种苗供应商、外地批发商。
- 公告 audience 必须区分 consumer、merchant、delivery_supplier、all。

## 回滚策略

- Schema PR 必须提供 down migration 或等价回滚说明。
- Route data source switch 必须保留 static adapter fallback。
- Admin/Vendor/Storefront UI 必须在真实数据为空时继续可用。
- 发现影响订单、支付、履约、结算或权限时，立即回滚 route switch。

## 队列建议

第二十九轮建议：

1. `market-membership-schema-finalization`：docs-only，最终 schema 设计。
2. `market-membership-migration-skeleton`：migration skeleton，不接 route。
3. `market-read-model-repository-adapter`：真实数据 adapter + 单测。
4. `vendor-market-context-data-source-switch`：Vendor route 数据源切换，保留 fallback。
