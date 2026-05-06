# Admin 模块开放控制后端落地拆分方案

更新日期：2026-05-04

## 目标

本文设计 Admin 模块开放控制的后端落地拆分方案。它把当前 Admin 端的模块开关 mock/占位能力，拆成可审计、可回滚、可按市场与商户类型逐步灰度的后端配置体系。

本方案只做文档设计，不写业务代码，不修改 `apps/**`、`packages/**`、`package.json` 或 `bun.lock`。

## 范围与非目标

范围：

- 平台默认、市场配置、商户/供应方配置、角色能力四层配置模型。
- 后端只读能力视图 API，供 Admin、Vendor、Storefront 消费。
- Admin 修改 API 草案，包括草稿、发布、幂等、审计、回滚。
- Vendor/Storefront 的消费方式与降级策略。
- 安全边界、PR 拆分、验证步骤。

非目标：

- 不实现真实 feature flag、数据库 migration、workflow 或 API route。
- 不替代 Medusa/Mercur 现有 RBAC、订单归属、商户数据隔离和权限判断。
- 不改变支付、订单、退款、结算、佣金、payout、库存或履约业务逻辑。
- 不接入真实微信支付、支付宝、短信、IM、直播、物流、快递打印或 AI 服务。
- 不写真实 secrets、merchant id、app id、webhook token 或生产配置。

## 核心原则

1. 后端是模块开放的事实来源，前端隐藏入口只能作为展示层优化。
2. 模块开关只决定“是否可见、可申请、可进入、可发起某类非资金流程”，不能放大用户权限。
3. RBAC、商户归属、市场归属、订单/支付/结算权限仍由现有权限系统和业务服务强制执行。
4. 配置发布必须可审计、幂等、可回滚，并保留 operator、原因、前后差异和生效范围。
5. 默认关闭高风险或真实外部服务能力；第一阶段只允许 mock/provider boundary。

## 模块目录

建议先固化一份枚举式模块目录，避免前后端各自发明字符串。

| 模块 key | 名称 | 默认状态 | 主要消费端 | 安全备注 |
| --- | --- | --- | --- | --- |
| `fresh_goods` | 水果蔬菜/鲜货经营 | 按市场开启 | Vendor, Storefront | 不改变商品发布权限 |
| `market_supplies` | 市场物料 | 默认关闭 | Vendor | 仅商户端 B 端采购，不进消费者主链路 |
| `delivery_supplier` | 配送供应商 | 默认关闭 | Admin, Vendor | 不接真实物流，不自动改订单履约 |
| `upstream_supply` | 上游货源 | 默认关闭 | Vendor | 面向商户采购需求/报价，不面向消费者购物 |
| `seedling_wholesale` | 种苗批发 | 默认关闭 | Vendor | 供应方角色专属 |
| `outbound_wholesale` | 外地批发商 | 默认关闭 | Vendor | 不混入普通消费者商品流 |
| `pickup_card` | 提货卡 | 默认关闭 | Storefront, Vendor, Admin | 提货凭证，不是支付/优惠券/储值 |
| `ai_quick_listing` | AI 快速上架 | 默认关闭 | Vendor | 只能生成草稿，需商户确认 |
| `live_commerce` | 直播 | 默认关闭 | Storefront, Vendor, Admin | mock/placeholder，不接真实直播或 IM |
| `express_printing` | 快递打印 | 默认关闭 | Vendor | mock/placeholder，不生成真实运单号 |
| `shop_decoration` | 店铺/档口装修 | 按市场开启 | Vendor, Storefront | 只控制装修入口，不放大商品/资质权限 |

## 配置层级

能力最终结果由四层配置合成，越靠后的层级只能在上层允许的边界内收紧或细化，不能越权打开上层禁止的能力。

### 1. 平台默认层

平台默认层定义全局模块目录、默认值、安全等级、是否允许市场覆盖、是否需要角色或资质。

示例字段：

- `module_key`
- `default_state`: `disabled | enabled | requestable | mock_only`
- `risk_level`: `low | medium | high | blocked_serial`
- `allow_market_override`
- `allow_subject_override`
- `requires_role_capability`
- `requires_provider_boundary`
- `owner_team`
- `rollback_policy`

