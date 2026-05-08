# Template Registry Surface Binding Plan

更新时间：2026-05-08 Asia/Shanghai

## 目标

第九十八轮已经落地四个 template v2 surface：消费者首页、消费者店铺页、Admin 运营首页、Vendor 多角色经营看板。当前它们仍直接在各自页面或展示常量中表达模块顺序、可见性和回滚说明。

下一步应先规划统一绑定方式：页面只消费稳定 view model 和 template registry，不把模板 id、可见性、fallback、风险边界散落在 UI 组件里。

本轮只写计划，不修改 `apps/**` 或 `packages/**`。

## 当前基线

已有只读合同：

```text
packages/api/src/modules/china-template-registry-read-model/**
```

当前合同特征：

- `readOnly: true`
- `runtimeEnabled: false`
- `canWriteBusinessState: false`
- 覆盖 `storefront`、`admin`、`vendor` 三端。
- 仍是 v1 skeleton，尚未包含本轮落地的 v2 template ids。

已有 v2 surface：

| Surface | 当前页面 | 建议 template id | 当前状态 |
| --- | --- | --- | --- |
| Storefront | 首页 `/cn` | `storefront-home-market-shop-v2` | 已落地展示层 |
| Storefront | 店铺页 `/cn/sellers/:handle` | `storefront-shop-stall-v2` | 已落地展示层 |
| Admin | `/dashboard/cn` | `admin-dashboard-ops-v2` | 已落地展示层 |
| Vendor | `/` | `vendor-role-workspace-v2` | 已落地展示层 |

## 绑定原则

1. Registry 只回答“可用模板、slot、可见性、版本、回滚候选和风险边界”。
2. View model 只回答“当前页面要展示的数据”。
3. 页面组件只负责渲染，不直接决定真实权限、订单、支付、履约、库存、结算或 feature flag 生效。
4. 商户/消费者可见文案不能直接显示内部 template id、rollback id、runtime mode 或工程化 source key。
5. Admin 可见的运营后台可以显示“展示数据 / 只读 / 未生效”边界，但不能把它写成真实配置。
6. 每个 surface 必须有 fallback：registry 读取失败时保留当前静态展示，不改变业务状态。

## Storefront 绑定方案

首页 `storefront-home-market-shop-v2`：

- Slots：`market_context`、`search`、`category_groups`、`shop_cards`、`product_cards`、`pickup_card_entry`。
- 默认隐藏：物料供应商、配送供应商、上游供给、种苗批发、外地批发商。
- Live 只作为店铺状态或店铺卡片轻提示，不做首页主入口。
- Pickup card 使用独立入口，不放成首页主购买路径。

店铺页 `storefront-shop-stall-v2`：

- Slots：`shop_profile`、`market_context`、`fulfillment_hint`、`live_status`、`product_cards`。
- 配送/自提属于店铺/档口能力，不作为商品卡核心事实。
- 商品卡只展示规格、价格和库存提示；真实可买、运费和配送仍以后端 cart/checkout 为准。

后续 PR：

1. 扩展 template registry v2 合同，新增 Storefront v2 template ids。
2. 新增 Storefront template view model mapper，先用现有静态数据适配。
3. 页面改为读取 mapper 输出，但保留当前静态 fallback。

## Admin 绑定方案

Admin 首页 `admin-dashboard-ops-v2`：

- Slots：`kpi_cards`、`data_source_notice`、`todos`、`risk_alerts`、`quick_actions`、`focus_modules`。
- KPI 和风险仍是展示数据，不能读成真实订单、支付、库存或结算报表。
- 快捷入口必须保持只读或显式 disabled，直到后端权限、审计和真实 API 完成。

后续 PR：

1. 扩展 template registry v2 合同，新增 Admin v2 template id 和 `focus_modules` slot。
2. 新增 Admin dashboard view model mapper。
3. 页面从 mapper 读取模块顺序、文案和数据来源提示；不接真实交易数据。

## Vendor 绑定方案

Vendor 首页 `vendor-role-workspace-v2`：

- Slots：`role_context`、`market_context`、`kpi_cards`、`todos`、`quick_actions`、`risk_alerts`、`role_workspace_cards`。
- 角色卡覆盖普通生鲜/海鲜商户、水果蔬菜商户、物料供应商、配送供应商、养殖户/种植户、种苗供应商和外地批发商。
- 页面可展示“示例角色 / 平台可开通 / 独立角色 / 上游供给”，但不能宣称真实权限已经生效。
- 跳转只能到占位页或只读页，不触发接单、发货、打印、发布、开播、支付、结算或权限变化。

后续 PR：

1. 扩展 template registry v2 合同，新增 Vendor v2 template id 和 `role_workspace_cards` slot。
2. 新增 Vendor role workspace view model mapper。
3. 页面从 mapper 读取角色卡、可见性和 fallback 文案。
4. 再做浏览器视觉 QA，确认信息密度是否适合商户端。

## 高风险边界

Template registry 不能作为以下事实来源：

- RBAC / permission
- feature flag 生效
- payment success
- order status
- refund status
- settlement / commission / payout
- checkout shipping options
- fulfillment / logistics / waybill
- provider configuration
- real credentials
- live streaming / IM runtime
- pickup card redemption result

这些只能由后端真实模型、权限、审计、provider adapter、异步通知和串行高风险 PR 控制。

## 建议 PR 拆分

1. `template-registry-v2-contract`：只改 `packages/api/src/modules/china-template-registry-read-model/**` 和测试，新增 v2 template ids/slots；不新增 route。
2. `storefront-template-view-model-mapper`：Storefront 只新增 mapper 和测试，不改页面。
3. `admin-template-view-model-mapper`：Admin 只新增 mapper 和测试，不改页面。
4. `vendor-template-view-model-mapper`：Vendor 只新增 mapper 和测试，不改页面。
5. `template-surface-binding-validation`：合并后验证 registry focused tests、三端 build/lint 和 diff check。

页面真实改为消费 mapper，应再拆为单 surface PR，避免三端同时改导致难查。

## 验证要求

每个后续 PR 至少包含：

- focused unit tests
- relevant app build/lint
- `git diff --check`
- scope check，确认没有支付、订单、退款、结算、佣金、权限或履约 runtime 改动
- 说明 fallback 和 rollback

## 本轮结论

四个 v2 页面已经形成可看版本，但还没有统一模板读取机制。下一步不应该继续直接堆 UI，而应先把 registry v2 合同和 view model mapper 做出来，再让页面逐个绑定。
