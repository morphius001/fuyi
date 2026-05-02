# 中国大陆本地化第一轮审计

日期：2026-05-02  
工作目录：`/home/codex/code/fuyi-audit-cn`  
分支：`china/localization-audit`  
性质：只读审计与文档规划

## 结论摘要

当前仓库是 MercurJS + MedusaJS v2 monorepo，包含：

- `packages/api`：后端 API、Mercur/Medusa 配置、API routes、seed、测试入口。
- `apps/admin`：平台运营后台壳应用。
- `apps/vendor`：商家后台壳应用。

当前未发现 `apps/storefront`，也未发现其他消费者前台应用入口。`packages/api/src/api/store/custom/route.ts` 只是 Store API 示例路由，不是 Storefront。

本地业务实现很薄。支付、订单、退款、佣金、结算、权限等高风险能力主要来自 `@mercurjs/core` 与 `@medusajs/medusa`，当前本地源码没有对应业务覆写。本轮只生成和更新 `docs/` 下文档，不修改 `apps/` 或 `packages/` 业务代码。

## 环境与验证状态

- 当前 worktree：`/home/codex/code/fuyi-audit-cn`
- 主项目目录：`/home/codex/code/fuyi`
- 当前分支：`china/localization-audit`
- package manager：`bun@1.3.13`
- Node 目标版本：24
- `bun install`：已完成
- `bun run lint`：已通过
- `bun run check-types`：当前没有实际执行任务。本轮未重新执行该命令，原因是本轮目标为审计文档，且需要记录该事实。
- 本轮验证以只读目录扫描、关键文件读取、关键字搜索、git 状态检查为主。

## 已检查关键路径

- `package.json`
- `blocks.json`
- `packages/api/package.json`
- `packages/api/medusa-config.ts`
- `packages/api/.env.template`
- `packages/api/src/api/middlewares.ts`
- `packages/api/src/api/admin/custom/route.ts`
- `packages/api/src/api/store/custom/route.ts`
- `packages/api/src/scripts/seed.ts`
- `packages/api/integration-tests/http/health.spec.ts`
- `apps/admin/package.json`
- `apps/admin/src/main.tsx`
- `apps/admin/src/i18n/index.ts`
- `apps/admin/src/i18n/en.json`
- `apps/vendor/package.json`
- `apps/vendor/src/main.tsx`
- `apps/vendor/src/i18n/index.ts`
- `apps/vendor/src/i18n/en.json`
- `docs/china-localization-audit-plan.md`
- `docs/china-worktree-plan.md`
- `docs/china-localization-task-list.md`

## Storefront

当前仓库未发现 `apps/storefront`，`apps/` 下只有 `admin` 和 `vendor`。根 `package.json` 的 workspace 覆盖 `apps/*`，因此未来可以把消费者前台作为 `apps/storefront` 接入，但当前不能假设它已经存在。

建议后续 Storefront 规划：

- 位置：`apps/storefront`
- 默认开发端口：优先使用 `8000`，与 `packages/api/.env.template` 中 `STORE_CORS` 的现有意图一致。
- 后端来源：通过 Medusa Store API 访问 `packages/api`，开发环境后端为 `http://localhost:9000`。
- 首批 PR 只做前台接入、中文化和展示层 UX，不改变 checkout、order、payment、refund、payout、commission、permission 逻辑。

Storefront 缺口：

- 无消费者首页、搜索、类目、商品列表、商品详情、购物车、结账入口。
- 无前台中国地址表单。
- 无移动端粘性购买动作。
- 无前台售后入口。
- 无前台支付结果 pending/处理中页面。

## Admin Panel

`apps/admin` 当前是很薄的 Mercur Admin 壳应用：

- `apps/admin/src/main.tsx` 直接渲染 `@mercurjs/admin`。
- `apps/admin/src/i18n/index.ts` 只注册 `en`。
- `apps/admin/src/i18n/en.json` 只有 `customFields` 示例英文文案。
- 当前没有 `apps/admin/src/routes`，没有本地自定义页面、菜单或路由扩展。
- `packages/api/medusa-config.ts` 通过 `@mercurjs/core/modules/admin-ui` 将它挂载到 `/dashboard`。

主要差距：

- 中文化未落地。本地无 `zhCN` 覆盖资源，也未配置默认中文语言。
- 菜单 IA 仍偏通用 Medusa/Mercur。中国平台运营常用分组尚未形成。
- 缺少独立“售后管理”“财务聚合”“支付与对账”“客服与消息”“风控”“内容”视角。
- 财务相关入口存在于 `/payouts`、`/settings/commission-rates` 等路径，但缺少中国运营常见的结算周期、商家账单、渠道事件、对账差异、失败原因视图。
- 客服、IM、短信、站内信入口未发现。

Admin Panel 目标信息架构：

- 首页
- 商家管理
- 商品管理
- 订单管理
- 售后管理
- 支付与对账
- 结算管理
- 营销管理
- 客服与消息
- 系统配置

