# 提货卡系统后端架构设计

日期：2026-05-03
范围：提货卡作为预先获得的指定权益提货凭证时，后端模型、流程、安全、状态机、三端职责、订单/支付边界和后续 PR 拆分

## 核心结论

提货卡不是消费者在线购买商品时使用的支付工具。对消费者来说，提货卡是已经预先获得的指定权益提货凭证。用户通过卡号 / 卡密 / 二维码证明自己持有某个权益，系统识别该权益可提取的固定或可选内容，用户补齐规格、数量、地址或自提时间后提交提货申请，平台或商家再按提货单履约。

提货卡明确不是：

- 支付方式或 payment provider。
- 优惠券、满减券、折扣券。
- 储值卡、余额、账户资产。
- 购物车抵扣、订单金额抵扣或营销促销工具。
- 普通订单的已支付事实来源。

设计原则：

- 独立建设 `pickup-card` 能力，不直接修改 Mercur / Medusa core。
- 不改变普通订单、支付、退款、结算、佣金、权限逻辑。
- 提货卡兑换只产生提货权益核销和提货履约需求，不产生线上支付成功事件。
- 提货单可以复用普通履约、配送、物流能力，但必须与 consumer order 的支付语义隔离。
- 卡密、二维码 token、手机号、地址、面单、操作日志均按高敏或敏感数据处理。

## 消费者流程

标准消费者流程：

1. 用户进入提货入口，输入卡号 / 卡密，或扫描实体卡二维码。
2. 系统做格式校验、频控、防爆破和风险识别，不暴露“卡号是否存在”等可辅助撞库的信息。
3. 系统识别可提权益：卡种、批次、可提商品、可选套餐、规格范围、数量规则、有效期、履约方式。
4. 前台展示固定提货内容，或展示可选提货内容：
   - 固定内容：例如固定礼盒、固定 SKU、固定数量。
   - 可选内容：例如同一卡种内可选择口味、规格、发货批次、自提门店或自提时间段。
5. 用户确认规格、数量、联系人、手机号、中国大陆收货地址，或确认自提门店 / 自提时间。
6. 用户提交提货申请。后端使用幂等键处理重复提交。
7. 系统在事务或可补偿 workflow 中创建 `PickupRedemption`，核销 `PickupCardCredential`，快照 `PickupEntitlement`。
8. 系统生成 `PickupFulfillmentOrder`，进入待备货、待发货或待自提核销状态。
9. 用户查看提货单履约进度：已提交、备货中、已发货、待自提、已核销、已签收、异常关闭。

失败或异常流程：

- 卡号/卡密错误：返回统一安全文案，记录失败尝试和风控事件。
- 已冻结、已作废、已过期、已核销：返回不可提货文案，不暴露内部细节。
- 库存或可履约能力不足：提货申请进入异常或人工处理，不把提货卡当支付订单回滚。
- 用户重复提交：返回同一个成功提货结果或当前处理中状态，不重复核销。

## 三端职责

### Storefront

Storefront 负责消费者提货申请：

- 卡号 / 卡密输入。
- 二维码扫码入口。
- 可提权益识别后的内容展示。
- 固定 / 可选提货内容确认。
- 规格、数量、地址、自提门店和自提时间确认。
- 提货申请提交和幂等重试。
- 提货单进度查询。

Storefront 不负责：

- 把提货卡作为支付方式加入 checkout。
- 把提货卡作为优惠券、折扣或购物车抵扣。
- 展示后台批次、完整卡号、卡密、风控原因、内部履约成本。

### Vendor

Vendor 负责商家侧提货履约：

- 查看归属自己的 `PickupFulfillmentOrder`。
- 备货、缺货反馈、发货、录入物流。
- 自提场景下核销自提码或确认到店提货。
- 处理履约异常和商家备注。

Vendor 不负责：

- 创建卡种、批次或导出制卡文件。
- 查看卡密、完整批次、其他商家的提货单。
- 触发支付、退款、结算、佣金状态。

