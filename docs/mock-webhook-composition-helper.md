# Mock Webhook Composition Helper

更新时间：2026-05-07 23:10 Asia/Shanghai

## 范围

本轮新增 `composeMockPaymentWebhookInboxOnly()`，用于把前面已经完成的 mock-only 合同组合成纯函数级测试链路。

它仍不是 webhook route，也不是 payment runtime。

## 新增内容

- `packages/api/src/modules/china-payment-notification/mock-webhook-composition.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/mock-payment-webhook-composition.unit.spec.ts`
- harness 纳入 composition 单测

## 覆盖路径

- runtime disabled：返回 503，不解析 payload，不写 repository。
- request rejected：缺签名直接返回 rejected，不写 repository。
- malformed payload：返回 `PAYLOAD_INVALID`，不写 repository。
- invalid signature：返回 `SIGNATURE_INVALID`，不写 repository。
- duplicate replay：返回 duplicate 200。
- mock inbox-only accepted：repository receive 成功后返回 accepted，不准备 command。
- mock prepare-command guard blocked：只写 audit event，不执行 workflow。
- mock prepare-command command prepared：只生成 command DTO 和 audit event，不执行 workflow。

## 安全边界

- 不新增 API route。
- 不注册 `china-payment-notification` module。
- 不注册 migration。
- 不创建数据库连接。
- 不执行 payment workflow。
- 不接支付宝、微信支付或真实 Provider。
- 不改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 行为。

## 验证结果

```text
Test Suites: 11 passed, 11 total
Tests:       65 passed, 65 total
CHECK row counts
2|9
```

API typecheck 通过。runtime grep 无匹配。disposable DB 残留复查为空。

## 后续

下一步可以做 `mock-webhook-composition-error-tests`，补充 repository transient/terminal error 到 response/audit 的纯函数映射。仍不得新增 route 或 runtime。
