# Market Data Model Implementation Plan

更新时间：2026-05-07 Asia/Shanghai

## 结论

下一阶段应该先把“市场、商户、档口、商户类型”做成真实可查询的数据模型，再让 Storefront、Admin、Vendor 逐步读取这些数据。

本计划只做落地拆分，不写业务代码。任何影响 checkout、订单、支付、退款、结算、佣金、权限、真实配送履约的逻辑，都必须另开高风险串行 PR。

## 当前基线

主线已经具备第一层只读链路：

- Storefront 有 `/store/china/discovery`，店铺来自 `seller`，类目来自 `product_category`，市场仍是静态配置契约。
- Storefront 有 `/store/china/sellers/:handle/products`，可以按档口读取 seller metadata 和 product ids。
- Seed 已把 demo seller 写入市场名、档口号、履约方式、公告、资质等 metadata。
- Admin/Vendor 已有 capability view，但它不是权限控制，也不是模块开关真实配置。

因此下一步不是继续堆静态 UI，而是把这些 metadata 和静态配置迁到可审计、可回滚、可逐步生效的读模型。

## 数据模型分层

### 第一层：只读市场目录

目标：先让前台、Admin、Vendor 都能稳定读取市场和档口关系。

建议模型：

- `china_market`
- `china_market_membership`
- `china_seller_role`
- `china_market_announcement`
- `china_market_business_hours`
- `china_market_delivery_profile`

第一层只读，不影响商品可买性、配送选项、订单履约或权限。

### 第二层：Admin 配置草稿

目标：让平台运营可以维护市场资料、档口关系、公告和营业时间草稿。

关键边界：

- 可以保存 draft。
- 可以预览 effective view。
- 必须记录 operator、时间、差异和原因。
- 不直接影响 checkout、权限或订单。

### 第三层：业务生效

目标：让市场配置真正影响前台展示、商户工作台、配送规则和运营统计。

这层必须串行推进，并且每个入口都要单独验收：

- 商品可见性。
- 市场/档口筛选和排序。
- 商户菜单与角色权限。
- checkout shipping options。
- 订单履约状态。
- 运费和配送服务范围。

## 建议表与字段

### `china_market`

| 字段 | 说明 | 第一阶段用途 |
| --- | --- | --- |
| `id` | 市场 ID | 主键 |
| `name` | 市场名 | Storefront/Admin/Vendor 展示 |
| `slug` | 前台路径标识 | `/markets/:slug` |
| `province` | 省 | 地址展示 |
| `city` | 市 | 地址展示 |
| `district` | 区县 | 地址展示 |
| `address` | 详细地址 | 只读展示 |
| `status` | draft/open/paused/closed | 只读筛选 |
| `timezone` | 默认 Asia/Shanghai | 时间展示 |
| `metadata` | 扩展字段 | 兼容特殊市场 |

### `china_market_membership`

| 字段 | 说明 | 第一阶段用途 |
| --- | --- | --- |
| `id` | membership ID | 主键 |
| `market_id` | 市场 ID | 关联市场 |
| `seller_id` | Mercur seller ID | 关联商户 |
| `booth_no` | 档口号 | 消费端和后台展示 |
| `stall_name` | 档口名 | 店铺页展示 |
| `is_primary` | 默认市场身份 | 多市场商户默认展示 |
| `status` | pending/open/paused/closed | 只读状态 |
| `main_category_ids` | 主营类目 | 只读发现 |
| `metadata` | 扩展字段 | 兼容旧 seller metadata |

### `china_seller_role`

| 字段 | 说明 | 第一阶段用途 |
| --- | --- | --- |
| `id` | role row ID | 主键 |
| `seller_id` | Mercur seller ID | 关联商户 |
| `role_key` | 商户类型 | 区分海鲜档口、物料供应商、配送供应商等 |
| `status` | pending/active/paused/rejected | 只读状态 |
| `market_id` | 可选市场范围 | 支持某市场内角色 |
| `metadata` | 扩展字段 | 资质占位 |

角色 key 建议保留：

- `seafood_stall`
- `fruit_vegetable`
- `materials_supplier`
- `delivery_supplier`
- `farmer`
- `grower`
- `seedling_supplier`
- `regional_wholesaler`

### `china_market_announcement`

用于市场公告，不等同营销活动。

字段：

- `market_id`
- `audience`: `consumer` / `merchant` / `delivery_supplier` / `all`
- `title`
- `content`
- `severity`: `info` / `warning` / `urgent`
- `starts_at`
- `ends_at`
- `status`

### `china_market_business_hours`

用于市场营业时间，不直接控制商品是否能下单。

字段：

- `market_id`
- `weekday`
- `opens_at`
- `closes_at`
- `is_closed`
- `effective_from`
- `effective_to`
- `note`

### `china_market_delivery_profile`

用于只读展示配送能力，不直接影响 checkout。

字段：

- `market_id`
- `delivery_type`: `market_pickup` / `merchant_self_delivery` / `market_unified_delivery` / `delivery_supplier` / `cold_chain_express`
- `enabled`
- `display_name`
- `service_area_note`
- `cutoff_time`
- `metadata`