### Admin

Admin 负责平台运营和风控：

- 管理卡种 `PickupCardType`。
- 管理批次 `PickupCardBatch`。
- 管理卡号凭证 `PickupCardCredential` 的生成、激活、冻结、解冻、作废、过期。
- 配置提货权益 `PickupEntitlement`。
- 查看和处理兑换 `PickupRedemption`。
- 查看和派发提货履约单 `PickupFulfillmentOrder`。
- 查看风控事件 `PickupCardRiskEvent`。
- 查看操作日志 `PickupCardOperationLog`。
- 处理批次异常、渠道异常、制卡导出、人工审核。

Admin 不负责：

- 绕过风控直接读取明文卡密。
- 把提货卡兑换标记为普通订单支付成功。
- 在低风险 UI PR 中顺带修改支付、退款、结算、佣金或 RBAC 规则。

## 后端分层

后续实现建议新增独立模块，本文档不创建代码：

```text
Storefront / Vendor / Admin
  ↓
Pickup Card API routes
  ↓
Pickup Card workflows
  ↓
Pickup Card module
  ├─ card type service
  ├─ batch service
  ├─ credential service
  ├─ entitlement service
  ├─ redemption service
  ├─ fulfillment order service
  ├─ risk service
  └─ operation log service
  ↓
Extension boundaries
  ├─ product / variant read model
  ├─ inventory reservation boundary
  ├─ fulfillment / shipment boundary
  ├─ customer / address boundary
  └─ notification boundary
```

边界要求：

- 读取商品、variant、库存、地址和履约能力时走公开扩展点或 adapter。
- 不直接写普通订单支付状态。
- 不直接调用 capture、refund、settlement、payout、commission workflow。
- 如果未来需要和 Medusa order 做关联，必须单独高风险 PR 明确字段和隔离规则。

## 数据模型建议

### PickupCardType

卡种定义一类提货权益的业务规则。

建议字段：

- `id`
- `code`：唯一编码。
- `name`
- `description`
- `status`：`draft`、`active`、`paused`、`archived`。
- `entitlement_mode`：`fixed`、`choice`、`bundle`。
- `seller_scope`：平台履约、指定商家履约、多商家拆分履约。
- `validity_policy`：固定有效期、批次继承、激活后 N 天。
- `redeem_limit_per_card`：默认 1。
- `address_required`
- `pickup_time_required`
- `inventory_policy`：`reserve_on_redemption`、`deduct_on_fulfillment`、`quota_only`。
- `risk_policy_id`
- `metadata`
- `created_by`、`updated_by`、`created_at`、`updated_at`

约束：

- 卡种生效后，不应静默修改权益内容。需要调整时创建新版本或新卡种。
- 卡种不包含售价、支付方式、折扣金额、储值余额。

### PickupCardBatch

批次对应一次制卡、发放或渠道投放。

建议字段：

- `id`
- `batch_no`：唯一批次号。
- `card_type_id`
- `quantity`
- `channel`
- `issuer`
- `status`：`draft`、`generating`、`generated`、`active`、`frozen`、`voided`、`expired`。
- `valid_from`、`valid_until`
- `activation_mode`：批次激活、单卡售出激活、生成即激活。
- `card_no_prefix`
- `secret_policy`
- `export_status`
- `exported_at`、`exported_by`
- `stats_snapshot`
- `created_by`、`updated_by`、`created_at`、`updated_at`

约束：

- 只有 `draft` 批次允许调整数量、有效期和制卡参数。
- 批次生成后不得重新生成同一批卡号。
- 冻结批次只阻止新兑换，不取消已生成提货单。
- 作废批次不物理删除卡号。

### PickupCardCredential

卡号和卡密凭证。卡号是公开识别符，卡密是秘密。

建议字段：

