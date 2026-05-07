# Mock Webhook Handler Skeleton

更新时间：2026-05-08 00:05 Asia/Shanghai

## 范围

本轮新增未注册 handler skeleton：

- `mock-webhook-handler.ts`
- `mock-payment-webhook-handler.unit.spec.ts`

它只接受显式注入输入，调用 `composeMockPaymentWebhookInboxOnly()`，并返回 safe debug metadata。

## 覆盖路径

- runtime disabled 不调用 repository。
- mock inbox-only signed request 通过 injected repository 接收。
- safe debug metadata 不包含 raw body、secret 或 signature。
- missing signature 在 repository 写入前被拒绝。

## 验证结果

```text
Test Suites: 12 passed, 12 total
Tests:       73 passed, 73 total
CHECK row counts
2|9
```

API typecheck 通过。runtime grep 无匹配。disposable DB 残留复查为空。

## 边界

- 未新增 API route。
- 未修改 `medusa-config.ts`。
- 未创建数据库连接。
- 未执行 payment workflow。
- 未改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 行为。
- safe debug metadata 只包含 `receivedAt`、`hasRawBody`、`headerNames`、`runtimeRequested`。

## 后续

下一步建议先做 `mock-webhook-handler-post-validation`，记录合并后验证。再进入 `mock-webhook-local-route-disabled-plan`，规划真实 route 的默认关闭接入条件。
