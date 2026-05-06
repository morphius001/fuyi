# 中国大陆本地化任务清单

本文档把 MercurJS 中国大陆多商户电商平台本地化改造拆分成可审计、可回滚、可并行或必须串行的 PR。第一轮只做审计和文档，不修改业务代码。

## 全局规则

每个 PR 必须包含：

- Files changed
- Scope
- Non-goals
- Verification
- Risk notes
- Rollback 或 feature flag 指引

禁止事项：

- 不直接修改 Mercur / Medusa core。
- 不删除 Stripe、Algolia、Resend、TalkJS。
- 不写真实生产 secrets。
- 不接真实微信支付、支付宝、短信、IM、物流服务。
- 不在低风险 UI PR 中修改支付、订单、退款、结算、佣金、权限逻辑。
- 不把 `.agents/` 临时目录作为提交内容或依赖。

## Batch 0: 当前审计文档 PR

### PR 0: 中国本地化第一轮审计文档

Scope:

- 更新 `docs/china-localization-audit.md`
- 更新 `docs/china-ux-spec.md`
- 更新 `docs/china-integration-architecture.md`
- 更新 `docs/china-localization-task-list.md`
- 记录第一轮审计时尚无 `apps/storefront`；storefront scaffold 后续以 `apps/storefront` 为准
- 记录 `bun run check-types` 当前没有实际执行任务

Non-goals:

- 不修改 `apps/` 或 `packages/` 业务代码
- 不新增依赖
- 不运行真实 provider
- 不改支付、订单、退款、结算、佣金、权限逻辑

Verification:

- `git diff -- docs`
- `git status --short --branch`
- 人工确认仅 docs 文件变化

Risk:

- 低。仅文档变更。

## Batch 1: 低风险并行 PR

### PR 0: Storefront Scaffold

Scope:

- Add the official Mercur B2C Storefront under `apps/storefront`.
- Keep the scaffold close to the upstream storefront.
- Align package manager usage with root `bun@1.3.13`.
- Do not localize copy, layout, payment, order, refund, settlement, commission, or permission behavior.

Non-goals:

- 不做中文化。
- 不接入真实 Stripe、Algolia、TalkJS、微信支付、支付宝。
- 不写真实密钥或提交 `.env.local`。
- 不修改支付、订单、退款、结算、佣金、权限逻辑。

Verification:

- Confirm root workspaces include `apps/*`.
- Run `bun install`.
- Run `bun run lint:storefront` and record scaffold-level compatibility issues without broad business-code fixes.
- Confirm `.env.local.example` exists and `.env.local` remains ignored/untracked.

Risk:

- Storefront scaffold brings React 19 and Next.js 15 dependencies into a monorepo that already has React 18 dashboard apps.
- Provider dependencies such as Stripe, Algolia, and TalkJS remain present but must stay unconfigured unless a later scoped task requires mock or placeholder setup.

### PR 1: Storefront 中文化基线（storefront-zhcn-baseline）

Scope:

- 基于 `apps/storefront` 做 storefront-zhcn-baseline。
- Localize storefront copy to zh-CN where applicable.
- Use CNY display conventions.
- Propose domestic ecommerce layout improvements for product listing, product detail, cart, checkout, and mobile sticky actions.
- 规划端口、环境变量、Store API 边界、页面清单。
- Keep checkout/order/payment behavior unchanged.

Non-goals:

- 不实现 checkout 状态变更。
- 不改订单、支付、退款、结算、佣金、权限逻辑。
- 不引入真实支付或物流。

Verification:

- 确认 `apps/storefront` 是后续 storefront-zhcn-baseline 的唯一前台目录。
- 运行 `bun run lint:storefront`。
- 如范围包含构建验证，运行 `bun run build:storefront`。
- 桌面和移动端打开首页、搜索、类目、商品详情、购物车入口。

Risk:

- 低到中。前台应用依赖和本地化改造应单独评审。

### PR 2: Admin Panel 中文化基线