- `id`
- `card_no`：唯一，可带校验位。
- `batch_id`
- `card_type_id`
- `status`：`generated`、`inactive`、`active`、`frozen`、`redeemed`、`voided`、`expired`。
- `secret_hash`
- `secret_salt`
- `hash_version`
- `pepper_version`
- `qr_token_hash`
- `qr_token_version`
- `expires_at`
- `activated_at`、`activated_by`
- `frozen_at`、`frozen_by`、`freeze_reason`
- `voided_at`、`voided_by`、`void_reason`
- `redeemed_at`、`redemption_id`
- `last_attempt_at`、`failed_attempt_count`
- `created_at`、`updated_at`

约束：

- 明文卡密不得入库、不得进入日志、不得后台查询。
- 后台只展示脱敏卡号，例如前 4 后 4。
- `card_no` 唯一由数据库保证。
- 成功核销必须有唯一约束防止双花。

### PickupEntitlement

提货权益定义某类卡可提什么，是否固定，是否可选。

建议字段：

- `id`
- `card_type_id`
- `version`
- `status`：`draft`、`active`、`retired`。
- `selection_mode`：`fixed`、`single_choice`、`multi_choice`。
- `items`：商品、variant、数量、可选组、最小/最大可选数量。
- `fulfillment_mode`：配送、自提、配送或自提。
- `pickup_locations`
- `pickup_time_windows`
- `inventory_policy`
- `effective_from`、`effective_until`
- `created_by`、`updated_by`、`created_at`、`updated_at`

约束：

- `PickupRedemption` 必须保存权益快照，避免后续权益版本变化影响历史提货单。
- 可选权益需要后端校验选择范围、数量和规格，不信任前端传值。

### PickupRedemption

兑换记录，表示某张凭证被用于申请提货权益。

建议字段：

- `id`
- `redemption_no`
- `idempotency_key`
- `credential_id`
- `card_no_masked`
- `card_type_id`
- `batch_id`
- `entitlement_id`
- `entitlement_snapshot`
- `selected_items_snapshot`
- `customer_id` 或匿名兑换标识。
- `redeem_channel`：`card_no_secret`、`qr_token`、`admin_manual`。
- `contact_snapshot`
- `address_snapshot`
- `pickup_location_snapshot`
- `pickup_time_window_snapshot`
- `status`：`pending`、`risk_review`、`confirmed`、`failed`、`canceled_by_ops`、`exception`。
- `failure_reason`
- `risk_event_id`
- `fulfillment_order_id`
- `request_id`
- `ip_hash`、`device_fingerprint_hash`、`user_agent_hash`
- `created_at`、`updated_at`、`confirmed_at`、`failed_at`

约束：

- 同一 `credential_id` 只能有一个成功 `confirmed` redemption。
- 同一 `idempotency_key` 重试必须返回同一处理结果。
- 卡密错误、风控失败、已兑换等失败信息必须面向用户统一文案。

### PickupFulfillmentOrder

提货履约单。它不是普通已支付订单。

建议字段：

- `id`
- `pickup_order_no`
- `redemption_id`
- `credential_id`
- `card_type_id`
- `batch_id`
- `customer_id` 或匿名联系人信息。
- `seller_id` 或平台履约标记。
- `items_snapshot`
- `fulfillment_mode`：`shipping`、`self_pickup`。
- `shipping_address_snapshot`
- `pickup_location_snapshot`
- `pickup_time_window_snapshot`
- `status`：`pending_vendor_acceptance`、`preparing`、`ready_for_pickup`、`shipped`、`delivered`、`picked_up`、`closed`、`canceled_by_ops`、`exception`。
- `fulfillment_id`
- `tracking_no`
- `carrier_code`
- `self_pickup_verify_code_hash`
- `created_at`、`updated_at`、`fulfilled_at`、`closed_at`

约束：

