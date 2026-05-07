# Mock Webhook Local Route Disabled Skeleton

更新时间：2026-05-08 00:35 Asia/Shanghai

## 范围

本轮新增默认 disabled 的 Admin 侧 mock webhook local route：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
```

这是 route skeleton，不是可用支付 webhook runtime。

## 行为

- `POST` 默认返回 HTTP 503。
- body 为 `{"status":"disabled","code":"RUNTIME_DISABLED",...}`。
- 即使 env 请求 `mock_inbox_only`，当前 route 仍返回 disabled。
- route 不读取 request body。
- route 不调用 handler。
- route 不创建 repository。
- route 不连接数据库。
- route 不执行 payment workflow。

## 测试

新增 route 单测覆盖：

- 默认 env 返回 disabled，且不读取 body。
- env 请求 mock runtime 时仍保持 disabled。

## 验证结果

```text
Test Suites: 13 passed, 13 total
Tests:       75 passed, 75 total
CHECK row counts
2|9
```

API typecheck 通过。disposable DB 残留复查为空。

Runtime grep 预期只命中：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
```

## 边界

- 未修改 `packages/api/medusa-config.ts`。
- 未新增 workflow、subscriber、job 或 link。
- 未连接真实支付宝、微信支付或任何真实 Provider。
- 未改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 行为。

## 后续

下一步必须先做 `mock-webhook-local-route-disabled-post-validation`。如果继续推进 route，只能规划 in-memory local smoke，不得直接接真实 DB 或 workflow execution。