Scope:

- 为 `apps/admin` 增加 zh-CN/zhCN 资源方案。
- 建立平台运营后台术语表。
- 处理明显英文文案和硬编码文案清单。
- 评估 dashboard i18n 使用的 language code。

Non-goals:

- 不改 RBAC。
- 不改订单、支付、退款、结算、佣金。
- 不重写内置 Mercur Admin core。

Verification:

- `bun --cwd apps/admin run lint`
- `bun --cwd apps/admin run build`
- `bun run lint`
- 桌面与移动端检查 `http://localhost:7000`
- 确认权限敏感入口未变化。

Risk:

- 中。中文化看似低风险，但菜单和 route config 可能误触权限入口。

### PR 3: Admin Panel 菜单 IA 与只读运营入口

Scope:

- 规划或实现中文一级菜单：首页、商家管理、商品管理、订单管理、售后管理、支付与对账、结算管理、营销管理、客服与消息、系统配置。
- 第一版优先做只读入口或链接现有页面。
- 增加运营首页指标需求，不改变后端状态。

Non-goals:

- 不新增支付、退款、结算、佣金状态变更。
- 不修改权限判断。

Verification:

- `bun --cwd apps/admin run lint`
- `bun --cwd apps/admin run build`
- 手动访问所有一级菜单。
- 检查订单、退款、payout、commission 设置仍按原权限和行为工作。

Risk:

- 中。涉及菜单、路由和权限敏感入口。

### PR 4: Vendor Panel 中文化基线

Scope:

- 为 `apps/vendor` 增加 zh-CN/zhCN 资源方案。
- 建立商家后台术语表。
- 处理明显英文文案和硬编码文案清单。

Non-goals:

- 不改订单归属。
- 不改结算、退款、佣金、权限。
- 不重写 Mercur Vendor core。

Verification:

- `bun --cwd apps/vendor run lint`
- `bun --cwd apps/vendor run build`
- 桌面与移动端检查 `http://localhost:7001`
- 确认商家只能看到自己的数据。

Risk:

- 中。需要防止菜单改造影响商家权限和订单归属。

### PR 5: Vendor Panel 菜单 IA 与只读商家入口

Scope:

- 规划或实现中文一级菜单：首页、商品管理、订单管理、物流管理、售后管理、客服管理、店铺管理、结算管理、评价管理、账号权限。
- 物流、售后、客服、评价第一版可为只读规划页或链接现有页面。

Non-goals:

- 不创建真实物流单。
- 不创建退款或售后状态变更。
- 不改结算、佣金、权限、订单归属。

Verification:

- `bun --cwd apps/vendor run lint`
- `bun --cwd apps/vendor run build`
- 手动访问 `/`、`/products`、`/orders`、`/inventory`、`/settings/store`、`/settings/users`、`/payouts`。
- 移动端检查菜单和表格不溢出。

Risk:

- 中。订单、履约、payout 都是敏感入口。

### PR 6: 中国地址 UI 设计与格式化方案

Scope:

- 设计中国地址字段映射。
- 第一轮先完成 Storefront 账户地址、结算地址、账单地址、订单地址展示的中国大陆 UI 基线。
- Admin/Vendor 地址展示格式后续随商家资质、档口资料和配送设置任务落地。
- 设计 Storefront checkout 地址表单需求，复用现有 Storefront 地址组件位置。
- 复用 Medusa 标准字段和 `is_default_shipping` / `is_default_billing`。
- 区县 / 街道第一阶段暂存到 Medusa 标准 `company` 字段，避免新增模型。

Non-goals:

- 不新增数据库字段。
- 不改 Medusa/Mercur 地址模型。
- 不改购物车、订单、运费匹配逻辑。

Verification:

- 文档 PR：`git diff -- docs`
- UI 实现 PR：`bun run check-types`、`bun run lint`、`bun run build`
- 手动样例地址检查：中国 / 上海市 / 上海市 / 浦东新区 / 张江镇 / 祖冲之路 1000 号 3 幢 201
- 验证非中国地址仍可保存和展示。

