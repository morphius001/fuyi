# Mock Webhook Inbox-only Route Readiness

## 目标

确认未来 `mock-webhook-inbox-only-route` PR 的前置条件、文件边界、测试清单和禁止事项。

本轮不新增 API route，不接 runtime，不注册 migration。

## 当前已满足

- mock signature verifier 已存在。
- mock payload normalizer 已存在。
- idempotency key builder 已存在。
- inbox migration skeleton 已存在，但未注册。
- repository contract 已存在。
- DB adapter skeleton 已存在，但只接注入式 transaction client。
- runtime config parser 已存在，默认 disabled。
- 本地 disposable DB schema/repository contract 脚本已通过。
- payment notification harness 已覆盖 46 个单测。

## 仍未满足

- 没有真实 DB adapter integration test。
- 没有 route-level request parser。
- 没有 route-level response contract test。
- 没有 Medusa request context / dependency resolution 边界设计。
- 没有生产 migration 注册计划。
- 没有 disposable preprod dry-run。

## 未来 Route 文件边界

未来 route PR 最多允许：

- `packages/api/src/api/hooks/china-payments/mock/notifications/route.ts`
- `packages/api/src/api/hooks/china-payments/mock/notifications/__tests__/**`
- `packages/api/src/modules/china-payment-notification/**`
- `.codex/scripts/**`
- `docs/**`
- `project-ledger/**`

禁止：

- `packages/api/medusa-config.ts`，除非进入单独 runtime registration PR。
- `packages/api/src/workflows/**`
- `packages/api/src/subscribers/**`
- `packages/api/src/jobs/**`
- `packages/api/src/links/**`
- `apps/**`
- `bun.lock`
- `package.json`
- `.env`

## Route 行为限制

第一版 route 必须是 inbox-only：

- runtime config 不是 enabled 时返回 disabled。
- 只允许 provider 为 `mock_china_pay`。
- 只 normalize、fake verify、生成 idempotency key。
- 只写 inbox/event log。
- duplicate 返回 duplicate。
- invalid/missing signature 返回 rejected。
- malformed JSON 返回 rejected。
- non-CNY 返回 rejected。
- unsupported event type 返回 rejected。

禁止：

- 不调用 payment workflow。
- 不修改 payment session。
- 不修改 order。
- 不创建 refund。
- 不触发 settlement、commission、payout。
- 不执行真实支付宝/微信支付验签。

## Response Contract

| 场景 | HTTP | Body |
| --- | --- | --- |
| disabled | 404 或 503 | `{"status":"disabled"}` |
| accepted | 202 | `{"status":"accepted","mode":"mock_inbox_only"}` |
| duplicate | 200 | `{"status":"duplicate","mode":"mock_inbox_only"}` |
| rejected | 400 | `{"status":"rejected","code":"..."}` |

## 必须测试

- disabled 默认关闭。
- mock inbox-only enabled。
- accepted 首次通知。
- duplicate 通知。
- missing signature。
- invalid signature。
- malformed JSON。
- non-CNY。
- unsupported event type。
- metadata 不包含 raw payload、完整签名、secret、手机号、openid、unionid。
- runtime grep 不触碰 workflow/subscriber/job/link。

## Readiness 结论

当前可以继续做 route 前的更小任务：

1. `mock-webhook-route-response-contract`
   - 纯函数 response mapper。
   - 不新增 route。

2. `mock-webhook-route-request-contract`
   - 纯函数 request parser contract。
   - 不新增 route。

真正新增 route 前，建议先补 response/request contract 纯函数和测试。
