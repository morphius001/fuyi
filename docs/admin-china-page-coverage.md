# Admin China Page Coverage

本文档记录中国平台运营后台当前页面覆盖状态，避免后续把 mock 页面误认为真实业务能力。

## 总体边界

- 当前 Admin 中国后台是运营 UI 壳和只读 mock 数据。
- 不接真实支付、退款、对账、结算、佣金、权限、短信、IM、物流、电子面单或直播服务。
- 不写真实 app id、merchant id、token、access key、secret、私钥或证书。
- 提货卡是线下实体卡提货权益，不是优惠券、满减券、折扣券、储值卡或支付方式。
- 模块开关、市场能力和商户类型开关当前只做前端运营说明，后续必须接后端能力控制后才能作为真实开关。

## 路由和渲染方式

中国后台动态路由入口：

- `apps/admin/src/routes/[section]/[page]/page.tsx`
- 菜单定义：`apps/admin/src/lib/china-admin-menu.ts`

专门页面：

| 页面 | 渲染组件 | 说明 |
| --- | --- | --- |
| `/cn` | `ChinaAdminDashboard` | 平台运营首页，使用独立首页数据。 |
| `/cn/operations/*` | `ChinaAdminOperationsConsole` | 平台运营控制台，覆盖模块开关、市场能力、商户类型、Provider 准备度，只读展示。 |
| `/cn/products/spec-templates` | `ChinaAdminProductSpecTemplates` | 商品规格模板控制台，只读展示，不保存模板、不发布商品。 |
| `/cn/pickup-cards/dashboard` | `PickupCardDashboard` | 提货卡看板，展示消费者提货链路、核心指标、最近提货、批次和履约占位。 |

通用只读表格页面：

- 组件：`ChinaAdminPageShell`
- 数据入口：`apps/admin/src/lib/china-admin-table-data.ts`
- 表格组件：`ChinaAdminReadonlyTable`

## 通用表格数据覆盖

| 业务域 | 菜单页数量 | 数据文件 | 边界 |
| --- | ---: | --- | --- |
| 商户管理 | 5 | `china-admin-table-merchant-tables.ts` | 不执行真实入驻审核、冻结、处罚或权限变更。 |
| 商品管理 | 6 | `china-admin-table-product-tables.ts` | 不执行真实上架、下架、审核、库存或价格变更。 |
| 订单管理 | 7 | `china-admin-table-order-tables.ts` | 不改变订单状态、归属、支付或履约状态。 |
| 售后管理 | 4 | `china-admin-table-after-sales-tables.ts` | 不执行退款、退货、平台介入裁定或订单改写。 |
| 支付与对账 | 4 | `china-admin-table-payment-tables.ts` | 支付成功必须以后端异步通知为准；这里只读展示验签、幂等、对账边界。 |
| 结算管理 | 4 | `china-admin-table-settlement-tables.ts` | 不发起打款、提现、佣金计算或结算状态变更。 |
| 营销中心 | 6 | `china-admin-table-marketing-tables.ts` | 提货卡不进入优惠券/满减/折扣/支付链路；物料采购不进入消费者首页。 |
| 客服与消息 | 4 | `china-admin-table-message-tables.ts` | 不接真实微信、TalkJS、IM 或短信。 |
| 风控 | 6 | `china-admin-table-risk-tables.ts` | 只读预警，不冻结、不下架、不处罚、不改订单/退款/支付/权限。 |
| 系统配置 | 9 | `china-admin-table-settings-tables.ts` | 只做配置模板和密钥规则展示，不写真实密钥、不接真实服务。 |
| 提货卡细分页 | 8 | `china-admin-table-pickup-card-tables.ts` | 不展示明文卡密，不创建真实订单、不扣库存、不发货、不冻结真实卡号。 |

## 领域设计要点

商户管理：

- 支持市场、档口号、跨市场经营、商户类型、店铺主页、物料供应商、外地批发商、种苗批发、养殖户和种植户等概念占位。
- 物料供应商和配送供应商属于 B 端能力，不进入消费者首页前排。

商品管理：

- 鲜活海鲜、果蔬、市场物料分清楚。
- 规格以后读取后台模板，当前只展示 mock 规格文案。
- AI 快速上架只能生成草稿，必须商户确认后再提交审核。

提货卡：

- 消费者使用卡号/卡密/二维码在线提货，填写收货信息或预约配送。
- 提货卡不用于购买商品，不进入购物车支付、优惠券、满减、折扣或储值账户。
- 卡密不明文展示，页面只使用脱敏卡号。

配送：

- 市场可以提供统一配送能力，但不是强制。
- 商户可选择统一配送、自行配送或混合模式，后续必须由后端能力开关和商户配置共同控制。

## 后续接真实能力前必须补齐

- 后端能力开关模型和权限控制。
- 审计日志和操作留痕。
- Provider/adapter 边界和 mock provider 验证。
- 支付通知验签、幂等、可重试机制。
- 真实 API 的加载、错误、空状态、权限不足和回滚策略。

## 验证记录

最近一次验证：

- `git diff --check`：通过。
- `bun --cwd apps/admin lint`：通过。
- `bun --cwd apps/admin build`：通过，仍有既有 Vite chunk size warning。
- 服务状态：API 9000、Admin 7000、Vendor 7001、Storefront 3101 均正常。
