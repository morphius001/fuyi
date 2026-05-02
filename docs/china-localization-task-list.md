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
- 设计 Admin/Vendor 地址展示格式。
- 设计 Storefront checkout 地址表单需求，等待 Storefront 位置确认。
- 复用 Medusa 标准字段和 `is_default_shipping` / `is_default_billing`。

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

- 设计 `MockChatProvider`。
- 设计 `MockSmsProvider`。
- 设计 `MockLogisticsProvider`。
- 明确 TalkJS、Resend、Algolia、对象存储/CDN 的保留关系。

Non-goals:

- 不删除 TalkJS、Resend、Algolia。
- 不接真实腾讯 IM、环信、阿里云短信、快递100、菜鸟。
- 不改订单、履约、退款、结算状态。

Verification:

- `bun run check-types`
- `bun run lint`
- provider 单元测试：成功、失败、重复幂等、错误映射。
- 手动确认现有 Admin/Vendor 能打开。

Risk:

- 中。短信、物流、聊天涉及隐私、频控、对象存储和订单副作用。

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