Risk:

- 中。地址格式影响物流、订单展示、客服检索和短信。

### PR 7: Mock Chat/SMS/Logistics Provider 边界

Scope:

- 设计并实现未注册的 `MockChatProvider`。
- 设计并实现未注册的 `MockSmsProvider`。
- 设计并实现未注册的 `MockLogisticsProvider`。
- 明确 TalkJS、Resend、Algolia、对象存储/CDN 的保留关系。
- 详见 `docs/mock-service-providers.md`。

Non-goals:

- 不删除 TalkJS、Resend、Algolia。
- 不接真实腾讯 IM、环信、阿里云短信、快递100、菜鸟。
- 不改订单、履约、退款、结算状态。
- 不把 mock provider 注册到 `packages/api/medusa-config.ts`。

Verification:

- `bun run check-types`
- `bun run lint`
- provider 单元测试：成功、失败、重复幂等、错误映射。

## Batch 2: 平台化本地市场能力 PR

### PR 8: Admin 市场配置与模块开关骨架

Scope:

- 在 `apps/admin` 中增加市场配置、商户类型准入、模块开关的 UI 骨架。
- 覆盖市场级、商户级、角色级能力展示。
- 能力包含店铺装修、手机快速上架、AI 上架草稿、直播状态、物料接单、配送接单、快递打印、提货卡提货。
- 后续后端 API 合同见 `docs/admin-feature-flag-api-design.md`。

Non-goals:

- 不接真实 API。
- 不写真实 feature flag。
- 不修改权限、支付、订单、退款、结算、佣金逻辑。

Verification:

- `bun --cwd apps/admin lint`
- `bun --cwd apps/admin build`
- 手动检查后台菜单入口和中文文案。

Risk:

- 中。后续真实接入时必须由后端配置、权限和审计日志共同控制，不能只靠前端隐藏入口。

### PR 8A: Admin 模块开放控制后端落地拆分方案

Scope:

- 新增 `docs/admin-feature-flag-backend-split.md`。
- 设计平台默认、市场配置、商户/供应方配置、角色能力四层配置模型。
- 设计 Admin/Vendor/Storefront 能力视图 API。
- 设计 Admin 草稿、校验、发布、回滚 API，以及幂等、审计日志和降级策略。
- 明确 Vendor/Storefront 消费能力视图时的安全边界。

Non-goals:

- 不写业务代码。
- 不修改 `apps/**`、`packages/**`、`package.json`、`bun.lock`。
- 不替代 RBAC、商户归属、订单/支付/结算权限。
- 不接真实支付、短信、IM、直播、物流、快递打印或 AI 服务。

Verification:

- `git diff -- docs/admin-feature-flag-backend-split.md docs/china-localization-task-list.md .codex/queue.md docs/china-localization-progress-board.md`
- 人工确认未修改禁止范围。
- 人工确认文档覆盖配置层级、能力视图 API、Admin 修改 API、幂等、审计、回滚、Vendor/Storefront 消费方式和安全边界。

Risk:

- 低。当前仅文档设计。
- 后续实现为中高风险，必须避免把 feature flag 当作权限系统，且不能顺手修改支付、订单、退款、结算、佣金、payout 或权限业务逻辑。

### PR 9: Vendor 手机快速上架与 AI 草稿骨架

Scope:

- 在 `apps/vendor` 中增加移动优先快速上架入口。
- 增加 AI 一句话生成商品草稿占位。
- 兼容市场物料供应商商品，如泡沫箱、包装箱、冰袋、冰块。

Non-goals:

- 不接真实 AI、微信、IM、短信、物流。
- 不真实发布商品。
- 不改库存、订单、支付、退款、结算、佣金、权限逻辑。

Verification:

- `bun --cwd apps/vendor lint`
- `bun --cwd apps/vendor build`
- 移动端检查快速上架页面不溢出。

Risk:

