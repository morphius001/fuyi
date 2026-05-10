# Refund Command Contract Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮定义退款命令合同规划，不实现退款 runtime。

结论：下一步可以做 `refund-amount-guard-contract` 纯函数，但仍不能新增 refund route、调用 Medusa refund workflow、接支付宝 / 微信支付 refund API 或修改任何 order / payment / refund 状态。

## Contract Inputs

建议后续纯函数合同输入：

```text
RefundCommandInput
- commandId
- idempotencyKey
- provider
- merchantOrderRef
- orderId
- paymentId
- paymentSessionId
- providerTransactionId
- requestedAmountMinor
- currency
- reasonCode
- reasonNote
- actor
- ownership
- paymentSnapshot
- refundSnapshot
- requestedAt
```

### Actor

```text
actor
- type: admin | vendor | system_job
- id
- roleKeys
- marketIds
- sellerIds
```

要求：

- Consumer 不能直接成为退款执行 actor。
- Vendor actor 必须经过 seller ownership guard。
- Admin actor 必须经过 RBAC guard。
- System job 只能处理 provider notification / reconciliation 标记出的 retry-safe 工作。

### Ownership

```text
ownership
- marketId
- sellerId
- orderSellerId
- orderMarketId
- paymentSellerId
- paymentMarketId
```

要求：

- seller / market 不一致时 blocked。
- 缺 ownership context 时进入 manual review，不自动退款。

### Payment Snapshot

```text
paymentSnapshot
- capturedAmountMinor
- currency
- status
- capturedAt
- provider
- providerTransactionId
```

允许状态：

- captured
- partially_refunded

禁止状态：

- pending
- authorized
- failed
- canceled
- refunded
- unknown

### Refund Snapshot

```text
refundSnapshot
- previousRefundedAmountMinor
- pendingRefundAmountMinor
- priorRequestIds
- priorProviderRefundIds
- lastKnownRefundStatus
```

要求：

- previous + pending + requested 不能超过 captured amount。
- 同一个 idempotency key 必须返回相同 decision。
- 同一个 provider refund id 不能重复推进状态。

## Decision Contract

建议后续输出：

```text
RefundCommandDecision
- executable: false
- decisionType: accepted_for_guard_only | blocked | manual_review_required
- blockCode
- retryable
- idempotencyKey
- auditMetadata
```

本阶段不得输出 `executable: true`。

后续真实 runtime 之前，`accepted_for_guard_only` 只表示合同校验通过，不代表 provider refund request 已发出，更不代表退款成功。

## Block Codes

必须覆盖：

- `AMOUNT_NOT_POSITIVE`
- `CURRENCY_UNSUPPORTED`
- `CURRENCY_MISMATCH`
- `PAYMENT_NOT_CAPTURED`
- `PAYMENT_ALREADY_REFUNDED`
- `REFUND_AMOUNT_EXCEEDS_CAPTURED`
- `REFUND_PENDING_CONFLICT`
- `IDEMPOTENCY_CONFLICT`
- `PROVIDER_MISMATCH`
- `SELLER_OWNERSHIP_MISMATCH`
- `MARKET_OWNERSHIP_MISMATCH`
- `ACTOR_NOT_ALLOWED`
- `RBAC_REQUIRED`
- `REASON_REQUIRED`
- `AUDIT_NOTE_REQUIRED`
- `MANUAL_REVIEW_REQUIRED`

## Reason Codes

第一阶段只定义 enum / 文档：

- `customer_requested`
- `out_of_stock`
- `quality_issue`
- `merchant_cancelled`
- `delivery_failed`
- `duplicate_payment`
- `operator_adjustment`
- `other`

要求：

- 部分退款必须有 reason code。
- `other` 必须有 reason note。
- 质量问题、配送失败和运营调整必须进入 audit metadata。

## Audit Metadata

必须包含：

- actor type / id。
- order id / payment id / payment session id。
- seller id / market id。
- requested amount / currency。
- captured amount。
- previous refunded amount。
- pending refund amount。
- reason code / note。
- idempotency key。
- decision type。
- block code。
- createdAt。

禁止记录：

- raw provider payload。
- private key / certificate / token / APIv3 key。
- full payment secret。
- full user sensitive data。

## 后续 PR 顺序

1. `refund-amount-guard-contract`
   - 新增纯函数和 tests。
   - 只输出 non-executable decision。
   - 不写 DB，不接 provider。

2. `refund-request-idempotency-plan`
   - 规划 provider refund request idempotency。
   - 定义 retry / timeout / unknown state。

3. `refund-notification-contract-plan`
   - 规划 refund.succeeded / refund.failed verifier / normalizer。
   - 仍不改 payment/order/refund state。

4. `refund-manual-review-audit-plan`
   - 规划 manual review queue 和 audit event allowlist。

## Go / No-Go

Go to `refund-amount-guard-contract`：

- 只做纯函数和 tests。
- 不新增 route。
- 不写 DB。
- 不接 provider。
- 不执行 workflow。
- 输出必须保持 `executable: false`。

No-Go to real refund runtime：

- 支付 provider sandbox 未完成。
- refund notification inbox 未完成。
- refund amount guard 未完成。
- provider request idempotency 未完成。
- Admin / Vendor RBAC 和 seller ownership 未完成。
- manual review / audit 未完成。
- reconciliation / settlement / commission / payout block 未完成。

## 验证记录

本轮为 docs-only contract plan；验证结果：

- `git diff --check`：通过。
- `git status --short`、`git diff --name-only` 和 `git ls-files --others --exclude-standard`：确认只改 task / docs / ledger / queue。
