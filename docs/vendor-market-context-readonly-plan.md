# Vendor 市场上下文只读接入计划

## 目标

让商户后台先具备“知道自己在哪个市场经营”的只读上下文能力：

- 商户所属市场
- 档口号 / 档口名称
- 是否主档口
- 跨市场经营关系
- 市场营业时间
- 市场公告
- 市场支持的配送能力
- 市场级模块开放说明

本阶段只做 read-only 规划，不修改 `apps/vendor/**`，不让任何配送、订单、支付、结算、佣金或权限逻辑真实生效。

## 非目标

- 不修改 checkout shipping options。
- 不创建真实配送规则。
- 不确认真实发货。
- 不修改订单履约状态。
- 不修改商户权限、佣金、结算或提现规则。
- 不接真实物流、短信、IM、直播或 AI Provider。
- 不把市场开关直接作为权限判断来源。

## 背景

当前系统已经有只读市场 read model/API：

- Store 侧：`/store/china/markets`
- Store 侧：`/store/china/markets/:slug`
- Store 侧：`/store/china/markets/:slug/sellers`
- Admin 侧：`/admin/china/markets`
- Admin 侧：`/admin/china/markets/:id`

Vendor 后续不应该直接复用消费者 Store API 去推断商户权限，也不应该在前端硬编码市场、档口或配送能力。建议新增 Vendor 专用只读上下文视图，先作为展示信息和入口引导，不作为运行时业务判断。

## 建议只读数据形态

```ts
type VendorMarketContextView = {
  mode: "vendor_market_context_read_only"
  source: "china_market_read_model"
  sellerId: string
  sellerHandle?: string
  primaryMembership?: VendorMarketMembershipView
  memberships: VendorMarketMembershipView[]
  announcements: VendorMarketAnnouncementView[]
  deliveryProfiles: VendorMarketDeliveryProfileView[]
  moduleHints: VendorMarketModuleHintView[]
  runtimeEnabled: false
  note: string
}

type VendorMarketMembershipView = {
  id: string
  marketId: string
  marketName: string
  marketSlug: string
  city: string
  district?: string
  boothNo: string
  stallName?: string
  isPrimary: boolean
  status: "pending" | "open" | "paused" | "closed"
  businessHours?: string
  serviceRange?: string
}

type VendorMarketAnnouncementView = {
  id: string
  marketId: string
  title: string
  content: string
  severity: "info" | "warning" | "urgent"
  publishedAt?: string
}

type VendorMarketDeliveryProfileView = {
  id: string
  marketId: string
  deliveryType:
    | "market_pickup"
    | "merchant_self_delivery"
    | "market_unified_delivery"
    | "delivery_supplier"
    | "cold_chain_express"
  enabled: boolean
  displayName: string
  serviceAreaNote?: string
  cutoffTime?: string
  merchantSelectable: boolean
  runtimeEnabled: false
}

type VendorMarketModuleHintView = {
  key:
    | "quick_listing"
    | "store_decoration"
    | "market_materials"
    | "livestream_status"
    | "ai_listing_draft"
    | "express_print"
  label: string
  visible: boolean
  reason: string
  runtimeEnabled: false
}
```

## Vendor 页面消费方式

### 首页

首页展示“当前经营市场”摘要：

- 主市场名称和档口号
- 营业时间
- 最新市场公告
- 今日需要关注的市场事项
- 如果商户跨多个市场，提供只读市场切换标签

首页只能展示上下文，不改变订单列表、发货能力、结算或权限。

### 店铺资料

店铺资料页展示市场关系：

- 所属市场列表
- 主档口和非主档口
- 档口号、档口名称、经营状态
- 市场地址和服务范围

商户可以看到这些信息，但本阶段不允许在 Vendor 端修改市场归属。市场归属应由 Admin 审核和后台配置流程控制。

### 配送设置

配送设置页可以显示市场支持能力：

- 市场统一配送
- 商家自行配送
- 市场自提
- 配送供应商
- 冷链快递

这批信息只做展示和后续接入说明。即使显示“已启用”，也必须标记为 `runtimeEnabled: false`，不能影响 checkout shipping options。

### 公告中心

公告中心展示面向商户的市场公告：

- 市场停市 / 延迟开市
- 冷链、装卸、档口管理通知
- 配送区域临时调整说明
- 风险或合规提示

公告只读，不允许 Vendor 端发布市场公告。

### 快速上架

快速上架页读取市场上下文作为提示：

- 当前市场常用类目
- 档口经营类型
- 规格模板提示
- 上架前市场合规提醒

市场上下文只能帮助生成草稿和提示，不直接发布真实商品。

## 跨市场与多档口策略

一个商户可能属于多个市场，也可能有多个档口。Vendor 端建议：

- 默认选中 `isPrimary: true` 的市场关系。
- 如果有多个主档口异常，显示只读风险提示，不在前端自动纠正。
- 跨市场商户在首页顶部提供市场切换标签，但切换只影响页面展示上下文。
- 订单、商品、库存、结算仍按后端真实归属和权限判断，不由这个只读上下文决定。

## 商户类型关系

商户类型后续至少包含：

- 海鲜档口
- 水果蔬菜商户
- 市场物料供应商
- 配送供应商
- 养殖户
- 种植户
- 种苗批发商
- 外地批发商

Vendor 市场上下文只读视图可以显示角色提示，但不能直接控制 RBAC。真实角色开通、菜单可见性、供应商接单能力、配送能力和结算规则需要后续独立高风险任务。

## PR 拆分建议

1. `vendor-market-context-api-plan`
   - 只写 Vendor market context API 合同和安全边界文档。
   - 不改 `apps/**` 或 `packages/**`。

2. `vendor-market-context-client`
   - 在 `apps/vendor` 新增只读 client/fallback。
   - 不改页面布局。
   - API 失败时返回空上下文。

3. `vendor-home-market-context`
   - 首页展示主市场、档口号、公告和多市场切换标签。
   - 不影响订单、履约或权限。

4. `vendor-store-profile-market-context`
   - 店铺资料页展示市场归属和档口信息。
   - 不提供保存市场归属。

5. `vendor-fulfillment-context-readonly`
   - 配送设置页展示市场配送 profile。
   - 明确 `runtimeEnabled: false`。
   - 不修改 checkout shipping options。

6. `vendor-announcements-readonly`
   - 公告中心展示商户侧市场公告。
   - 不发布公告。

## 验证策略

每个实现 PR 至少需要：

- `cd apps/vendor && bun run lint`
- `cd apps/vendor && bun run build`
- `git diff --check`
- 人工确认页面没有出现翻译 key。
- 人工确认没有修改 `packages/api` 高风险业务逻辑。
- 人工确认配送 profile 只展示，不影响 checkout。

如果新增 API，则额外验证：

- API typecheck。
- 只读 API 单元测试。
- API build。

## 回滚方式

- Vendor client 和页面展示可以通过前端 fallback 回到空上下文。
- 如果只读 API 异常，Vendor 页面展示“暂无市场上下文”，不能阻断商户操作。
- 任何影响订单、发货、支付、结算、佣金或权限的改动都不应进入本组 PR；如果误入，整 PR 回滚。

## 风险点

- 市场配送能力容易被误解为 checkout 已经生效，页面必须明确只读。
- 跨市场商户不能只用前端切换来决定订单或库存归属。
- 商户类型不是 RBAC；真实开通需要后台审核和权限链路。
- 公告展示不能替代正式消息送达或合规通知。
- 快速上架可以使用市场上下文做提示，但不能绕过审核或直接发布。