- 不创建 payment collection。
- 不调用支付成功、capture 或 refund workflow。
- 可以关联履约/物流能力，但不能被解释为 consumer order 已支付。
- 多商家权益需要按 seller 拆分提货履约子单，但不改变普通订单拆单逻辑。

### PickupCardOperationLog

操作日志记录所有资产和履约状态变更。

建议字段：

- `id`
- `actor_type`：`admin`、`vendor`、`customer`、`system`、`job`。
- `actor_id`
- `action`
- `target_type`
- `target_id`
- `before_status`
- `after_status`
- `reason`
- `request_id`
- `ip_hash`
- `user_agent_hash`
- `metadata`
- `created_at`

约束：

- 卡密、二维码 token 明文、完整手机号、详细地址不得写入日志。
- 批量操作记录筛选条件、影响数量和异步任务 id。
- 日志不做业务删除，清理必须走合规归档策略。

### PickupCardRiskEvent

风控事件记录风险命中和处置结果。

建议字段：

- `id`
- `event_no`
- `risk_type`：卡密错误、爆破、批次异常、渠道异常、地址异常、设备异常、频繁扫码。
- `target_type`
- `target_id`
- `credential_id`
- `batch_id`
- `redemption_id`
- `severity`：`low`、`medium`、`high`、`critical`。
- `decision`：`allow`、`deny`、`challenge`、`freeze_card`、`freeze_batch`、`manual_review`。
- `rule_id`
- `ip_hash`
- `device_fingerprint_hash`
- `mobile_hash`
- `details`
- `created_at`
- `resolved_at`
- `resolved_by`

约束：

- 风控事件可用于运营审核，但不得泄露卡密校验细节。
- 自动冻结单卡可在规则阈值内执行；自动冻结批次需要强审计或人工确认。

## 状态机

### 卡种状态

| 状态 | 含义 | 允许流转 |
| --- | --- | --- |
| `draft` | 草稿，可编辑权益 | `active`、`archived` |
| `active` | 可用于新批次和兑换 | `paused`、`archived` |
| `paused` | 暂停新兑换或新批次 | `active`、`archived` |
| `archived` | 归档终态 | 无 |

### 批次状态

| 状态 | 含义 | 允许流转 |
| --- | --- | --- |
| `draft` | 待生成 | `generating`、`voided` |
| `generating` | 正在生成卡号/卡密 | `generated`、`voided` |
| `generated` | 已生成待激活 | `active`、`frozen`、`voided` |
| `active` | 批次可兑换 | `frozen`、`expired`、`voided` |
| `frozen` | 暂停兑换 | `active`、`voided` |
| `voided` | 作废终态 | 无 |
| `expired` | 过期终态 | 无 |

### 卡号凭证状态

| 状态 | 含义 | 允许流转 |
| --- | --- | --- |
| `generated` | 已生成未激活 | `inactive`、`active`、`voided` |
| `inactive` | 等待线下售出激活 | `active`、`voided` |
| `active` | 可提货 | `frozen`、`redeemed`、`expired`、`voided` |
| `frozen` | 暂停提货 | `active`、`voided` |
| `redeemed` | 已成功核销 | 无 |
| `voided` | 作废终态 | 无 |
| `expired` | 过期终态 | 无 |

### 兑换状态

| 状态 | 含义 | 允许流转 |
| --- | --- | --- |
| `pending` | 请求已进入处理 | `risk_review`、`confirmed`、`failed`、`exception` |
| `risk_review` | 等待人工或补充校验 | `confirmed`、`failed`、`canceled_by_ops` |
| `confirmed` | 权益核销成功 | 无 |
| `failed` | 兑换失败 | 无 |
| `canceled_by_ops` | 运营取消 | 无 |
| `exception` | 库存/履约边界异常 | `confirmed`、`failed`、`canceled_by_ops` |

### 提货单状态