边界：

- 中文化、菜单规划和只读聚合页可并行推进。
- 不修改 RBAC、权限、支付、订单、退款、结算、佣金逻辑。
- 不直接修改 `node_modules`、Mercur core 或 Medusa core。

## Seller / Vendor Panel

`apps/vendor` 当前也是很薄的 Mercur Vendor 壳应用：

- `apps/vendor/src/main.tsx` 直接渲染 `@mercurjs/vendor`。
- `apps/vendor/src/i18n/index.ts` 只注册 `en`。
- `apps/vendor/src/i18n/en.json` 只有 `customFields` 示例英文文案。
- 当前没有 `apps/vendor/src/routes`，没有项目级自定义页面、菜单项或国内工作流入口。
- `packages/api/medusa-config.ts` 通过 `@mercurjs/core/modules/vendor-ui` 将它挂载到 `/seller`。

主要差距：

- 默认语言未切到中文，仍有硬编码英文风险，例如 `Payouts`、`Commission` 等。
- 国内商家后台工作流尚未形成：首页、商品、订单、物流、售后、客服、店铺、结算、评价、账号权限。
- 物流入口分散在库存、订单履约、库存地点配置中，没有“物流管理 / 发货 / 运费模板 / 服务区域 / 物流单号”聚合视角。
- 售后只有订单详情或退货原因等分散入口，没有“售后管理”列表视角。
- 客服管理、评价管理没有明显路由或菜单。
- 店铺地址表单沿用通用地址字段，未按中国省 / 市 / 区县 / 街道 / 详细地址组织。

Vendor Panel 目标信息架构：

- 首页
- 商品管理
- 订单管理
- 物流管理
- 售后管理
- 客服管理
- 店铺管理
- 结算管理
- 评价管理
- 账号权限

边界：

- 结算、退款、佣金、权限、订单归属、履约状态变更都属于高风险串行工作。
- 第一批 Vendor PR 应保持中文化、菜单组织、只读入口、文档规划。

## 中国地址

当前仓库没有 Storefront，因此无法审计消费者 checkout 收货地址表单。Admin/Vendor 地址能力主要来自 Medusa/Mercur 默认地址字段。

现有地址契约可承载：

- `first_name`
- `last_name`
- `phone`
- `company`
- `address_1`
- `address_2`
- `city`
- `country_code`
- `province`
- `postal_code`
- `metadata`

默认地址能力已存在于 Medusa customer address API：

- `is_default_shipping`
- `is_default_billing`

中国地址字段映射建议：

| 中国字段 | 建议映射 | 说明 |
| --- | --- | --- |
| 省 / 自治区 / 直辖市 | `province` | 后续可用名称或代码，但需统一规范 |
| 市 | `city` | 地级市、地区、自治州 |
| 区县 | `address_2` 或 `metadata.district` | 过渡期不要新增模型字段 |
| 街道 / 乡镇 | `address_2` 或 `metadata.street` | 与区县一起需要统一序列化 |
| 详细地址 | `address_1` | 小区、楼栋、门牌号 |
| 收货人 | `first_name` | 中文姓名可完整放入 `first_name`，`last_name` 可留空 |
| 手机号 | `phone` | 展示用大陆手机号；后端合同需要时转 E.164 |
| 邮编 | `postal_code` | 可选 |
| 默认地址 | `is_default_shipping` / `is_default_billing` | 复用 Medusa 现有字段 |

风险：

- 直接改 Medusa/Mercur 地址模型、购物车地址序列化、订单地址结构或运费匹配字段，会影响 checkout、订单拆单、运费、履约和历史订单展示。
- 区县 / 街道如果临时放入 `address_2` 或 `metadata`，必须统一格式化规范，否则会影响订单展示、导出、物流对接。
- 手机号 E.164 存储与本地展示格式需要统一，否则影响短信、物流面单、客服检索。

## Chat / SMS / Logistics / Search / Storage

当前本地源码未发现 TalkJS、Resend、Algolia、短信、物流聚合、搜索、对象存储或 CDN provider 实际接入。项目规则要求保留 Stripe、Algolia、Resend、TalkJS，因此中国本地化替代方案必须是 additive、switchable、adapter-based。

当前情况：

- `packages/api/src/api` 只有两个 custom route，均返回 200。
- `packages/api/src/api/middlewares.ts` 的 `routes` 为空。
- `packages/api/src/modules`、`workflows`、`subscribers`、`jobs`、`links` 当前只有 README。
- 物流相关只出现在 seed 数据：Medusa fulfillment、`manual_manual` provider、Europe fulfillment set、Standard/Express shipping options。
- 商品图片使用 Medusa 公共 S3 URL 示例，不等于本项目已有对象存储/CDN provider。

Mock provider 边界：