### 2. 市场配置层

市场配置层面向可切换市场，例如三门海鲜市场、其他城市市场。它决定某个市场是否开放模块、开放时间、试点范围和原因。

示例字段：

- `market_id`
- `module_key`
- `state`: `disabled | enabled | requestable | mock_only`
- `effective_from`
- `effective_to`
- `reason`
- `rollout_stage`: `internal | pilot | public`
- `provider_mode`: `mock | sandbox | production_disabled`

约束：

- 市场不能打开平台默认层标记为 `blocked_serial` 且未批准的模块。
- 涉及支付、退款、结算、佣金、payout 的能力必须单独高风险任务串行推进。
- 市场配置不能绕过商户与市场绑定关系。

### 3. 商户/供应方配置层

商户/供应方配置层区分普通经营商户、物料供应商、配送供应商、养殖户、种植户、种苗供应商、外地批发商。

建议主体类型：

- `merchant`: 普通经营商户
- `materials_supplier`: 物料供应商
- `delivery_supplier`: 配送供应商
- `farmer`: 养殖户/种植户
- `seedling_supplier`: 种苗供应商
- `outbound_wholesaler`: 外地批发商

示例字段：

- `subject_type`
- `subject_id`
- `market_id`
- `module_key`
- `state`
- `approval_status`: `not_required | pending | approved | rejected | suspended`
- `credential_requirements`
- `failure_reason`
- `updated_by`

约束：

- 主体配置不能打开市场层关闭的模块。
- 供应方能力必须和普通经营商户入口隔离，避免物料/上游采购进入消费者购物流。
- 资质、准入和风控失败时，能力视图应返回 `blocked_reason`，前端展示申请/受限状态，而不是假装可用。

### 4. 角色能力层

角色能力层约束同一商户或供应方内部的用户能否看到、进入、修改某能力。

示例能力：

- `module.view`
- `module.apply`
- `module.manage_config`
- `module.operate`
- `module.audit_read`

约束：

- 角色能力不是 RBAC 的替代品，而是传递给前端的业务能力视图。
- 后端执行写操作时仍必须检查现有 RBAC、用户所属主体、市场绑定、资源归属。
- Admin 修改平台/市场配置必须要求平台 operator 权限；商户用户不能修改市场层或平台层配置。

## 能力合成规则

后端能力视图按以下顺序合成：

1. 读取平台默认层，确认模块是否存在、风险等级和覆盖规则。
2. 叠加市场配置层，得到市场内模块状态。
3. 叠加商户/供应方配置层，得到主体准入状态。
4. 叠加角色能力层，得到当前用户可见、可申请、可操作状态。
5. 附加 provider 状态、mock 标记、阻塞原因和审计版本。

建议最终状态：

- `hidden`: 不展示入口。
- `visible_disabled`: 可见但不可操作，展示原因。
- `requestable`: 可申请或待开通。
- `mock_only`: 仅占位/模拟能力。
- `enabled`: 可进入，但写操作仍由业务服务二次校验。
- `suspended`: 曾开通但被暂停。

## 只读能力视图 API

能力视图 API 应是读优化接口，服务端聚合多层配置，避免前端自行合成安全判断。

### Admin 能力视图

`GET /admin/china/module-capabilities`

用途：

- Admin 模块开放控制页读取平台、市场、主体、角色维度总览。
- 支持按 `market_id`、`subject_type`、`subject_id`、`module_key` 过滤。

响应草案：

```json
{
  "schema_version": "2026-05-04",
  "config_version": 42,
  "market_id": "market_sanmen_demo",
  "modules": [
    {
      "module_key": "pickup_card",
      "state": "mock_only",
      "risk_level": "medium",
      "source": "market",
      "provider_mode": "mock",
      "blocked_reason": null,
      "subjects_enabled_count": 12,
      "subjects_blocked_count": 2,
      "last_published_at": "2026-05-04T10:00:00+08:00"
    }
  ]
}
```

### Vendor 能力视图

`GET /vendor/china/capabilities`

用途：