| 状态 | 含义 | 允许流转 |
| --- | --- | --- |
| `pending_vendor_acceptance` | 待平台或商家接单 | `preparing`、`exception`、`canceled_by_ops` |
| `preparing` | 备货中 | `ready_for_pickup`、`shipped`、`exception` |
| `ready_for_pickup` | 待用户自提 | `picked_up`、`exception` |
| `shipped` | 已发货 | `delivered`、`exception` |
| `delivered` | 配送签收 | `closed` |
| `picked_up` | 自提核销 | `closed` |
| `closed` | 完结终态 | 无 |
| `canceled_by_ops` | 运营关闭终态 | 无 |
| `exception` | 异常待处理 | `preparing`、`canceled_by_ops`、`closed` |

## 安全要求

卡密安全：

- 卡密必须慢 hash 存储，例如 Argon2id 或 bcrypt，具体算法以实现 PR 安全评审为准。
- 使用 `secret_salt` 和环境变量/密钥管理系统中的 `pepper`。
- 记录 `hash_version` 和 `pepper_version`，支持未来轮换。
- 比对使用 constant-time compare。
- 明文卡密只允许出现在受控的制卡导出流程中，导出后系统不可反查。

脱敏显示：

- 卡号后台默认脱敏显示，只有强权限操作可查看必要部分。
- 手机号、地址、二维码 token、面单号、签收证明在日志和导出中脱敏。
- 错误响应不区分“卡不存在”和“卡密错误”。

防爆破与限流：

- 按 IP、设备、手机号、卡号、批次做失败次数限制。
- 高频错误卡密自动触发 `PickupCardRiskEvent`。
- 批次异常失败率达到阈值时进入人工审核或冻结。
- 扫码 token 多次异常访问需要限流和风控记录。

幂等与事务：

- 提货申请必须有 `idempotency_key`。
- `PickupRedemption` 成功记录对 `credential_id` 做唯一约束。
- 核销凭证、创建兑换记录、创建提货单应在同一事务或可补偿 workflow 中完成。
- 外部库存/履约能力无法单事务时，必须有 `exception` 状态和人工恢复路径。

防重复核销：

- 同一卡只能有一个成功兑换。
- 自提核销码必须 hash 存储，核销时防重复提交。
- Vendor 自提核销只能处理归属自己的提货单。
- 运营人工关闭不能绕过操作日志和权限。

操作日志：

- 卡种、批次、凭证、兑换、提货单、风控事件所有状态变更必须记录。
- 批量冻结、作废、导出制卡文件必须记录操作人、原因、请求链路和影响数量。
- 日志不可包含明文卡密或完整 token。

## 与普通订单/支付的关系

### Consumer Order

consumer order 是消费者在线购买商品形成的普通订单，通常关联购物车、支付、退款、结算、佣金和售后链路。

提货卡不能：

- 在购物车作为抵扣项。
- 在 checkout 作为支付方式。
- 把兑换成功写成普通订单 payment captured。
- 触发普通订单 refund、settlement、payout、commission。

### Pickup Fulfillment Order

`PickupFulfillmentOrder` 是提货权益核销后的履约单。

它可以：

- 使用商品和 variant 快照描述履约内容。
- 使用库存 reservation 或 fulfillment adapter。
- 使用物流 provider 或自提核销能力。
- 供 Storefront、Vendor、Admin 查询履约进度。

它不能：

- 替代 consumer order。
- 伪造普通订单已支付状态。
- 承载提货卡线下售价、面值、余额或支付流水。

如果未来为了履约复用需要关联普通订单表，必须单独高风险 PR 设计：

- 明确 `consumer_order_id` 和 `pickup_fulfillment_order_id` 的关系。
- 明确不进入 payment/refund/settlement/commission 状态机。
- 明确 UI 标识，避免运营把提货单误认为普通已支付订单。

## 库存和履约边界

库存策略必须在 `PickupCardType` 或 `PickupEntitlement` 上显式配置。

推荐默认：