- `MockChatProvider`：生成稳定 conversation/message id、模拟 unread count、返回可审计错误码。TalkJS 后续作为同一接口的 adapter 保留。
- `MockSmsProvider`：模拟验证码/通知短信发送，记录模板、场景、幂等键、脱敏手机号、失败原因。Resend 继续归属 email channel。
- `MockLogisticsProvider`：对接 Medusa fulfillment 边界，模拟 carrier code、运单号、轨迹节点、异常件、签收状态。不得直接改订单、退款或结算状态。

## Payment & Settlement

当前仓库业务代码里没有自定义 payment、refund、commission、payout、order split 实现。本地配置只加载 Mercur core，seed 使用默认 `pp_system_default`。Stripe 依赖存在，但本轮未删除、未替换、未接真实微信支付或支付宝。

支付架构原则：

- 支付成功必须以后端异步通知为准，不能以前端 return URL 为准。
- 通知必须验签。
- 通知必须幂等。
- 通知必须可重试。
- 原始 provider 事件、provider transaction id、退款 id、失败原因必须可审计。

建议 provider 家族：

- `MockChinaPaymentProvider`
- `WeChatPayProvider`
- `AlipayProvider`

建议模块边界：

```text
packages/api/src/modules/china-payment/
  providers/mock-china-payment.ts
  providers/wechat-pay.ts
  providers/alipay.ts
  services/notification-idempotency.ts
  services/signature-verifier.ts
  services/reconciliation.ts
  models/china-payment-event.ts
  models/china-payment-reconciliation-record.ts
```

以上只是后续架构建议，不在本轮实现。

高风险点：

- 支付通知：项目本地还没有通知事件落库、状态锁、重复事件短路、失败重试记录。
- 退款：中国支付退款通常异步最终一致，不能只靠同步 `refundPayment` 返回改变最终状态。
- 对账：只能标记差异，不应自动改订单或结算金额。
- 商家结算：Mercur 拆单后同一 payment collection 可能关联多个 seller order，capture 分摊、优惠、运费佣金、部分退款、售后赔付都会影响 seller payable。

## 架构与并行边界

可并行：

- 文档整理与审计报告。
- Admin 中文化、菜单 IA、只读运营入口规划。
- Vendor 中文化、菜单 IA、只读商家入口规划。
- Storefront 归属确认和 UX 规格。
- 中国地址 UI/模型设计文档，不含 migration。
- Mock Chat/SMS/Logistics provider 边界设计。

必须串行：

- 支付 provider 行为。
- 支付通知幂等框架。
- 支付宝 Provider。
- 微信支付 Provider。
- 退款。
- 对账。
- 佣金。
- 商家结算。
- payout。
- 权限/RBAC 行为变更。
- 任何数据库 migration。

## 第一批低风险 PR

1. `docs-china-audit`
   - 范围：本轮四份 docs。
   - 非目标：任何业务代码、依赖、真实 provider、数据库 migration。

2. `admin-i18n-zhcn-baseline`
   - 范围：Admin 中文资源、术语表、默认语言方案验证。
   - 非目标：权限、订单、支付、退款、结算、佣金。

3. `vendor-i18n-zhcn-baseline`
   - 范围：Vendor 中文资源、术语表、默认语言方案验证。
   - 非目标：订单归属、结算、退款、佣金、权限。

4. `storefront-location-plan`
   - 范围：确认 Storefront 是否在其他仓库；如果不在，规划 `apps/storefront` scaffold。
   - 非目标：实现 checkout、支付、订单状态变更。

5. `china-address-ui-design`
   - 范围：中国地址映射、展示格式、表单顺序、验证清单。
   - 非目标：新增字段或 migration。

6. `mock-chat-sms-logistics-boundary`
   - 范围：Mock provider 接口与错误语义设计。
   - 非目标：真实 IM、短信、物流服务接入。

## 高风险串行 PR

1. `china-payment-event-idempotency`
2. `mock-china-payment-provider`
3. `alipay-provider`
4. `wechat-pay-provider`
5. `china-refund-flow`
6. `china-reconciliation`
7. `commission-adjustment`
8. `merchant-settlement`
9. `payout-provider`
10. `rbac-permission-changes`
11. `database-migrations`

## 本轮验证

本轮完成：

- 启动 7 个并行审计子代理，分别覆盖 Storefront、Admin、Vendor、Address、Chat/SMS/Logistics、Payment/Settlement、Architecture/Risk。
- 使用只读命令检查目录、Git 状态、关键配置、源码入口与现有 docs。
- 确认目标仓库没有 `apps/storefront`。
- 确认 Admin/Vendor 均为 Mercur dashboard 壳应用，当前没有本地 `src/routes`。
- 确认本地没有自定义支付、退款、结算、佣金、权限实现。
- 确认本轮只更新 `docs/` 目标文档。

未执行：

- 未执行 `bun run check-types`，并记录当前没有实际执行任务这一已知情况。
- 未执行 `bun run lint`，因为用户已提供当前 lint 已通过且本轮只改 Markdown 文档。
- 未执行 build/test/dev server。