- Vendor shell、店铺装修、快速上架、物料采购、供应方工作台读取当前用户可用能力。
- 返回当前商户/供应方在当前市场下的能力结果。

响应草案：

```json
{
  "market_id": "market_sanmen_demo",
  "subject_type": "merchant",
  "subject_id": "ven_123",
  "capabilities": {
    "shop_decoration": {
      "state": "enabled",
      "actions": ["view", "operate"],
      "blocked_reason": null
    },
    "ai_quick_listing": {
      "state": "mock_only",
      "actions": ["view"],
      "blocked_reason": "AI 上架仍处于草稿占位阶段"
    }
  }
}
```

### Storefront 能力视图

`GET /store/china/market-capabilities`

用途：

- Storefront 判断市场首页、店铺页、提货卡入口、直播状态、配送/自提提示是否展示。
- 只返回消费者可见信息，不暴露 Admin 配置细节、主体审计字段或内部失败原因。

响应草案：

```json
{
  "market_id": "market_sanmen_demo",
  "public_modules": {
    "pickup_card": "visible",
    "live_commerce": "placeholder",
    "market_supplies": "hidden"
  }
}
```

## Admin 修改 API 草案

Admin 修改 API 建议拆成草稿、校验、发布、回滚四组，避免直接写入即时生效配置。

### 创建或更新草稿

`PUT /admin/china/module-config-drafts/:draft_id`

要求：

- 请求必须带 `Idempotency-Key`。
- 请求必须带 `reason`。
- 请求只修改草稿，不立即生效。
- 后端返回草稿差异、校验警告和风险等级。

### 校验草稿

`POST /admin/china/module-config-drafts/:draft_id/validate`

校验内容：

- 是否试图打开平台层禁止的模块。
- 是否跨市场修改无权限资源。
- 是否把供应方模块暴露给消费者主链路。
- 是否涉及支付、退款、结算、佣金、payout 等禁止混入范围。
- 是否缺少回滚说明、原因或审批记录。

### 发布草稿

`POST /admin/china/module-config-drafts/:draft_id/publish`

要求：

- 请求必须带 `Idempotency-Key`。
- 发布时生成不可变 `config_version`。
- 审计日志记录发布人、时间、原因、差异、影响范围。
- 发布失败不能产生半生效状态；需要事务或补偿策略。

### 回滚版本

`POST /admin/china/module-config-versions/:version/rollback`

要求：

- 回滚本质也是一次新发布，生成新的 `config_version`。
- 记录从哪个版本回滚、回滚原因、执行人和影响范围。
- 如果目标版本引用了已废弃模块或不再满足平台安全策略，必须阻止并返回原因。

## 幂等策略

幂等键建议由三部分组成：

- `actor_id`
- `operation_type`
- 客户端生成的 `Idempotency-Key`

幂等记录应保存：

- 请求摘要 hash。
- 首次执行结果。
- 状态：`processing | succeeded | failed_retryable | failed_final`。
- 关联草稿 id、发布版本或回滚版本。

重复请求处理：

- 相同 key + 相同请求摘要：返回首次结果。
- 相同 key + 不同请求摘要：返回 409，提示幂等键复用错误。
- `processing` 超时：允许安全重试，但必须由后端确认是否已有发布版本。

## 审计日志

审计日志必须独立于前端展示，不可由客户端伪造关键字段。

建议记录：

- `audit_id`
- `actor_id`
- `actor_type`
- `operation`
- `target_scope`: `platform | market | subject | role`
- `target_id`
- `module_key`
- `before`
- `after`
- `reason`
- `request_id`
- `idempotency_key`
- `config_version`
- `created_at`

审计展示：

- Admin 可按市场、模块、操作人、时间、版本过滤。
- Vendor 只可看到与自己主体相关的能力变更摘要，不暴露其他商户。
- Storefront 不暴露审计日志。

## 回滚与降级

回滚策略：

- 每次发布生成版本快照。
- 回滚生成新版本，不直接覆盖历史版本。
- 回滚前执行同一套安全校验。
- 高风险模块必须支持一键降级为 `disabled` 或 `mock_only`。

降级策略：

