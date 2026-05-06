# Vendor Market Context Post-API Validation

更新时间：2026-05-07 Asia/Shanghai

## 范围

本报告验证 PR AS-AU/AV 合并后的 Vendor market context API + Vendor client 状态：

- PR AS：Vendor market context builder
- PR AT：`GET /vendor/china/market-context` 只读 route
- PR AU：Vendor client 对齐 `market_id` 和 fallback polish
- PR AV：Vendor 四页三态视觉 QA 清单

本轮只做验证报告，不修改业务代码。

## 验证 worktree

```text
/home/codex/code/fuyi-pr-aw-vendor-market-post-api-validation-cn
```

基准提交：

```text
9d2305b [china] PR AV Vendor market context visual QA
```

## 验证结果

通过项：

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- src/modules/china-market-read-model/__tests__/vendor-market-context-builder.unit.spec.ts src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
cd packages/api && bun run build
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

单测结果：

```text
Test Suites: 2 passed, 2 total
Tests: 8 passed, 8 total
```

Vendor build 摘要：

```text
33 modules transformed
dist/assets/index-DiFLjgzx.js 221.12 kB gzip 73.83 kB
```

API build 摘要：

```text
Types generated successfully
Backend build completed successfully
```

## 安全边界复核

确认：

- Vendor route 只提供 `GET /vendor/china/market-context`。
- Vendor route 从 `req.seller_context.seller_id` 解析 seller。
- Vendor client 不传 `sellerId`，只传 `market_id` 作为当前 seller 上下文过滤。
- `runtimeEnabled` 固定为 `false`。
- delivery profiles 输出 `checkoutImpact: "none"`。
- fallback 不阻断 Vendor UI。

确认未修改：

- checkout shipping options
- order / payment / refund / settlement / payout / commission / permission
- 真实 fulfillment / logistics / SMS / IM / live / AI / payment provider
- real secrets / `.env*`
- `package.json` / `bun.lock`

## 已知限制

- 当前 API 数据源仍是 static adapter + seller metadata，不是真实 market membership migration。
- `include_announcements` 和 `include_delivery_profiles` 目前只是 client 预留参数，route 第一版始终返回当前只读上下文。
- 本轮没有完成已登录 Vendor 浏览器截图；截图 QA 已拆到 `vendor-market-context-authenticated-browser-qa`。

## 下一步建议

1. `vendor-market-context-authenticated-browser-qa`：在已登录 Vendor 会话下检查首页、店铺资料、物流、客服四页。
2. `vendor-market-context-next-data-plan`：规划真实 market membership 数据源和 migration 前的风险门禁。
