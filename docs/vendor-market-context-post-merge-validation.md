# Vendor Market Context Post-Merge Validation

更新时间：2026-05-07 Asia/Shanghai

## 范围

本报告验证 PR AL-AP 合并后的 Vendor 市场上下文只读接入：

- PR AL：新增 Vendor market context client 和空 fallback。
- PR AM：Vendor 首页展示市场、档口、公告和配送只读摘要。
- PR AN：Vendor 店铺资料页展示市场归属只读块。
- PR AO：Vendor 物流页展示 delivery profiles 只读区。
- PR AP：Vendor 客服页展示商户侧市场公告只读区。

本轮只验证合并后的 Vendor 前端状态，不新增真实 API、不保存配置、不发布公告、不发送短信/IM、不影响订单、履约、支付、退款、结算、佣金或权限。

## 验证环境

验证 worktree：

```text
/home/codex/code/fuyi-pr-aq-vendor-market-validation-cn
```

基准提交：

```text
8ab39af [china] PR AP Vendor announcements readonly
```

## 验证结果

通过项：

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

Vendor build 输出摘要：

```text
vite v5.4.21 building for production...
33 modules transformed
dist/assets/index-BfvbMC6j.js 220.91 kB gzip 73.75 kB
built in 634ms
```

## 安全边界复核

确认未修改：

- `packages/api/**`
- payment / refund / payout / settlement / commission 逻辑
- order、checkout、shipping option、fulfillment mutation
- RBAC / permission / ProtectedRoute / 登录逻辑
- Stripe、Algolia、Resend、TalkJS 集成
- 真实微信支付、支付宝、短信、IM、物流、直播、AI provider
- 真实密钥、商户号、token 或生产 credential

确认保留：

- `retrieveChinaVendorMarketContext()` 在 API 不存在或请求失败时返回空 fallback。
- Vendor 首页、店铺资料、物流、客服页面在 fallback 下保留原 mock 表格或静态展示。
- `runtimeEnabled` 固定为 `false`，只表达当前数据不可驱动运行时业务。
- delivery profile 只用于商户侧信息展示，不影响 checkout 或真实配送策略。
- 公告只读展示，不发布、不推送、不触发短信、IM 或站内信。

## 已知限制

- `/vendor/china/market-context` 仍是后续计划中的只读 API route，当前 Vendor client 只具备前端读取和 fallback 能力。
- Vendor 页面仍使用静态 mock 作为兜底数据，不能代表真实商户归属、档口、公告或配送 profile。
- 本轮未做浏览器人工视觉验收；只做合并后 lint/build 和边界复核。

## 下一步建议

低风险下一步：

1. `vendor-market-context-next-plan`：规划真正 Vendor API route、builder、鉴权边界和页面细节拆分。
2. 继续保持 API first、read-only first，先让真实数据可读，再讨论是否允许商户端编辑。

暂停边界：

- 不进入真实发货、配送计价、订单拆单或履约路线。
- 不改支付、退款、结算、佣金、权限。
- 不接真实短信、IM、物流、直播或 AI 服务。
