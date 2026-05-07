# Mock Webhook Route Path Migration Plan

更新时间：2026-05-07 18:30 Asia/Shanghai

## 目标

把 mock payment webhook 的后续接入路径从 Admin 调试入口收口到 neutral provider callback route。

本轮只做路径迁移规划，不新增 API route，不修改现有 Admin route，不连接 DB，不执行 payment workflow。

## 当前状态

当前 route：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
```

当前可接受原因：

- 默认 disabled。
- production 强制 disabled。
- local in-memory 分支需要显式 env gate。
- 不连接 DB。
- 不执行 payment workflow。
- 不接真实支付宝或微信支付。

因此它可以保留为本地调试入口，但不能升级成真实 provider callback。

## 为什么不能继续用 Admin 路径

支付平台异步通知是外部 provider 主动回调后端。它不应该依赖 Admin 登录态、后台会话或后台 namespace 的隐式认证规则。

如果继续把真实 provider callback 放在 `/admin/**`：

- provider 可能被 Admin auth 拦截，导致通知失败和 provider 重试风暴。
- 为了 callback 放开 Admin auth 会扩大后台攻击面。
- 后续排查时会把“后台调试入口”和“支付平台通知入口”混在一起。
- 支付成功来源容易被误解为后台或前端状态，而不是后端异步通知。

正确边界应该是 provider 级别的签名、幂等和 retry-safe inbox。

## Neutral Route 推荐路径

第一阶段只允许 mock provider：

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
```

后续真实 provider 另拆串行 PR：

```text
packages/api/src/api/china/payment-webhooks/alipay/route.ts
packages/api/src/api/china/payment-webhooks/wechat/route.ts
```

这些路径不放在 `/admin/**` 下，也不复用 Admin session 作为安全边界。

## Neutral Route 默认行为

第一版 neutral mock route 必须：

- 默认返回 disabled。
- production 默认 disabled。
- 只有显式 env 才能进入 mock inbox-only。
- 只允许 `mock_china_pay`。
- 不连接 DB。
- 不执行 payment workflow。
- 不改变 payment/order/refund/settlement/commission/permission 状态。
- 不暴露 raw payload、signature、secret 或完整 provider body。

建议 env gate：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=<temporary mock secret>
```

## Admin Route 策略

现有 Admin route 不在本轮删除。

建议策略：

1. 保留为本地后台调试入口，继续默认 disabled。
2. 文档明确它不是真实 provider callback。
3. neutral route smoke 脚本完成后，再单独规划 Admin route 是否降级为只读说明页、disabled-only 入口或删除。
4. 不为了真实 provider callback 放开 Admin namespace。

## 后续 PR 拆分

1. `mock-webhook-neutral-route-disabled-skeleton`
   - 新增 neutral mock route。
   - 默认 disabled。
   - 不读取 body。
   - 不调用 handler。

2. `mock-webhook-neutral-route-inmemory-skeleton`
   - 在 neutral route 下接 local-only in-memory branch。
   - 复用现有 handler/composition。
   - 不连接 DB。
   - 不执行 workflow。

3. `mock-webhook-neutral-route-smoke-script`
   - 只验证 neutral route。
   - 覆盖 disabled、accepted、duplicate、missing signature、malformed payload。
   - 检查响应不泄漏 raw payload、secret、signature。

4. `mock-webhook-admin-route-deprecation-plan`
   - 规划现有 Admin route 的保留、降级或删除。

5. `mock-webhook-db-backed-route-plan`
   - 在 neutral route smoke 通过后，再规划 DB-backed local route。
   - 仍不执行 payment workflow。

## 当前禁止

- 不写 smoke script。
- 不新增真实 provider route。
- 不接支付宝、微信支付。
- 不连接预发或生产数据库。
- 不执行 payment workflow。
- 不让前端 return URL 判定支付成功。
- 不改退款、对账、商家结算、佣金或权限。

## 验证计划

本轮 docs-only 验证：

```bash
git diff --check
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
git diff --name-only
```

期望：

- `packages/**` 无新增 diff。
- `apps/**` 无 diff。
- runtime 入口仍只包含当前已存在的 Admin mock webhook route 和测试。
- 没有真实密钥。

## 结论

下一步应先新增 neutral disabled route skeleton，而不是继续给 Admin route 写 smoke script。

这让后续 mock 支付通知可以安全演进，同时避免把后台登录态和支付平台异步通知入口混在一起。