- 制卡和批次激活不直接扣减真实库存。
- 提货申请确认时尝试库存占用。
- 发货或自提核销时按既定库存策略扣减。
- 库存失败进入异常，不静默吞掉，不把提货卡当普通订单退款。

履约策略：

- 平台履约由 Admin 处理。
- 商家履约由 Vendor 处理，必须按 seller 数据隔离。
- 自提需要门店、时间段和核销码。
- 配送需要中国大陆地址、联系人、手机号、物流信息。

## 风控规则建议

第一版建议内置：

- 单 IP / 单设备 / 单手机号单位时间失败次数限制。
- 单卡错误卡密次数限制。
- 批次异常失败率阈值。
- 高频扫码但不提交提货申请。
- 同一手机号或地址大批量提货预警。
- 冻结、作废、过期卡重复尝试记录。
- 渠道召回或疑似泄露批次黑名单。

风控动作：

- `allow`
- `deny`
- `challenge`
- `freeze_card`
- `freeze_batch`
- `manual_review`

## PR 拆分

### PR P0: 提货卡后端架构文档

Scope:

- 完成本架构文档。
- 纠正产品边界：提货卡是指定权益提货凭证，不是支付、优惠、储值、余额或购物车抵扣工具。
- 明确三端职责、数据模型、状态机、安全要求、普通订单/支付边界和后续 PR 顺序。

Non-goals:

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 migration。
- 不实现业务代码。

Verification:

- `git diff -- docs/pickup-card-architecture.md docs/china-localization-task-list.md`
- `git status --short -- docs/pickup-card-architecture.md docs/china-localization-task-list.md apps packages package.json bun.lock`
- 人工确认只修改允许的 docs 文件。

Risk:

- 低。仅文档变更。

### PR P1: 模型与接口草案

Scope:

- 设计 `PickupCardType`、`PickupCardBatch`、`PickupCardCredential`、`PickupEntitlement`、`PickupRedemption`、`PickupFulfillmentOrder`、`PickupCardOperationLog`、`PickupCardRiskEvent`。
- 设计 API 草案、workflow 草案、状态机、唯一约束、索引、审计字段。
- 明确 consumer order 与 pickup fulfillment order 的隔离。

Non-goals:

- 不实现真实兑换。
- 不写 UI。
- 不改支付、订单、退款、结算、佣金、权限逻辑。

Verification:

- 模型字段评审。
- 状态机表格评审。
- 幂等键、唯一约束、脱敏字段评审。

Risk:

- 中到高。模型一旦落库会成为长期约束。

### PR P2: Mock UI

Scope:

- Storefront mock 提货入口：输入卡号/卡密/扫码占位、展示 mock 权益、确认地址/自提时间、提交 mock 提货申请。
- Vendor mock 提货履约列表：备货、发货、自提核销占位。
- Admin mock 卡种、批次、凭证、风控、日志页面。

Non-goals:

- 不连接真实兑换 API。
- 不写真实卡密校验。
- 不触发真实库存、订单、支付、物流。

Verification:

- 桌面和移动端检查。
- 确认 UI 文案不把提货卡称为支付、优惠券、余额或抵扣。
- 确认 mock 数据不包含真实卡密。

Risk:

- 中。UI 可能误导产品边界，必须用文案和入口隔离纠偏。

### PR P3: Mock Provider / Mock Workflow

Scope:

- 建立 mock entitlement lookup、mock risk decision、mock inventory reservation、mock fulfillment handoff。
- 验证幂等、失败、重复提交和异常状态。
- 保持 mock-only、未接真实资产。

Non-goals:

- 不接真实卡密、库存、物流、支付、退款、结算、佣金。
- 不创建真实普通订单。

Verification:

- 单元测试：成功、失败、幂等 replay、风控拒绝、库存异常。
- 人工确认无真实 secrets、无真实 provider SDK。

Risk:

- 中。mock 是后续真实流程的边界验证，不能误接生产路径。

### PR P4: 真实模型与卡密安全

Scope:

