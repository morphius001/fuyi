# Vendor Market Context Next Plan

更新时间：2026-05-07 Asia/Shanghai

## 目标

把已经完成的 Vendor 市场上下文前端只读壳，推进到可接真实只读 API 的下一轮拆分计划。

本计划只做文档和任务拆分，不写业务代码，不新增 migration，不注册真实运行时逻辑。

## 当前状态

已完成：

- Vendor 端 `retrieveChinaVendorMarketContext()` client/fallback。
- Vendor 首页市场、档口、公告、配送摘要只读展示。
- Vendor 店铺资料页市场归属只读展示。
- Vendor 物流页 delivery profiles 只读展示。
- Vendor 客服页市场公告只读展示。
- 合并后 Vendor `lint` / `build` 验证通过。

未完成：

- `/vendor/china/market-context` 后端 route。
- 从 Vendor 登录态解析当前 seller / merchant 身份。
- 从真实 read model builder 组装 memberships、announcements、delivery profiles、module hints。
- API 单元测试和 route 集成验证。
- 浏览器视觉回归和真实 API 可用时的 UI 状态验证。

## 下一轮 PR 顺序

### PR AS：Vendor Market Context Builder

范围：

- 在 `packages/api` 中新增 Vendor market context 只读 view model 类型和 builder。
- 输入为已解析的 seller / vendor 身份和可选 market filter。
- 输出与 `docs/vendor-market-context-api-plan.md` 保持一致。
- 允许使用现有 static adapter / market read model seed 作为第一版数据源。

禁止：

- 不新增 route。
- 不新增 migration。
- 不修改订单、发货、支付、退款、结算、佣金、权限。
- 不让 delivery profile 影响 checkout。

验证：

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- <新增 Vendor market context builder 单测>
cd packages/api && bun run build
git diff --check
```

### PR AT：Vendor Market Context Readonly Route

范围：

- 新增 `GET /vendor/china/market-context`。
- 从当前 Vendor 登录态解析 seller / merchant 身份。
- 只返回当前商户可见的 memberships、announcements、deliveryProfiles、moduleHints。
- API 不可用或无上下文时返回安全 fallback / empty mode。

禁止：

- 不接受前端传入 `sellerId` 作为可信身份。
- 不返回其它商户或其它市场的敏感归属信息。
- 不提供 POST / PATCH / DELETE。
- 不写入审计事件以外的业务状态。

验证：

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- <新增 route/builder 单测>
cd packages/api && bun run build
git diff --check
```

人工复核：

- 未登录返回 unauthorized 或空安全结果。
- 请求非所属 marketId 不泄露数据。
- `runtimeEnabled` 固定为 `false`。

### PR AU：Vendor Client API Availability Polish

范围：

- 保留现有 `apps/vendor/src/lib/china-vendor-market-context-client.ts`。
- 增加更清晰的 `mode` / `source` / error note 显示策略。
- API 可用时使用后端数据；不可用时继续保留静态 mock。

禁止：

- 不改页面主要布局。
- 不接真实短信、IM、物流、直播、AI provider。
- 不修改支付、订单、退款、结算、佣金、权限。

验证：

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

### PR AV：Vendor Pages API State QA

范围：

- 只做 Vendor 首页、店铺资料、物流、客服页的 API 可用 / fallback / empty 三态视觉 QA 清单。
- 如需小幅文案调整，限制在只读状态提示，不改变业务流程。

验证：

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

浏览器检查：

- 首页市场摘要不挤压快速上架入口。
- 店铺资料页市场归属和档口信息不被误认为可编辑。
- 物流页 delivery profiles 明确是展示能力，不是发货规则。
- 客服页公告明确是平台/市场公告，不提供发布入口。

## 数据边界

Vendor market context 只读数据可包含：

- 当前商户所属市场名称、城市、区县、营业时间、公告。
- 当前商户档口号、档口名称、主档口标记。
- 当前商户商户类型：海鲜档口、水果蔬菜、物料供应商、配送供应商、养殖户、种植户、种苗批发、外地批发商等。
- 市场配送展示能力和商户可选配送方式说明。
- 模块开放提示：快速上架、店铺装修、物料供应、直播状态、AI 上架草稿、快递打印等。

不得包含：

- 其它商户的私有订单、库存、结算、佣金或客户信息。
- 真实卡密、支付密钥、短信/IM/物流 credential。
- 可直接驱动 checkout、订单、发货、退款、结算或权限的运行时配置。

## 风险门禁

任何 PR 出现以下情况必须停止并拆新高风险任务：

- 修改 payment、order、refund、settlement、payout、commission、permission。
- 让市场配送 profile 影响 checkout shipping options。
- 允许商户端编辑市场归属、档口、商户类型或模块开关。
- 接入真实短信、IM、物流、直播、AI 或支付 provider。
- 需要 migration 或真实数据写入。

## 队列建议

第二十七轮建议：

1. `vendor-market-context-builder`：实现 Vendor market context builder 和单元测试，不注册 route。
2. `vendor-market-context-readonly-route`：实现只读 Vendor route 和鉴权边界。
3. `vendor-market-context-client-api-polish`：Vendor client 对接真实 route 的可用/空/fallback 状态。
4. `vendor-market-context-visual-qa`：四个 Vendor 页面做 API 状态视觉 QA。
