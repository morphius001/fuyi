# Market Membership Schema Finalization

更新时间：2026-05-07 Asia/Shanghai

## 目标

最终确认中国本地市场 / 商户 / 档口 / 公告 / 营业时间 / 配送展示能力的数据模型，作为后续 migration skeleton 的输入。

本文件只做 schema 设计，不写 migration、不新增真实表、不接 route、不迁移生产数据。

## 设计原则

- 平台支持多市场，不写死单一市场。
- 一个商户可以跨多个市场经营。
- 商户在每个市场可以有档口号、档口名称、经营状态和商户类型。
- 物料供应商、配送供应商、养殖户、种植户、种苗供应商、外地批发商要能单独表达。
- 配送 profile 第一阶段只做展示，不影响 checkout shipping options。
- 公告 audience 必须区分消费者、商户、配送供应商和全部。
- 所有表都要支持软删除、创建时间、更新时间。
- 所有运行时业务影响都必须通过后续独立任务和审计，不由本 schema 自动触发。

## 表结构草案

### china_market

用途：市场主数据。

字段建议：

- `id`: text primary key
- `name`: text not null
- `slug`: text not null unique
- `province`: text nullable
- `city`: text not null
- `district`: text nullable
- `address`: text nullable
- `status`: text not null，`draft | open | paused | closed`
- `timezone`: text not null default `Asia/Shanghai`
- `service_range_note`: text nullable
- `metadata`: jsonb not null default `{}`
- `created_at`, `updated_at`, `deleted_at`

索引：

- unique `slug` where `deleted_at is null`
- `(status, city)`

### china_market_membership

用途：商户与市场的关系、档口信息、主市场标记。

字段建议：

- `id`: text primary key
- `market_id`: text not null
- `seller_id`: text not null
- `seller_handle`: text nullable，冗余只读展示，不作为身份来源
- `seller_name`: text nullable，冗余只读展示
- `booth_no`: text not null
- `stall_name`: text nullable
- `is_primary`: boolean not null default false
- `status`: text not null，`pending | open | paused | closed`
- `main_category_ids`: jsonb not null default `[]`
- `merchant_type_keys`: jsonb not null default `[]`
- `metadata`: jsonb not null default `{}`
- `created_at`, `updated_at`, `deleted_at`

索引 / 约束：

- `(seller_id, market_id)` non-unique，允许未来一个商户在同一市场多档口；第一版业务层可限制。
- `(market_id, booth_no)` 建议在数据清洗后做 partial unique；如果历史档口重复，先生成冲突报告。
- `(seller_id, is_primary)` 不能直接全局 unique；多市场场景下需要先明确“全局主市场”还是“按市场主档口”。
- `(market_id, status)`

身份边界：

- Vendor API 必须从 `req.seller_context.seller_id` 获取 seller。
- 前端传入的 `sellerId` 永远不能作为可信身份。
- Admin API 才能跨 seller 查询 membership。

### china_seller_role

用途：表达商户 / 供应商类型。

字段建议：

- `id`: text primary key
- `seller_id`: text not null
- `market_id`: text nullable，允许平台级角色或市场级角色
- `role_key`: text not null
- `status`: text not null，`pending | active | paused | rejected`
- `metadata`: jsonb not null default `{}`
- `created_at`, `updated_at`, `deleted_at`

推荐 role key：

- `seafood_stall`
- `frozen_goods`
- `dry_goods`
- `fruit_vegetable`
- `materials_supplier`
- `delivery_supplier`
- `farmer`
- `grower`
- `seedling_supplier`
- `regional_wholesaler`

注意：

- `role_key` 只解释业务身份，不等于 RBAC 权限。
- 是否显示菜单要由后续 module config / capability view 决定。

### china_market_announcement

用途：市场公告。

字段建议：

- `id`: text primary key
- `market_id`: text not null
- `audience`: text not null，`consumer | merchant | delivery_supplier | all`
- `title`: text not null
- `content`: text not null
- `severity`: text not null，`info | warning | urgent`
- `status`: text not null，`draft | published | archived`
- `published_at`: timestamptz nullable
- `expires_at`: timestamptz nullable
- `metadata`: jsonb not null default `{}`
- `created_at`, `updated_at`, `deleted_at`

索引：

- `(market_id, audience, status)`
- `(published_at, expires_at)`

### china_market_business_hour

用途：市场营业时间。

字段建议：

- `id`: text primary key
- `market_id`: text not null
- `weekday`: integer not null，0-6
- `opens_at`: text not null
- `closes_at`: text not null
- `is_closed`: boolean not null default false
- `note`: text nullable
- `metadata`: jsonb not null default `{}`
- `created_at`, `updated_at`, `deleted_at`

索引 / 约束：

- unique `(market_id, weekday)` where `deleted_at is null`

### china_market_delivery_profile

用途：市场配送展示能力。

字段建议：

- `id`: text primary key
- `market_id`: text not null
- `delivery_type`: text not null
- `enabled`: boolean not null default true
- `display_name`: text not null
- `service_area_note`: text nullable
- `cutoff_time`: text nullable
- `merchant_selectable`: boolean not null default false
- `runtime_enabled`: boolean not null default false
- `checkout_impact`: text not null default `none`
- `metadata`: jsonb not null default `{}`
- `created_at`, `updated_at`, `deleted_at`

推荐 delivery type：

- `market_pickup`
- `merchant_self_delivery`
- `market_unified_delivery`
- `delivery_supplier`
- `cold_chain_express`

硬性边界：

- 第一阶段 `runtime_enabled` 必须为 false。
- 第一阶段 `checkout_impact` 必须为 `none`。
- 不写 checkout shipping options。
- 不创建 fulfillment。
- 不生成真实物流单或电子面单。

## Read Model 映射

真实数据进入 read model 时，应映射为现有类型：

- `china_market` -> `ChinaMarket`
- `china_market_membership` -> `ChinaMarketMembership`
- `china_seller_role` -> `ChinaSellerRole`
- `china_market_announcement` -> `ChinaMarketAnnouncement`
- `china_market_business_hour` -> `ChinaMarketBusinessHour`
- `china_market_delivery_profile` -> `ChinaMarketDeliveryProfile`

Repository adapter 应输出：

```ts
type ChinaMarketReadModelSeed = {
  markets: ChinaMarket[]
  memberships: ChinaMarketMembership[]
  roles: ChinaSellerRole[]
  announcements: ChinaMarketAnnouncement[]
  businessHours: ChinaMarketBusinessHour[]
  deliveryProfiles: ChinaMarketDeliveryProfile[]
}
```

## Migration 前门禁

进入 migration skeleton 前必须确认：

- 表名不会和 Mercur / Medusa core 冲突。
- down migration 或回滚说明明确。
- 不自动从生产 seller metadata 迁移数据。
- 不新增真实 seed。
- 不接 Vendor route data source switch。
- 不改 checkout、订单、履约、支付、退款、结算、佣金、权限。

## 后续拆分

1. `market-membership-migration-skeleton`
2. `market-read-model-repository-adapter`
3. `vendor-market-context-data-source-switch`
4. `admin-market-membership-readonly-view`
5. `market-membership-post-migration-validation`
