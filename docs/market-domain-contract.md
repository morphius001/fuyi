# Market Domain Contract

更新时间：2026-05-08 17:06 Asia/Shanghai

## 目标

本合同定义中国大陆多市场生鲜/海鲜平台的市场域边界。它服务于：

- 多市场切换。
- 商户跨市场经营。
- 档口号和档口状态。
- 市场营业时间和公告。
- 市场统一配送、商户自配送、自提。
- 物料供应商、配送供应商、养殖户、种植户、种苗供应商、外地批发商。

本合同不直接改变 checkout、订单、支付、退款、结算、佣金或权限。

## 核心实体

### Market

市场是平台运营单位，例如“三门海鲜市场”。

建议字段：

- `id`
- `code`
- `slug`
- `name`
- `short_name`
- `status`: `draft` / `active` / `paused` / `closed`
- `province`
- `city`
- `district`
- `street`
- `address_detail`
- `timezone`: 默认 `Asia/Shanghai`
- `announcement_summary`
- `operator_owner`
- `visibility`: `public` / `private` / `pilot`
- `created_at`
- `updated_at`

只读阶段：

- 可展示市场名称、地址、营业提示、公告摘要。
- 不让 status 影响真实访问、订单或权限。

写入阶段：

- 必须有 Admin 审计。
- 必须有 draft / publish。
- publish 不得直接影响 checkout shipping options，除非进入单独高风险任务。

### MarketBusinessHours

营业时间按市场配置。

建议字段：

- `market_id`
- `weekday`
- `open_time`
- `close_time`
- `is_closed`
- `effective_from`
- `effective_to`
- `note`

例外规则：

- 临时休市。
- 节假日。
- 天气原因。
- 延长营业。

边界：

- 只读阶段只展示。
- 不阻止消费者下单。
- 不自动改变配送时段。

### MarketAnnouncement

市场公告用于展示运营通知。

建议字段：

- `market_id`
- `title`
- `content`
- `severity`: `info` / `warning` / `urgent`
- `audience`: `consumer` / `merchant` / `operator` / `all`
- `starts_at`
- `ends_at`
- `status`: `draft` / `published` / `archived`

边界：

- 公告不改变业务逻辑。
- 不能用公告承载密钥、敏感配置或 Provider 参数。

### Stall

档口是商户在市场中的经营位置。

建议字段：

- `id`
- `market_id`
- `seller_id`
- `stall_no`
- `area`
- `floor`
- `location_hint`
- `status`: `pending` / `active` / `paused` / `closed`
- `main_categories`
- `display_priority`
- `created_at`
- `updated_at`

边界：

- 一个商户可以有多个档口。
- 一个商户可以跨多个市场。
- 档口状态只读阶段不影响真实订单、结算或权限。

### SellerMarketMembership

商户与市场的关系。

建议字段：

- `seller_id`
- `market_id`
- `membership_status`: `pending_review` / `approved` / `rejected` / `suspended`
- `seller_market_role`: `merchant` / `materials_supplier` / `delivery_supplier` / `farmer` / `breeder` / `seedling_supplier` / `regional_wholesaler`
- `approved_at`
- `approved_by`
- `rejection_reason`
- `suspended_reason`

边界：

- 只读阶段用于展示和筛选。
- 不改变真实权限。
- 不改变订单归属。
- 不改变结算主体。

## 商户角色

### 普通商品商户

卖海鲜、水产、水果、蔬菜等商品。

能力：

- 商品展示。
- 手机快速上架草稿。
- 店铺主页。
- 可选统一配送 / 自配送 / 自提展示。

不能默认拥有：

- 物料接单。
- 配送接单。
- 结算规则修改。
- 权限管理。

### 物料供应商

面向商户卖泡沫箱、包装箱、冰袋、冰块等。

边界：

- 主要面向商户，不应放到消费者首页前排。
- 是否允许自接单由后台开关决定。
- 不混入普通消费者商品流。

### 配送供应商

提供市场配送或商户配送服务。

边界：

- 可作为配送能力提供方。
- 不等于快递 Provider。
- 不直接改变 checkout shipping options，除非进入履约高风险任务。

### 养殖户 / 种植户

上游供给方，对接商户。

边界：

- 面向商户或平台采购。
- 不直接面向消费者售卖，除非被开通普通商户角色。

### 种苗供应商

服务养殖户、种植户和商户。

边界：

- 属于供应链上游能力。
- 不混入消费者生鲜首页。

### 外地批发商

直接对接本地商户补充货源。

边界：

- 面向商户或平台。
- 可展示供货能力，但不默认进入消费者零售流。

## 配送 Profile

配送 profile 表达市场和商户的配送能力。

建议字段：

- `market_id`
- `seller_id` 可为空；为空表示市场级。
- `supports_market_delivery`
- `supports_seller_delivery`
- `supports_self_pickup`
- `delivery_supplier_ids`
- `delivery_time_windows`
- `cold_chain_required`
- `packaging_requirements`
- `status`: `draft` / `active` / `paused`

边界：

- 只读阶段只展示在市场、商户、档口层。
- 不展示在商品卡片层作为强制能力。
- 不改变 cart total。
- 不改变 shipping options。
- 不创建履约单。

## Storefront 展示规则

- 首页可以展示市场切换、市场公告、店铺/档口和商品。
- 市场物料不放在消费者首页前排。
- 提货卡独立入口，不放在首页主商品流。
- 直播最多作为商户/档口“正在直播”状态。
- 自提/配送能力应展示在商户/档口层，不应写在商品标题旁作为商品属性。

## Admin 展示规则

- Admin 是平台运营后台。
- 市场配置先只读。
- 模块开关先只读。
- 商户类型开通必须有审核、审计和回滚。
- 不让开关直接改变结算、权限、订单或支付。

## Vendor 展示规则

- Vendor 是商户后台。
- 商户需要看到自己属于哪些市场、哪些档口、哪些角色。
- 手机端快速上架只生成草稿。
- AI 一句话上架只能生成草稿，必须商户确认。
- 物料供应商 / 配送供应商要有独立入口，不混成普通商品商户默认能力。

## 高风险边界

必须单独串行：

- 真实市场写 API。
- Admin 发布市场配置。
- 商户市场关系影响权限。
- 商户市场关系影响订单归属。
- 配送 profile 影响 checkout。
- 运费计算。
- 订单履约。
- 快递打印真实出单。
- 商户结算。
- 佣金。

## 推荐 PR 顺序

1. `market-domain-read-model-contract`
   - 新增 TypeScript view shape。
   - 不新增 migration。
   - 不新增 route。

2. `merchant-role-capability-readiness`
   - docs-only。
   - 定义角色能力矩阵。

3. `admin-market-readiness-panel-plan`
   - docs-only。
   - 定义 Admin 只读市场 readiness 面板。

4. `vendor-market-context-readiness-plan`
   - docs-only。
   - 定义 Vendor 商户市场关系展示。

5. `storefront-market-discovery-readiness-plan`
   - docs-only。
   - 定义 Storefront 如何展示市场域，不影响购物车和结算。

## 验收

每个后续 PR 必须说明：

- 修改文件。
- 是否只读。
- 是否影响 checkout / order / settlement / permission。
- 验证命令。
- 回滚方式。
