# Mock Webhook Handler Composition Harness Plan

更新时间：2026-05-07 23:00 Asia/Shanghai

## 目标

本计划定义下一步可实现的纯函数 composition harness。它不新增真实 handler，也不新增 API route，只用于证明现有 mock payment notification 积木在组合时不会越过安全边界。

## 计划中的 harness 位置

如果后续实现，优先放在：

```text
packages/api/src/modules/china-payment-notification/mock-webhook-composition.ts
packages/api/src/modules/china-payment-notification/__tests__/mock-payment-webhook-composition.unit.spec.ts
```

禁止放入：

```text
packages/api/src/api/**
packages/api/src/workflows/**
packages/api/src/subscribers/**
packages/api/src/jobs/**
packages/api/src/links/**
```

## Harness 输入模型

纯函数输入应只包含：

- runtime config input
- raw body
- headers
- mock secret
- receivedAt
- optional expected amount
- injected repository double
- optional payment/order snapshots

它不能读取真实 env，不能创建 DB 连接，不能读取 Medusa container。

## 必测路径

| 路径 | 期望 |
| --- | --- |
| runtime disabled | 返回 disabled response，不解析 payload，不写 repository |
| missing raw body | 返回 `PAYLOAD_INVALID`，不解析 payload |
| missing signature | 返回 `SIGNATURE_MISSING`，不写 repository |
| malformed JSON | 返回 `PAYLOAD_INVALID`，不写 payment/order |
| invalid signature | 返回 `SIGNATURE_INVALID` 或 manual-review audit，不执行 workflow |
| duplicate replay | 返回 duplicate response，保持 idempotency key 稳定 |
| accepted inbox-only | repository receive 成功，返回 accepted response |
| guard blocked | 记录 audit decision，不执行 workflow |
| command prepared | 只返回 DTO/audit event，不调用 workflow |

## Repository Double

测试 double 必须可表达：

- first receive
- duplicate replay
- transient repository error
- terminal repository error
- event log capture

它不能连接数据库，也不能 import production DB client。

## 错误映射

计划新增的 composition helper 需要把内部错误映射为 response decision：

- `MOCK_PAYMENT_PAYLOAD_INVALID` -> `PAYLOAD_INVALID`
- signature missing -> `SIGNATURE_MISSING`
- signature invalid -> `SIGNATURE_INVALID`
- unsupported currency -> `CURRENCY_UNSUPPORTED`
- unsupported event type -> `EVENT_TYPE_UNSUPPORTED`
- runtime disabled -> `RUNTIME_DISABLED`

未知错误默认不能推进 payment workflow，应进入 rejected 或 manual-review 分支。

## 审计断言

Harness 需要断言：

- 每条接收路径都有 action。
- duplicate replay 有 `dedupe_hit`。
- guard blocked 有 `command_blocked` 或 `manual_review_required`。
- command prepared 只有 DTO，不执行 workflow。
- response 里没有 raw payload、secret、完整签名、openid、unionid。

## 后续 PR 拆分

1. `mock-webhook-composition-helper`: 新增纯函数 composition helper 和 unit test，不新增 route。
2. `mock-webhook-composition-error-tests`: 补齐 payload/signature/repository error mapping。
3. `mock-webhook-composition-post-validation`: 合并后跑 harness、typecheck、runtime grep。
4. `mock-webhook-handler-skeleton-plan`: 再规划未注册 handler 函数，不写 route。

真正 API route、runtime switch、DB write 和 workflow execution 继续单独串行。

## 本轮验证

本轮是 docs-only：

```bash
git diff --check
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
```

预期：diff 无格式错误，runtime grep 无匹配。