- 中。AI 输出必须保持草稿态，必须商户确认后才能进入真实发布链路。

### PR 10: Storefront 店铺/搜索门户细化

Scope:

- 继续把 `apps/storefront` 首页调整为爱采购式找货、找店、找市场门户。
- 强化搜索、类目、推荐档口、今日鲜货和本地履约信息。
- 提货卡只保留轻入口。
- 直播只在店铺/档口卡显示状态。

Non-goals:

- 不接真实直播、客服、物流、支付。
- 不把物料采购放入消费者首页主链路。
- 不改 checkout、order、payment、refund、settlement、permission 逻辑。

Verification:

- `bun --cwd apps/storefront build`
- `git diff --check -- apps/storefront`
- 桌面和移动端视觉检查 `http://127.0.0.1:3101/cn`。

Risk:

- 低到中。主要风险是消费者首页与商户物料采购链路混淆。

### PR 11: Provider skeleton baseline

Scope:

- 基于 `docs/mock-service-providers.md` 建立 mock-only Provider 类型边界或 skeleton。
- 覆盖 Chat、SMS、Logistics、Live、AI Listing。

Non-goals:

- 不注册真实 Provider。
- 不接真实服务。
- 不改订单、履约、支付、退款、结算、佣金、权限逻辑。

Verification:

- 如只改文档：`git diff --check -- docs .codex`
- 如改 TypeScript：`bun run check-types`、`bun run lint`

Risk:

- 中。Provider skeleton 后续容易被误注册，需要明确 mock-only 边界。

### PR 12: 提货卡三端 mock UI

Scope:

- Storefront 独立提货卡提货入口。
- Vendor 提货备货/发货/自提核销占位。
- Admin 卡种/批次/冻结/作废/风控/操作日志占位。

Non-goals:

- 不真实兑换。
- 不真实扣库存。
- 不真实生成订单、发货、物流、支付、退款、结算。

Verification:

- 按应用运行 build。
- 人工确认提货卡没有进入 checkout/payment/coupon/cart discount 链路。

Risk:

- 高。提货卡必须保持权益提货凭证定义，不能误接入支付或优惠券链路。
- 手动确认现有 Admin/Vendor 能打开。
- 人工确认 `packages/api/medusa-config.ts` 未接入该 mock 模块。

Risk:

- 中。短信、物流、聊天涉及隐私、频控、对象存储和订单副作用。
- 当前 mock 模块未注册，默认不改变运行时业务行为。

### PR 13: Vendor 店铺/档口装修 API 设计

Scope:

- 新增 `docs/vendor-shop-decoration-api-design.md`。
- 设计 Vendor 店铺/档口装修后端 API 和数据模型草案。
- 覆盖草稿保存、发布审核、预览 token、资质展示、商品分组、公告、配送说明、直播状态、权限边界和审计日志。
- 明确后续模型、Vendor API、Admin 审核、Storefront 公开读取和模块深化的 PR 拆分。

Non-goals:

- 不修改 `apps/**`、`packages/**`、`package.json`、`bun.lock`。
- 不写业务代码。
- 不新增 migration。
- 不接真实文件上传、真实直播、IM、短信、物流或支付服务。
- 不修改商品、库存、订单、支付、退款、结算、佣金或权限逻辑。

Verification:

- `git diff -- docs/vendor-shop-decoration-api-design.md docs/china-localization-task-list.md .codex/queue.md docs/china-localization-progress-board.md`
- `git status --short`
- 人工确认未修改禁止范围文件。
- 人工确认文档未写入真实密钥、真实 provider 参数、真实直播推流地址或真实对象存储 URL。

Risk:

- 低。仅文档设计。
- 后续真实 API 涉及商户数据隔离、公开内容审核和资质脱敏，应拆分为中风险 PR 独立验证。

## Batch 2: 高风险串行 PR

### PR 8: Mock China PaymentProvider 设计

Scope:

