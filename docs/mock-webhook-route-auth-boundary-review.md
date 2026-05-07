# Mock Webhook Route Auth Boundary Review

更新时间：2026-05-08 01:40 Asia/Shanghai

## 背景

当前 mock webhook route 位于：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
```

它是 disabled/local-only skeleton，目前不连接 DB、不执行 workflow。

## 发现

项目自定义 `packages/api/src/api/middlewares.ts` 没有给该路径增加自定义 middleware。当前自定义 middleware 只覆盖：

```text
GET /store/products
GET /store/products/:id
```

但该 route 位于 `/admin/**` 命名空间，后续真实 provider webhook 不能默认假设它适合外部支付平台回调。

## 风险

- `/admin/**` 路径可能被 Medusa Admin 认证或后台会话边界保护。
- 支付平台异步通知不应依赖 Admin 登录态。
- 如果未来真实支付宝/微信支付回调打到 Admin-only route，可能出现 provider 无法访问、重试风暴或误判通知失败。
- 如果为了 provider callback 放开 Admin auth，可能扩大后台攻击面。

## 当前可接受原因

当前 route 仍是 mock/local-only：

- 默认 disabled。
- production disabled。
- local in-memory 需要显式 env。
- 不连接 DB。
- 不执行 workflow。
- 不接真实 Provider。

因此当前风险是“路径设计待定”，不是生产 runtime 风险。

## 后续建议

真实 provider webhook 或 DB-backed local route 前，应重新规划路径：

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
packages/api/src/api/china/payment-webhooks/alipay/route.ts
packages/api/src/api/china/payment-webhooks/wechat/route.ts
```

这些路径应使用 provider signature 和 idempotency 作为安全边界，而不是 Admin session。

## 下一步拆分

1. `mock-webhook-route-path-migration-plan`：规划从 Admin mock route 迁移到 neutral provider callback route。
2. `mock-webhook-neutral-route-disabled-skeleton`：新增 neutral route，默认 disabled。
3. `mock-webhook-admin-route-deprecation-plan`：规划 Admin mock route 保留或删除策略。
4. `mock-webhook-local-smoke-script`：等 neutral route 明确后再写 smoke script。

## 当前禁止

- 不写 smoke script。
- 不把当前 Admin route 当真实 provider callback。
- 不接 DB-backed repository。
- 不执行 payment workflow。
- 不接支付宝、微信支付。