- 落地数据库 migration。
- 实现卡密生成、hash、pepper version、constant-time compare。
- 实现制卡导出安全和操作日志。

Non-goals:

- 不开放消费者真实提货。
- 不接支付、退款、结算、佣金。

Verification:

- migration dry-run。
- 卡密 hash 单测。
- 日志和错误脱敏检查。
- 制卡导出文件生命周期检查。

Risk:

- 高。涉及真实卡资产和秘密凭据。

### PR P5: 真实提货申请流程

Scope:

- Storefront 真实验卡、权益识别、选择内容、地址/自提时间确认、提交提货申请。
- 创建 `PickupRedemption` 和 `PickupFulfillmentOrder`。
- 接入风控、幂等和事务/补偿。

Non-goals:

- 不把提货卡接入 checkout。
- 不创建 payment collection。
- 不触发普通订单退款、结算、佣金。

Verification:

- 正确卡、错误卡密、重复提交、冻结、作废、过期、已兑换、并发兑换测试。
- 消费者提货流程端到端手工验证。
- 人工确认普通订单/支付状态未变化。

Risk:

- 高。直接影响权益核销。

### PR P6: 真实履约流程

Scope:

- Vendor 备货、发货、自提核销。
- Admin 派发、异常处理、操作日志。
- 接入真实或 mock logistics adapter，按任务范围决定。

Non-goals:

- 不直接接真实快递100、菜鸟，除非单独任务明确允许。
- 不让物流状态触发退款、结算、佣金。

Verification:

- 商家数据隔离测试。
- 自提重复核销测试。
- 发货、签收、异常关闭测试。
- 地址、手机号、面单脱敏检查。

Risk:

- 高。涉及履约、商家权限和敏感物流数据。

### PR P7: 风控、审计和运营报表

Scope:

- 风控事件列表。
- 批次异常预警。
- 操作日志查询。
- 人工审核和批量处置。

Non-goals:

- 不改变兑换成功语义。
- 不改普通订单、支付、退款、结算、佣金、权限逻辑。

Verification:

- 风控命中测试。
- 批量冻结/作废日志测试。
- 脱敏和权限检查。

Risk:

- 中到高。涉及资产处置和高敏审计数据。

### PR P8: 提货卡财务/渠道对账设计

Scope:

- 仅在确有线下渠道对账、商家履约费用或补贴结算需求时启动。
- 独立设计渠道对账和履约费用，不复用普通订单支付事实。

Non-goals:

- 不直接实现资金结算。
- 不改 seller payout、settlement、commission。
- 不把提货卡线下售价写入普通订单金额。

Verification:

- 财务边界评审。
- 与普通 settlement / payout / commission 隔离评审。

Risk:

- 最高。资金域必须在提货流程稳定后串行推进。

## 本轮验证要求

本轮只允许文档变更：

- `git diff -- docs/pickup-card-architecture.md docs/china-localization-task-list.md`
- `git status --short -- docs/pickup-card-architecture.md docs/china-localization-task-list.md apps packages package.json bun.lock`
- 人工确认没有修改 `apps/**`、`packages/**`、`package.json`、`bun.lock`。
- 人工确认文档明确提货卡不是支付方式、优惠券、满减券、折扣券、储值卡、余额或购物车抵扣。
- 人工确认文档区分 consumer order 与 pickup fulfillment order。

## 风险点

- 产品口径风险：如果 UI 或接口把提货卡放入 checkout 或营销优惠体系，会误导为支付/抵扣工具。
- 资产安全风险：卡密、二维码 token、制卡导出文件泄露会造成真实权益损失。
- 并发风险：缺少唯一约束、事务或幂等会导致重复核销。
- 履约边界风险：提货单复用履约能力时容易误入普通订单支付、退款、结算、佣金链路。
- 权限风险：Vendor 不得访问其他商家提货单、完整卡号、卡密、批次导出文件或平台风控细节。