- 文档化 `MockChinaPaymentProvider` contract。
- 明确 initiate/authorize/capture/refund/cancel/retrieve 行为。
- 明确 mock notify 触发方式。
- 支付成功只以后端 mock notify 为准。

Non-goals:

- 不接真实微信支付或支付宝。
- 不删除 Stripe 或 system payment provider。
- 不改变生产支付行为。

Verification:

- `bun run check-types`
- `bun run lint`
- provider 单元测试。
- mock 手工流：创建支付为 pending，后端 mock notify 后才完成支付/订单。

Risk:

- 高。即使是 mock，也接近支付状态机。

### PR 9: 支付通知幂等框架

Scope:

- 新增 provider event persistence 设计。
- 签名前置。
- 重复通知短路。
- 失败重试状态。
- 原始 provider event 留存。

Non-goals:

- 不接真实 provider。
- 不改退款、对账、结算。

Verification:

- 有效签名测试。
- 无效签名测试。
- 重复通知测试。
- 乱序通知测试。
- 金额不一致测试。
- 未知订单号测试。

Risk:

- 高。支付通知是支付状态事实来源。

### PR 10: Alipay Provider

Scope:

- 在 adapter 边界内实现支付宝 sandbox/mock provider。
- 校验签名、`app_id`、`seller_id`、`out_trade_no`、`total_amount`、`trade_status`。
- 退款以 `out_request_no` 做业务幂等。

Non-goals:

- 不写真实生产凭据。
- 不跳过通知验签。
- 不以前端返回页判定支付成功。

Verification:

- sandbox 或 mock 签名验证。
- 支付通知幂等测试。
- 退款通知幂等测试。
- 手动 sandbox/mock 支付流。

Risk:

- 高。真实支付 provider。

### PR 11: WeChat Pay Provider

Scope:

- 在 adapter 边界内实现微信支付 sandbox/mock provider。
- 适配 JSAPI/H5/Native/App 预下单设计。
- 通知验签、解密资源、校验商户号、金额、币种、交易状态。

Non-goals:

- 不写真实生产凭据。
- 不跳过通知验签。
- 不以前端返回页判定支付成功。

Verification:

- sandbox 或 mock 签名验证。
- 解密失败测试。
- 重复通知测试。
- 退款通知幂等测试。
- 手动 sandbox/mock 支付流。

Risk:

- 高。真实支付 provider。

### PR 12: 中国退款流程

Scope:

- 记录 refund request。
- 保存 provider refund id。
- 支持退款通知。
- 保存失败原因。
- 保持订单、支付、退款状态一致。

Non-goals:

- 不做对账。
- 不做商家结算释放。

Verification:

- 全额退款测试。
- 部分退款测试。
- 重复退款通知测试。
- 退款失败测试。
- 退款后佣金/结算不可提前释放。

Risk:

- 高。退款影响资金、订单、售后、结算。

### PR 13: 中国支付对账

Scope:

- 导入 provider 账单或 mock statement。
- 保存原始账单行。
- 匹配 provider transaction id、商户订单号、金额、手续费、退款、结算日期。
- 标记差异。

Non-goals:

- 不自动改订单金额。
- 不自动改结算金额。

Verification:

- 支付成功未入账。
- 账单有但系统无。
- 金额不一致。
- 退款未匹配。
- 手动差异复核。

Risk:

- 高。对账影响财务事实。

### PR 14: 商家结算与佣金调整

Scope:

- 在支付、退款、对账稳定后设计 seller payable。
- 处理佣金、运费、优惠、部分退款、售后赔付。
- 输出可审计结算状态、失败原因、操作时间。

Non-goals:

- 不绕过 payout provider。
- 不弱化商家权限。

Verification:

- 结算计算测试。
- 佣金计算测试。
- 退款调整测试。
- 权限/RBAC 测试。
- 商家只能看自己的结算与 payout。

Risk:

- 最高。资金、权限、订单、退款共同交汇。

### PR 15: 权限与 Migration 串行保护

Scope:

