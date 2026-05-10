# Refund Request Idempotency Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

规划退款 provider request idempotency，不实现 runtime。

结论：下一步可以做 docs-only / skeleton 合同，但仍不能发出 provider refund request，不能新增 refund route，不能写 DB，不能执行 Medusa workflow，不能把 request accepted 当作 refund succeeded。

## Three Idempotency Layers

退款必须区分三层幂等：

1. Local command idempotency
   - 防止同一操作人 / 同一订单 / 同一金额重复提交。
   - 来源：Admin / Vendor / System job 写操作。
   - 产物：local refund command idempotency key。

2. Provider request idempotency
   - 防止重复调用支付宝 / 微信退款 API。
   - 来源：后端向 provider 发起 refund request。
   - 产物：provider refund request id / out_refund_no。

3. Provider notification idempotency
   - 防止重复处理退款成功 / 失败通知。
   - 来源：provider 异步通知或后端查询确认。
   - 产物：refund notification idempotency key。

任何一层通过都不代表另一层成功。特别是 provider request accepted 不等于 refund succeeded。

## Local Command Key

建议 key 组成：

```text
refund_cmd:{provider}:{orderId}:{paymentId}:{requestedAmountMinor}:{actorType}:{actorId}:{reasonCode}:{requestDay}
```

要求：

- 同一 key 重复进入 guard 时必须得到同一 non-executable decision 或 manual review。
- key 不包含 raw payload、secret、证书、公钥、私钥、手机号或完整用户敏感信息。
- 金额使用 minor units。
- 日期使用 Asia/Shanghai 当天 bucket 仅作为防误点维度，不能作为财务最终唯一性来源。

## Provider Refund Request Key

建议 key 组成：

```text
refund_req:{provider}:{merchantOrderRef}:{paymentSessionId}:{requestedAmountMinor}:{localCommandId}
```

Provider 对应字段：

- Alipay: `out_request_no` 或等价 sandbox 字段，后续需按官方合同校验。
- WeChat Pay: `out_refund_no`，后续需按官方合同校验。

要求：

- request key 必须由后端生成。
- 不能由前端传入 provider refund id。
- 不能复用 payment notification idempotency key。
- 不能把 provider refund id 写入日志明文以外的 secret 上下文；provider refund id 不是 secret，但仍需避免和用户隐私拼接。

## Request State Machine

建议状态：

```text
draft_guarded
request_ready
request_sending
request_accepted_unknown
request_rejected_retryable
request_rejected_terminal
notification_succeeded
notification_failed
manual_review_required
```

状态语义：

- `request_accepted_unknown`：provider 已接收或网络结果不确定，但退款成功未知。
- `notification_succeeded`：只能源自 provider 异步通知验签通过或后端安全查询确认。
- `notification_failed`：只能源自 provider 失败通知 / 查询确认。
- `manual_review_required`：amount mismatch、duplicate but payload differs、provider unknown、ownership mismatch、reconciliation mismatch。

禁止状态捷径：

- request HTTP 200 直接标记退款成功。
- Admin 按钮成功直接标记 refunded。
- 前端 return page 标记 refunded。
- timeout 后自动成功。
- unknown state 自动重试到重复退款。

## Retry Rules

允许 retry：

- network timeout with same provider refund request key。
- provider retryable error with same key。
- DB transaction interrupted before durable request state persisted：必须 manual review 或重新从 local command key 判定。

禁止 retry：

- amount changed with same provider refund request key。
- provider mismatch。
- seller / market ownership mismatch。
- terminal rejected。
- notification_succeeded 已达成后再次发 request。

## Notification Boundary

退款通知必须单独合同：

- `refund.succeeded`
- `refund.failed`

必须具备：

- signature verified。
- idempotency key unique。
- provider refund id present。
- amount / currency matches request。
- merchant order / payment reference matches request。
- duplicate-safe。
- event log append-only。

## Audit Metadata

Provider request 阶段必须记录：

- local command id。
- provider request id。
- actor type / id。
- order id / payment id / payment session id。
- requested amount / currency。
- reason code。
- decision type。
- request state。
- retry count。
- last provider error code。
- createdAt / updatedAt。

禁止记录：

- raw provider secret。
- private key / certificate / token / APIv3 key。
- full raw notification payload。
- full user sensitive data。

## 后续 PR 顺序

1. `refund-request-idempotency-contract`
   - 纯函数构建 local command key 和 provider request key。
   - tests 覆盖稳定性、不同金额不同 key、敏感字段不进入 key。
   - 不写 DB，不接 provider。

2. `refund-notification-contract-plan`
   - docs-only 定义 refund notification verifier / normalizer。

3. `refund-manual-review-audit-plan`
   - docs-only 定义 manual review queue 和 audit allowlist。

## Go / No-Go

Go to request idempotency contract：

- 只做纯函数 + tests。
- 不新增 route。
- 不写 DB。
- 不接 provider。
- 不执行 workflow。
- 不输出 refund success。

No-Go to real provider refund request：

- 支付 provider sandbox 未完成。
- checkout runtime 仍禁止变更。
- refund notification verifier / normalizer 未完成。
- DB durable request state 未设计。
- manual review 未设计。
- RBAC / seller ownership 未完成。
- reconciliation / settlement / commission / payout block 未完成。

## 验证记录

本轮为 docs-only idempotency plan；验证：

- `git diff --check`。
- `git status --short`、`git diff --name-only` 和 `git ls-files --others --exclude-standard` 确认只改 task / docs / ledger / queue。
