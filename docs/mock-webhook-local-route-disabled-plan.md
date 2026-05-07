# Mock Webhook Local Route Disabled Plan

更新时间：2026-05-08 00:25 Asia/Shanghai

## 目标

本计划定义未来 mock payment webhook local route 的 disabled-only 接入条件。本轮不新增 route。

## 未来 route 建议

如果后续实现，建议只新增：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
```

或：

```text
packages/api/src/api/store/china/mock-payment-webhooks/route.ts
```

二选一，不要同时新增。优先使用 Admin 侧路径，因为 webhook 配置属于平台运营和本地测试能力，不应暴露为消费者 Store API。

## 默认行为

默认必须返回 disabled：

```text
HTTP 503
body: {"status":"disabled","code":"RUNTIME_DISABLED"}
```

只有同时满足以下条件才可进入 mock-only handler：

- `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true`
- `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only`
- `CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay`
- 存在 mock secret，且不是生产密钥

即使进入 mock-only handler，也不得执行 payment workflow。

## Route 文件允许内容

允许：

- 读取 raw body。
- 读取 headers。
- 构造 runtime config input。
- 读取 mock secret。
- 调用未注册 `handleMockPaymentWebhookNotification()`。
- 返回 safe response。

禁止：

- 直接解析 payload。
- 直接验签。
- 直接写 payment/order。
- 直接执行 workflow。
- 直接创建 DB connection。
- 写真实支付宝/微信支付配置。
- 把 raw payload、secret、完整签名写入 response。

## Raw Body 策略

未来 route 必须保留 raw body 原文用于签名验证。不能先 JSON parse 再重新 stringify。

如果框架 request 已经消费 body，route 必须失败为 `PAYLOAD_INVALID`，不能尝试用 parsed body 作为签名来源。

## Repository 策略

第一版 route 不建议连接真实 DB repository。

建议拆分：

1. disabled-only route：只返回 disabled，不调用 repository。
2. in-memory local route：只用于 local smoke，不作为生产路径。
3. disposable DB local route：只在本地 disposable DB 上验证。
4. preprod disposable DB route：需要外部 disposable preprod DB、备份和回滚确认。

## 验证清单

未来 route PR 必须至少验证：

- 默认 env 下返回 disabled 503。
- runtime grep 可解释新增 route 是唯一 runtime 入口。
- disabled 路径不调用 repository。
- mock-only 路径不执行 workflow。
- response 不包含 raw payload、secret、完整签名。
- payment notification harness 通过。
- API typecheck 通过。
- disposable DB 残留为空。

## 回滚策略

- route 必须由 env gate 控制，默认关闭。
- 如有异常，第一回滚动作是关闭 `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED`。
- 第二回滚动作是删除/禁用 route PR。
- 不允许通过前端 return URL 修改支付状态作为回滚替代。

## 后续 PR 拆分

1. `mock-webhook-local-route-disabled-skeleton`：新增默认 disabled route，不连接 repository。
2. `mock-webhook-local-route-disabled-post-validation`：记录 disabled route 验证。
3. `mock-webhook-local-route-inmemory-plan`：规划 local in-memory route smoke。
4. `mock-webhook-local-route-disposable-db-plan`：规划本地 disposable DB route smoke。

真实支付宝、微信支付、退款、对账、商家结算和权限继续单独串行。