## Metadata 迁移策略

当前 `seller.metadata` 中已有：

- `market_name`
- `market_slug`
- `booth_no`
- `fulfillment_methods`
- `announcement`
- `credentials`

迁移策略：

1. 保留 metadata 作为 fallback，不立刻删除。
2. 新建只读模型后，seed 同时写真实模型和 metadata。
3. Store API 优先读真实模型，缺失时回退 metadata。
4. 观察一轮后再把 metadata 降级为兼容字段。
5. 上线前禁止依赖 seed metadata 作为生产配置来源。

## API 拆分

### PR K1：只读市场模型类型与 migration 计划

范围：

- 设计 migration 文件名、模型字段、索引、唯一约束和 link 关系。
- 仍不写代码。

验证：

```bash
git diff --check -- docs/market-data-model-implementation-plan.md
```

### PR K2：Market Module skeleton

范围：

- `packages/api/src/modules/china-market/**`
- 只定义模块、数据模型、service skeleton 和 migration。
- 不接 Admin 写接口。
- 不影响 checkout、订单、支付、权限。

建议验证：

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && ../../node_modules/.bin/medusa build
```

### PR K3：Seed/demo 数据双写

范围：

- Seed 写入 demo market、membership、seller roles、公告、营业时间和只读配送 profile。
- 保持 seller metadata fallback。

验证：

```bash
.codex/scripts/seed-api.sh
curl -H "x-publishable-api-key: <local-pk>" http://127.0.0.1:9000/store/china/discovery
```

### PR K4：Store 只读市场 API

范围：

- `GET /store/china/markets`
- `GET /store/china/markets/:slug`
- `GET /store/china/markets/:slug/sellers`
- Discovery API 优先读取真实市场模型。

非目标：

- 不做搜索排序。
- 不做距离计算。
- 不做库存聚合。
- 不影响 checkout。

### PR K5：Admin 只读市场视图

范围：

- Admin 读取市场、档口、商户类型、公告、营业时间和配送 profile。
- 第一版只读。

非目标：

- 不提供保存按钮。
- 不改变权限。
- 不让模块开关生效。

### PR K6：Vendor 只读市场身份视图

范围：

- Vendor 显示商户所属市场、档口号、商户类型、可用履约方式。
- 多市场商户可以查看不同市场身份。

非目标：

- 不允许商户直接切换真实角色。
- 不允许商户修改配送规则并影响 checkout。

### PR K7：Admin 草稿写入

范围：

- Admin 创建/编辑市场、membership、公告和营业时间草稿。
- 必须有审计、幂等、字段校验和回滚。

风险：

- 中高。只能在 K2-K6 稳定后推进。

### PR K8：业务生效桥

范围：

- 市场模型影响前台展示排序、商户菜单、配送选项等。

风险：

- 高。必须拆成多个串行 PR，不能和 K7 混合。

## 索引与约束建议

建议唯一约束：

- `china_market.slug`
- `china_market_membership.market_id + seller_id + booth_no`
- `china_seller_role.seller_id + role_key + market_id`

建议索引：

- `china_market.status`
- `china_market.city + district`
- `china_market_membership.market_id + status`
- `china_market_membership.seller_id`
- `china_seller_role.role_key + status`

## 审计与回滚

所有 Admin 写入阶段必须记录：

- operator id
- action
- before snapshot
- after snapshot
- request id 或 idempotency key
- reason
- created_at

回滚策略：

- 草稿配置可以直接废弃。
- 已发布配置必须产生新版本，不能原地覆盖。
- 影响展示的数据可以快速回退到上一版本。
- 影响 checkout 或订单的数据不能通过普通回滚处理，必须走高风险变更流程。

## 验收路线

文档阶段：

```bash
git diff --check -- docs/market-data-model-implementation-plan.md docs/china-localization-task-list.md project-ledger .codex/queue.md
```

只读模型阶段：

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && ../../node_modules/.bin/medusa build
```

只读 API 阶段：

```bash
curl -H "x-publishable-api-key: <local-pk>" http://127.0.0.1:9000/store/china/markets
curl -H "x-publishable-api-key: <local-pk>" http://127.0.0.1:9000/store/china/discovery
```

三端读取阶段：

```bash
cd apps/admin && bun run lint && bun run build
cd apps/vendor && bun run lint && bun run build
cd apps/storefront && bun run build
```

## 风险边界

不要在市场模型 PR 中混入：

- checkout shipping options 生效。
- cart total 或运费计算。
- 订单履约状态。
- 支付成功状态。
- 退款。
- 对账。
- 结算、payout、commission。
- 权限、RBAC、菜单真实显隐。
- 真实物流、快递打印、短信、IM、直播或 AI 服务。

## 下一步

完成本文档后，先执行 `admin-module-config-read-model`，把模块开关真实只读配置模型和市场模型边界对齐。然后执行 `vendor-draft-product-readwrite-plan` 和 `storefront-real-discovery-bridge`，形成一组不会破坏交易链路的数据落地蓝图。
