# Mock Webhook Handler Composition Plan

更新时间：2026-05-07 22:45 Asia/Shanghai

## 目标

本计划定义未来 mock China payment webhook inbox-only handler 的组合顺序。它把已完成的 request contract、runtime disabled config、mock normalizer、inbox repository contract、state guard、command mapper、audit mapper 和 response mapper 串成一个可审查流程。

本计划不实现 handler，不新增 API route，不接 runtime，不写数据库。

## 现有积木

| 层 | 文件 | 当前状态 |
| --- | --- | --- |
| Runtime gate | `runtime-config.ts` | 默认 disabled，只允许 `mock_china_pay` mock modes |
| Request contract | `mock-webhook-request.ts` | route-like raw body/header/secret 到 normalizer input |
| Normalizer | `mock-payload-normalizer.ts` | parse mock payload、验 fake signature、产出 envelope |
| Response contract | `mock-webhook-response.ts` | disabled / accepted / duplicate / rejected 到 HTTP response |
| Inbox contract | `inbox-repository-contract.ts` | repository interface 和错误分类 |
| DB adapter skeleton | `db-inbox-repository.ts` | 注入式 transaction client，不创建连接 |
| State guard | `state-guard.ts` | 只判断允许/阻断，不写 payment/order |
| Command mapper | `workflow-command-mapper.ts` | 只准备 command DTO，不执行 workflow |
| Audit mapper | `workflow-command-audit-mapper.ts` | command decision 到 event log action |

## Handler 组合顺序

未来 handler 只能按下面顺序推进：

1. 读取 env 并调用 `parsePaymentNotificationRuntimeConfig()`。
2. 如果 runtime disabled，直接返回 `mapMockPaymentWebhookResponse({ status: "disabled" })`。
3. 从 route request 提取 raw body、headers、receivedAt 和 mock secret。
4. 调用 `mapMockPaymentWebhookRequestToNormalizeInput()`。
5. 如果 request rejected，返回 `mapMockPaymentWebhookResponse({ status: "rejected", code })`。
6. 调用 `normalizeMockPaymentNotification()` 解析 payload、验 fake signature、生成 envelope。
7. 如果签名不是 `verified`，写入 inbox 前必须走安全拒绝或 manual-review 分支；不能推进 payment workflow。
8. 调用 repository `receive(envelope)`，以 idempotency key 做幂等。
9. 如果 repository 返回 replayed，返回 duplicate response。
10. 读取 payment session / order snapshot 之前，必须保持只读查询。
11. 调用 `guardPaymentNotificationState()`。
12. 调用 `mapGuardResultToWorkflowCommand()`，只生成 command DTO。
13. 调用 `mapWorkflowCommandDecisionToAuditEvent()` 记录 audit action。
14. inbox-only mode 只能返回 accepted，不执行 workflow command。
15. mock prepare-command mode 也只能准备 DTO 和 audit，不执行 workflow。

## 禁止直接跨越的边界

- request contract 不能解析 payload。
- response mapper 不能带 raw payload、secret、完整签名、openid 或 unionid。
- normalizer 不能写 DB。
- repository 不能创建数据库连接；连接必须由外层注入。
- state guard 不能修改 payment 或 order。
- command mapper 不能执行 workflow。
- handler 不能以前端 return URL 作为支付成功依据。

## 错误和响应

| 场景 | 响应 |
| --- | --- |
| runtime disabled | `503 disabled / RUNTIME_DISABLED` |
| 缺 raw body | `400 rejected / PAYLOAD_INVALID` |
| 缺 mock secret | `400 rejected / PAYLOAD_INVALID` |
| 缺签名 | `400 rejected / SIGNATURE_MISSING` |
| 签名 invalid | `400 rejected / SIGNATURE_INVALID` |
| payload JSON invalid | `400 rejected / PAYLOAD_INVALID` |
| 非 CNY | `400 rejected / CURRENCY_UNSUPPORTED` |
| 幂等重复 | `200 duplicate / mock_inbox_only` |
| inbox-only 接收成功 | `202 accepted / mock_inbox_only` |

## Retry 语义

- provider 可重试的失败只能发生在 request 已验签后。
- signature missing / invalid 默认不建议 provider 重试。
- repository transient error 可以映射为 retryable failure，但不能修改 payment/order。
- duplicate replay 必须返回稳定 200，避免 provider 持续重试。
- payload invalid 要保留可排查 audit，但不能暴露原始 payload 到 response。

## 安全 Metadata

允许记录：

- provider
- event id
- event type
- idempotency key
- raw payload digest
- receivedAt
- signature status
- error code
- retry count

禁止记录到 response 或普通日志：

- raw payload 原文
- secret
- 完整签名
- 支付宝 / 微信真实 app id、merchant id、openid、unionid
- 证书、私钥、真实 webhook token

## 后续 PR 拆分

1. `mock-webhook-handler-composition-harness`：新增纯函数级 composition harness，不新增 route。
2. `mock-webhook-handler-error-mapping-tests`：补齐 normalizer throw 到 response decision 的纯函数测试。
3. `mock-webhook-inbox-handler-skeleton`：新增未注册 handler 函数，但不放入 `packages/api/src/api/**`。
4. `mock-webhook-local-route-disabled-only`：如需新增 route，必须默认 disabled，且只允许 mock inbox-only，不写真实 payment/order。
5. `mock-webhook-local-disposable-db-inbox-dry-run`：只在本地 disposable DB 验证 inbox write 和 rollback。
6. `mock-webhook-preprod-disposable-db-dry-run`：需要外部 disposable preprod DB、备份和回滚确认。

真实支付宝、微信支付、退款、对账、商家结算、佣金和权限继续单独串行，不进入 mock route PR。

## 验证

本计划为 docs-only，验证范围：

```bash
git diff --check
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
```

预期：diff 无格式错误，runtime grep 无匹配。
