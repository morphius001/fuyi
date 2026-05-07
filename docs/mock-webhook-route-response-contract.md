# Mock Webhook Route Response Contract

## 目标

新增 `mapMockPaymentWebhookResponse()` 纯函数，固定未来 mock webhook inbox-only route 的响应语义。

本轮不新增 API route，不接 runtime，不调用 payment workflow。

## 映射

| Decision | HTTP | Body |
| --- | --- | --- |
| disabled | 503 | `{"status":"disabled","code":"RUNTIME_DISABLED"}` |
| accepted | 202 | `{"status":"accepted","mode":"mock_inbox_only"}` |
| duplicate | 200 | `{"status":"duplicate","mode":"mock_inbox_only"}` |
| rejected | 400 | `{"status":"rejected","code":"..."}` |

## 安全边界

- response body 不包含 raw payload。
- response body 不包含完整签名。
- response body 不包含 secret。
- response body 不包含 openid / unionid。
- 不新增 route。
- 不执行 payment workflow。
- 不改变 payment/order/refund/settlement/commission/permission。

## 验证

- 新增单元测试覆盖 disabled、accepted、duplicate、rejected 和敏感字段排除。
- 本地 payment notification harness 纳入新增单测。
