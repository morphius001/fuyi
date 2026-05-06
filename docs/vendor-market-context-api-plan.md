# Vendor 市场上下文只读 API 合同计划

## 目标

为商户后台设计 Vendor 专用的市场上下文只读 API，让 Vendor UI 后续可以安全读取：

- 当前商户所属市场
- 主档口和跨市场档口
- 市场营业时间
- 商户侧市场公告
- 市场配送能力展示说明
- 商户类型和模块开放提示

本文件只做 API 合同和落地拆分设计，不实现接口、不新增 migration、不修改 `apps/**` 或 `packages/**`。

## 核心原则

- Vendor 端不能用消费者 Store API 推断商户权限。
- API 必须以登录商户身份为边界，只返回当前商户可见的市场上下文。
- API 是只读展示，不改变 checkout shipping options、订单、发货、支付、结算、佣金或权限。
- 配送能力字段必须明确 `runtimeEnabled: false`，防止被误认为已在下单链路生效。
- API 失败不能阻断商户后台，前端 fallback 为“暂无市场上下文”。

## 建议路由

```text
GET /vendor/china/market-context
GET /vendor/china/market-context/memberships
GET /vendor/china/market-context/announcements
GET /vendor/china/market-context/delivery-profiles
```

第一批建议只实现：

```text
GET /vendor/china/market-context
```

其它拆成后续补充路由，避免一次 PR 改太多。

## 鉴权和身份边界

Vendor API 必须从当前 Vendor 登录态解析商户身份，而不是接受前端传入 `sellerId` 作为可信来源。

请求参数建议：

```ts
type VendorMarketContextQuery = {
  marketId?: string
  includeAnnouncements?: boolean
  includeDeliveryProfiles?: boolean
}
```

边界：

- `marketId` 只能用于当前商户已有 membership 的市场过滤。
- 如果请求的 `marketId` 不属于当前商户，返回 404 或空上下文，不能泄露其它市场档口信息。
- 不允许通过 query 传入 `sellerId` 来查看别的商户。
- Admin 视角需要另走 Admin API，不复用 Vendor API。

## 响应结构

```ts
type VendorMarketContextResponse = {
  marketContext: VendorMarketContextView
}

type VendorMarketContextView = {
  mode:
    | "vendor_market_context_read_only"
    | "vendor_market_context_empty"
    | "vendor_market_context_fallback"
  source:
    | "china_market_read_model"
    | "static_adapter"
    | "vendor_market_context_fallback"
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
```

### Membership

```ts
type VendorMarketMembershipView = {
  id: string
  marketId: string
  marketName: string
  marketSlug: string
  province?: string
  city: string
  district?: string
  boothNo: string
  stallName?: string
  isPrimary: boolean
  status: "pending" | "open" | "paused" | "closed"
  businessHours?: string
  serviceRange?: string
  merchantTypeKeys: string[]
}
```

### Announcement

```ts
type VendorMarketAnnouncementView = {
  id: string
  marketId: string
  title: string
  content: string
  severity: "info" | "warning" | "urgent"
  publishedAt?: string
  expiresAt?: string
}
```

只返回 `audience` 包含 `merchant` 或 `all` 的公告，不返回消费者专用公告或配送供应商专用公告。

### Delivery Profile

```ts
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
  checkoutImpact: "none"
}
```

`enabled` 只表示配置展示可见，不代表 checkout 已启用。

### Module Hint

```ts
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

Module hint 只用于页面解释，不作为 RBAC 结果。

## 错误和 fallback

建议错误结构：

```ts
type VendorMarketContextError = {
  code:
    | "vendor_market_context_unauthorized"
    | "vendor_market_context_not_found"
    | "vendor_market_context_unavailable"
  message: string
  retryable: boolean
}
```

fallback 响应：

```ts
{
  "marketContext": {
    "mode": "vendor_market_context_fallback",
    "source": "vendor_market_context_fallback",
    "sellerId": "current",
    "memberships": [],
    "announcements": [],
    "deliveryProfiles": [],
    "moduleHints": [],
    "runtimeEnabled": false,
    "note": "Vendor market context API is unavailable; the UI must keep merchant workflows usable."
  }
}
```

## 缓存策略

- Vendor UI 可短缓存 30 到 60 秒。
- 公告可以单独按 `publishedAt` 或 `updatedAt` 做重新拉取。
- 不能把市场上下文缓存作为权限来源。
- 如果后续加入写入或发布能力，必须拆新任务并加审计日志。

## 审计与日志

只读 API 可记录访问日志，但不需要业务审计事件。

建议记录：

- route
- sellerId
- selected marketId
- response mode
- read model source
- request id

不得记录真实密钥或敏感卡密。

## PR 拆分

1. `vendor-market-context-api-contract`
   - 新增后端类型、builder 和单元测试。
   - 不注册运行时路由。

2. `vendor-market-context-api-route`
   - 新增 `GET /vendor/china/market-context`。
   - 只读、fallback、seller 身份边界。

3. `vendor-market-context-client`
   - `apps/vendor` 新增只读 client/fallback。
   - 不改页面布局。

4. `vendor-home-market-context`
   - 首页展示当前市场、档口和公告摘要。

5. `vendor-profile-market-context`
   - 店铺资料页展示市场归属。

6. `vendor-delivery-context-readonly`
   - 配送设置页只读展示 delivery profiles，不影响 checkout。

## 验证要求

合同 / builder PR：

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- <新增单测路径>
cd packages/api && bun run build
git diff --check
```

Vendor client / UI PR：

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

必须人工确认：

- 没有通过前端传入 `sellerId` 查看其它商户。
- `runtimeEnabled` 始终为 `false`。
- 配送 profile 不影响 checkout shipping options。
- 未修改支付、订单、退款、结算、佣金、权限或真实履约。

## 回滚方式

- API route 可通过移除路由文件回滚。
- Vendor client fallback 返回空上下文。
- Vendor 页面必须在空上下文下继续可用。
- 如果发现任何影响 checkout、订单、权限或结算的代码混入，整 PR 回滚。
