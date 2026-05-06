# Admin Module Config Read Model

更新时间：2026-05-07 Asia/Shanghai

## 结论

Admin 模块开关下一步应先落一个真实“只读配置模型”，让平台运营能看到平台、市场、商户类型和单商户覆盖后的能力结果。

本任务不实现 migration、不写 API、不改 Admin UI，也不让任何模块开关真实影响权限、菜单、订单、支付、退款、结算、佣金或履约。

## 当前状态

已合并主线具备：

- `GET /admin/china/capabilities`
- `GET /store/china/capabilities`
- `GET /store/china/vendor-capabilities`
- Admin 模块开关页可以读取登录态 capability view。
- Vendor 和 Storefront 有只读 capability 展示边界。

当前问题：

- capability view 仍然来自静态/只读 contract，不是可配置模型。
- 没有 platform、market、merchant type、seller 四级配置来源。
- 没有 draft、published、effective config 的区分。
- 没有 config version、审计、回滚、幂等。

## 四类视图定义

### Capability View

面向前端消费的最终只读能力视图。

用途：

- Admin 看当前开放控制总览。
- Vendor 看当前商户能否进入某个工作台。
- Storefront 看消费者是否展示入口。

边界：

- 它是展示/引导视图，不是权限判定本身。
- 后端写操作仍必须检查 RBAC、商户归属、市场归属和业务服务权限。

### Draft Config

运营编辑中的草稿配置。

用途：

- Admin 预配置模块开关。
- 支持预览，不直接生效。

边界：

- 不影响菜单。
- 不影响权限。
- 不影响 checkout、订单、支付、结算或履约。

### Published Config

已经发布的配置版本。

用途：

- 作为 effective config 的输入。
- 可审计、可回滚到上一版本。

边界：

- 低风险 display-only 模块可以后续按 published config 展示。
- 中高风险模块必须继续阻断真实生效。

### Effective Config

合成后的最终配置结果。

合成顺序：

1. platform default
2. market override
3. merchant type override
4. seller override
5. emergency block

边界：

- Effective config 只说明“按配置应该是什么状态”。
- Runtime 是否采用它，必须由对应业务 PR 显式接入。

## 只读模型建议

### `china_module_definition`

模块字典，应稳定、可版本化，不允许运营随意新增 key。

| 字段 | 说明 |
| --- | --- |
| `key` | 稳定 key，如 `pickup_card` |
| `label` | 中文名称 |
| `description` | 运营说明 |
| `risk_level` | `low` / `medium` / `high` / `blocked_serial` |
| `runtime_scope` | `display_only` / `menu` / `fulfillment` / `payment` / `settlement` / `permission` |
| `default_state` | `disabled` / `enabled` / `requestable` / `mock_only` |
| `allow_market_override` | 是否允许市场覆盖 |
| `allow_merchant_type_override` | 是否允许商户类型覆盖 |
| `allow_seller_override` | 是否允许单商户覆盖 |
| `requires_provider_boundary` | 是否必须 provider/mock 边界 |

### `china_module_config`

配置记录，第一阶段只读。

| 字段 | 说明 |
| --- | --- |
| `id` | 配置 ID |
| `module_key` | 模块 key |
| `scope_type` | `platform` / `market` / `merchant_type` / `seller` / `emergency` |
| `scope_id` | 作用域 ID |
| `state` | `hidden` / `visible_disabled` / `requestable` / `mock_only` / `enabled` / `suspended` |
| `status` | `draft` / `published` / `archived` |
| `version` | 配置版本 |
| `effective_from` | 生效开始时间 |
| `effective_to` | 生效结束时间 |
| `reason` | 操作原因 |
| `metadata` | 扩展字段 |

### `china_module_config_audit`

后续写接口必须写审计。

| 字段 | 说明 |
| --- | --- |
| `id` | 审计 ID |
| `config_id` | 配置 ID |
| `operator_id` | Admin 用户 ID |
| `operation` | `create` / `update` / `publish` / `rollback` / `archive` |
| `before` | 变更前 JSON |
| `after` | 变更后 JSON |
| `reason` | 操作原因 |
| `idempotency_key` | 幂等键 |
| `created_at` | 操作时间 |

## 能力状态

统一状态建议：