- 能力视图读取失败时，Vendor/Storefront 默认隐藏高风险入口。
- Admin 能力视图读取失败时展示错误状态，不允许提交发布。
- provider 状态未知时，真实外部服务能力按不可用处理；mock-only 可展示占位但不能触发现实副作用。

## Vendor 消费方式

Vendor 端消费能力视图时应遵循：

- shell 菜单只根据能力视图展示入口。
- 页面级组件进入后仍调用对应业务 API，由后端做 RBAC 和归属校验。
- `mock_only` 状态必须显示占位或草稿语义，不能伪装为真实服务。
- AI 快速上架只能进入草稿生成和商户确认，不得直接发布真实商品。
- 快递打印只能展示预览/历史占位，不得生成真实运单或修改订单发货状态。
- 物料供应、配送供应、上游货源、种苗和外地批发必须按主体类型隔离工作台。

## Storefront 消费方式

Storefront 端只消费面向消费者的市场能力视图：

- 市场首页可展示提货卡、直播占位、店铺装修公开模块。
- 物料采购、上游供货、配送供应商接单等 B 端能力必须隐藏。
- 提货卡入口必须保持独立链路，不进入 checkout、coupon、cart discount、wallet 或 payment collection。
- 直播能力在第一阶段只能展示状态/占位，不接真实直播、IM 或支付。
- 能力视图不可作为支付、订单、履约成功的事实来源。

## 安全边界

必须保留的边界：

- 不替代 RBAC。
- 不绕过订单、支付、退款、结算、佣金、payout 权限。
- 不绕过商户数据归属、市场绑定和供应方准入。
- 不允许前端通过隐藏字段打开未授权模块。
- 不允许配置 API 写入真实 secrets。
- 不允许低风险 UI PR 顺手修改高风险业务逻辑。

后端写操作必须二次校验：

- 当前 operator 是否有 Admin 配置权限。
- 修改范围是否在 operator 可管理市场内。
- 模块是否允许在该层级覆盖。
- 主体类型是否匹配模块要求。
- 是否触发高风险串行边界。

## 后续 PR 拆分

建议拆分为以下小 PR：

1. `admin-feature-flag-contracts`: 新增模块 key、状态枚举、能力视图类型和文档示例；不接数据库。
2. `admin-feature-flag-read-view`: 实现只读能力视图 mock/provider 边界，供三端读取；默认安全降级。
3. `admin-feature-flag-draft-api`: 实现 Admin 草稿与校验 API，不发布生效配置。
4. `admin-feature-flag-publish-audit`: 实现发布、版本、审计日志和幂等保护。
5. `admin-feature-flag-rollback`: 实现版本回滚和一键降级策略。
6. `vendor-storefront-capability-consumption`: Vendor/Storefront 改为消费能力视图，仍保留业务 API 后端校验。

高风险支付、退款、结算、佣金、payout、真实物流、真实直播、真实 IM、真实 SMS、真实 AI 发布能力不纳入上述 PR，必须另起任务。

## 验证步骤

本 docs-only 任务验证：

- `git diff -- docs/admin-feature-flag-backend-split.md docs/china-localization-task-list.md .codex/queue.md docs/china-localization-progress-board.md`
- 人工确认未修改 `apps/**`、`packages/**`、`package.json`、`bun.lock`。
- 人工确认文档包含配置层级、能力视图 API、Admin 修改 API、幂等、审计、回滚、Vendor/Storefront 消费方式和安全边界。

后续实现 PR 验证：

- 类型检查：`bun run check-types`
- Lint：`bun run lint`
- API 单元测试：能力合成、权限拒绝、幂等 replay、草稿发布、回滚、审计记录。
- 安全回归：商户只读自有能力；Storefront 不暴露 B 端模块；提货卡不进入支付/优惠券链路。

## 风险点

- 中高风险：模块开放一旦成为后端事实来源，错误配置可能扩大入口可见性。
- 高风险：若把 feature flag 当作权限系统，会绕过 RBAC 和商户归属。
- 高风险：提货卡、快递打印、直播、AI 上架容易被误接真实服务，必须保持 mock/provider boundary。
- 最高风险：支付、退款、结算、佣金、payout 不属于本任务，任何实现 PR 都不能顺手修改。