- 审计权限、角色、商家数据归属和 migration 对中国本地化任务的影响。
- 任何 schema migration、权限策略、RBAC、商家归属、历史数据迁移都必须串行推进。
- 在 migration 方案中明确回滚、数据备份、灰度和失败恢复策略。

Non-goals:

- 不在 UI 中文化 PR 中顺带改权限。
- 不在支付、退款、对账、结算、佣金 PR 中夹带无关 migration。
- 不绕过现有 Medusa/Mercur 权限和 ownership 约束。

Verification:

- migration dry-run 或等价演练。
- 权限/RBAC 回归测试。
- 商家只能访问自有数据的回归测试。
- migration 回滚或恢复步骤人工复核。

Risk:

- 最高。权限和 migration 会影响数据安全、商家隔离、资金链路和回滚能力，必须串行处理。

## 推荐下一步

推荐先做 `PR 0: 中国本地化第一轮审计文档`，也就是本轮 docs 变更。完成后再并行拆出：

1. `admin-i18n-zhcn-baseline`
2. `vendor-i18n-zhcn-baseline`
3. `storefront-zhcn-baseline`，基于 `apps/storefront`

原因：

- Storefront 归属已指向 `apps/storefront`，后续中文化基线应在该目录内进行。
- Admin/Vendor 中文化基线相对低风险，但能快速暴露 Mercur dashboard 的 i18n 扩展方式。
- 支付、退款、对账、结算、佣金、权限和 migration 必须等文档和 mock provider 边界清楚后串行推进。

## Batch 3: 提货卡系统 PR

提货卡是消费者预先获得的指定权益提货凭证。用户在线上通过卡号 / 卡密 / 二维码识别可提权益，确认固定或可选提货内容、规格、数量、地址或自提时间后，提交提货申请并生成提货单，由平台或商家履约。

提货卡不是支付方式、优惠券、满减券、折扣券、储值卡、余额或购物车抵扣。所有提货卡任务必须区分 consumer order 与 pickup fulfillment order，并保持普通订单、支付、退款、结算、佣金和权限逻辑隔离。

### PR P0: 提货卡系统后端架构文档

Scope:

- 新增或重写 `docs/pickup-card-architecture.md`。
- 设计消费者提货流程、三端职责、数据模型、状态机、安全、普通订单/支付关系、验证步骤和风险点。
- 记录后续 PR 拆分。

Non-goals:

- 不修改 `apps/**`、`packages/**`、`package.json`、`bun.lock`。
- 不写业务代码。
- 不改支付、订单、退款、结算、佣金、权限逻辑。

Verification:

- `git diff -- docs/pickup-card-architecture.md docs/china-localization-task-list.md`
- 人工确认仅允许的两个 docs 文件变化。

Risk:

- 低。仅文档设计。

### PR P1: 模型与接口草案

Scope:

- 设计 `PickupCardType`、`PickupCardBatch`、`PickupCardCredential`、`PickupEntitlement`、`PickupRedemption`、`PickupFulfillmentOrder`、`PickupCardOperationLog`、`PickupCardRiskEvent`。
- 设计 API 草案、workflow 草案、索引、唯一约束、状态机、审计字段和回滚策略。
- 明确 consumer order 与 pickup fulfillment order 的隔离关系。

Non-goals:

- 不实现真实兑换。
- 不写 UI。
- 不修改普通订单、支付、退款、结算、佣金、权限逻辑。

Verification:

- 模型字段评审。
- 状态机表格评审。
- 幂等键、唯一约束、脱敏字段评审。

Risk:

- 中到高。模型一旦落库会成为长期约束。

### PR P2: Mock UI

Scope:

- Storefront mock 提货入口：输入卡号/卡密/扫码占位、展示 mock 权益、确认地址或自提时间、提交 mock 提货申请。
- Vendor mock 提货履约列表：备货、发货、自提核销占位。
- Admin mock 卡种、批次、凭证、风控、日志页面。
- 文案明确提货卡不是支付、优惠、储值、余额或抵扣。