- `hidden`: 不展示入口。
- `visible_disabled`: 展示但不可操作，需要显示原因。
- `requestable`: 可申请。
- `mock_only`: 仅占位或 mock provider。
- `enabled`: 可进入，但写操作仍需业务服务二次校验。
- `suspended`: 曾开放但被暂停。
- `blocked_serial`: 必须走高风险串行任务，通用模块开关不能打开。

## 读取 API 计划

### PR L1：文档和字段计划

当前任务。只写文档。

### PR L2：Read model type builder

范围：

- 在 API 层新增只读 builder 类型和纯函数。
- 输入：module definitions、configs、market context、seller context。
- 输出：capability view。
- 不写数据库，不接 runtime。

验证：

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && ../../node_modules/.bin/medusa build
```

### PR L3：Seed/static config bridge

范围：

- 把现有 capability contract 改为通过 read model builder 输出。
- 第一版数据仍可以来自静态字典或 seed。
- 响应显式标记 `source: "static_read_model"`。

非目标：

- 不落库。
- 不写 Admin 保存接口。

### PR L4：Admin readonly config API

范围：

- `GET /admin/china/module-configs`
- `GET /admin/china/module-configs/effective`
- `GET /admin/china/module-config-audits`

第一版审计可返回空列表或 mock boundary，但必须明确不是生产审计。

### PR L5：Admin readonly UI bridge

范围：

- Admin 模块开关页读取 readonly config API。
- 展示 platform、market、merchant type、seller 四级来源。
- 展示状态来源和 blocked reason。

非目标：

- 不保存。
- 不发布。
- 不改变菜单或权限。

### PR L6：Draft config storage

范围：

- 真实表和 draft 写入。
- 必须有审计、幂等、version、reason。

风险：

- 中。必须在 L2-L5 稳定后做。

### PR L7：Display-only runtime

范围：

- 仅 display-only 模块可以读取 published/effective config 控制前端入口展示。

禁止：

- 不允许支付、退款、结算、权限、履约、checkout、订单状态由通用开关生效。

## 模块分类边界

### 可先读模型的低风险模块

- `shop_decoration`
- `pickup_card_entry`
- `live_status_badge`
- `market_announcement`
- `ai_quick_listing_entry`
- `materials_market_entry`

这些模块第一阶段最多影响入口是否展示，不能生成真实交易副作用。

### 必须谨慎的中风险模块

- `materials_supplier_workspace`
- `delivery_supplier_workspace`
- `farmer_grower_workspace`
- `seedling_wholesale_workspace`
- `regional_wholesaler_workspace`
- `express_printing_workspace`

这些模块涉及商户类型、数据隔离和工作台入口。后续必须验证 role mapping 和资源归属。

### 通用开关禁止直接生效的高风险模块

- `payment_provider`
- `payment_notification`
- `refund`
- `reconciliation`
- `merchant_settlement`
- `payout`
- `commission`
- `permission_rbac`
- `checkout_shipping_option`
- `order_fulfillment_status`

这些只能进入专用串行 PR。

## 回滚策略

只读阶段：

- 回滚到原静态 capability contract。
- 不影响业务数据。

Draft 阶段：

- 删除或 archive draft。
- 不影响 runtime。

Published 阶段：

- 新建 rollback version。
- 保留审计记录。
- 不允许直接改历史记录。

Runtime 阶段：

- display-only 可回退配置版本。
- 中高风险业务副作用不能通过通用模块回滚，必须走专项补偿流程。

## 验收路径

文档阶段：

```bash
git diff --check -- docs/admin-module-config-read-model.md docs/admin-feature-flag-backend-split.md project-ledger .codex/queue.md
git diff --name-status
```

只读 builder 阶段：

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && ../../node_modules/.bin/medusa build
```

Admin UI 读取阶段：

```bash
cd apps/admin && bun run lint
cd apps/admin && bun run build
```

API smoke：

```bash
curl http://127.0.0.1:9000/admin/china/module-configs
curl http://127.0.0.1:9000/admin/china/module-configs/effective
```

## 关键判断

Admin 能看到模块配置，只代表平台有“配置意图”。它不代表：

- 用户权限已经改变。
- 商户菜单一定显示。
- 消费者入口一定展示。
- 配送规则已经影响 checkout。
- 支付、退款、结算或履约能力已经启用。

任何真实生效都必须在对应业务 PR 中显式接入并验证。