Non-goals:

- 不连接真实兑换 API。
- 不写真实卡密校验。
- 不触发真实库存、订单、支付、物流。

Verification:

- 桌面和移动端检查。
- 人工确认 mock UI 不进入 checkout/payment/coupon/cart discount 入口。
- 人工确认 mock 数据不包含真实卡密。

Risk:

- 中。UI 入口和文案容易误导产品边界，必须单独评审。

### PR P3: Mock provider 与 Mock workflow

Scope:

- 建立 mock entitlement lookup、mock risk decision、mock inventory reservation、mock fulfillment handoff。
- 验证权益识别、提货申请、提货单生成、幂等、失败和异常状态。
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
- 实现卡密生成、慢 hash、salt、pepper version 和 constant-time compare。
- 实现制卡导出安全、短期下载、强权限和操作日志。

Non-goals:

- 不开放消费者真实提货。
- 不接支付、退款、结算、佣金。
- 不保存或展示明文卡密查询能力。

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
- 接入 mock logistics provider；真实物流服务必须另起任务。

Non-goals:

- 不直接接真实快递100、菜鸟或其他物流服务。
- 不让物流状态触发退款、结算、佣金。
- 不改变普通订单履约逻辑。

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

## 商品规格模型后续任务

### PR S1: Product Spec Model 文档

Scope:

- 设计商品规格模型、类目规格模板、价格类型、单位分离、前台展示规则、商户快速上架规则和 AI 草稿解析规则。
- 覆盖海鲜/水产、水果蔬菜、市场物料、种苗、养殖户/种植户供货、外地批发商供货。
- 仅文档和任务文件，不写业务代码。

Non-goals:

- 不实现数据库迁移。
- 不实现真实商品发布、库存扣减、订单、支付、物流、结算。
- 不接真实 AI、微信、IM、短信、物流或支付服务。

Verification:

- 文档明确 `¥68-82/斤` 是价格和计价单位，不是规格。
- 文档明确销售单位、计价单位、库存单位、包装单位分离。
- 文档明确 AI 只能生成草稿，必须人工确认发布。

Risk:

- 低。当前只做设计，但会影响后续后台字段、商户上架和前台展示。

### PR S2: Product Spec Template Admin Design

Scope:

- 设计 Admin 商品规格模板配置、字段类型、必填规则、展示规则、版本和审计。
- 设计 Vendor 读取模板用于手机快速上架和 AI 草稿。
- 设计 Storefront 裁剪后的规格展示视图。
- 覆盖海鲜/水产、水果蔬菜、市场物料、种苗、养殖户/种植户和外地批发商。

Non-goals:

- 不实现数据库迁移。
- 不实现 Admin 写接口。
- 不实现真实商品发布、库存扣减、订单、支付、退款、物流、结算。
- 不接真实 AI、微信、IM、短信、物流或支付服务。

Verification:

- 文档明确规格、价格、库存、履约分离。
- 文档明确模板版本、回滚和审计要求。
- 文档明确 AI 草稿不能直接发布。

Risk:

- 低。当前只做设计；后续 Admin 写接口和商品创建 workflow 需要单独评审。

### PR S3: Admin Product Spec Template UI

Scope:

- 在 Admin 商品管理菜单增加“规格模板”只读占位页。
- 展示类目规格模板、单位拆分、字段边界、版本状态和三端读取边界。
- 所有按钮保持占位或禁用，不接真实后端写入。

Non-goals:

- 不实现模板数据库、migration 或真实 Admin 写接口。
- 不实现真实商品发布、库存扣减、订单、支付、退款、物流、结算。
- 不接真实 AI、微信、IM、短信、物流或支付服务。

Verification:

- `bun --cwd apps/admin lint`
- `bun --cwd apps/admin build`
- 人工检查 Admin 商品管理菜单下“规格模板”页面。

Risk:

- 低。当前只读 UI；后续模板写接口、版本审计和商品创建 workflow 需单独任务。
