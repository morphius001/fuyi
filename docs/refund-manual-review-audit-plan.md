# Refund Manual Review Audit Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮只规划退款人工复核和审计事件合同，不实现 runtime。

结论：退款链路在进入任何真实 provider request、inbox state transition、order / payment / refund mutation、settlement / commission / payout 之前，必须具备 manual review gate 和 append-only audit event 合同。

## 当前前置状态

已具备：

- `refund-amount-guard-contract`：non-executable 退款金额 guard。
- `refund-request-idempotency-contract`：local command key 与 provider refund request key。
- `refund-notification-fake-fixtures`：fake-only refund succeeded / failed fixtures。
- `refund-notification-verifier-contract`：fake-only verifier。
- `refund-notification-normalizer-contract`：fake-only envelope normalizer。

仍未具备：

- manual review queue / read model。
- audit event allowlist。
- refund inbox state transition owner。
- Admin / Vendor 写入口 RBAC 和 seller ownership guard。
- settlement / commission / payout 扣减 gate。
- 真实支付宝 / 微信支付 refund provider。

## Manual Review 触发条件

以下情况必须进入人工复核，不得自动执行 provider refund request，不得自动标记 refund succeeded / failed：

- amount mismatch。
- currency mismatch 或非 CNY。
- provider refund id mismatch。
- merchant order ref mismatch。
- payment session mismatch。
- provider transaction mismatch。
- notification idempotency key mismatch。
- duplicate event id 但 raw payload digest 不同。
- duplicate provider refund id 指向不同 local refund request。
- provider request returned unknown / processing / timeout。
- provider notification verified but request context missing。
- order ownership mismatch。
- seller ownership mismatch。
- market ownership mismatch。
- Admin RBAC missing。
- Vendor actor 不是该 seller 所属操作人。
- requested amount + previous successful refunds + pending refunds 超过 captured amount。
- settlement batch 已生成或 payout 已进入不可逆阶段。
- reconciliation mismatch。
- refund reason / audit note missing。

## Manual Review Decision

后续建议的只读 decision 形状：

```text
RefundManualReviewDecision
- required: boolean
- reasonCode
- severity: low | medium | high | critical
- retryable
- blockRuntimeMutation: true
- auditAction
- auditMetadata
- redactionPolicy
```

要求：

- `blockRuntimeMutation` 必须为 true。
- `required: false` 只能表示不需要人工复核，不能表示退款成功。
- decision 不得包含 provider secret、raw payload、完整用户敏感信息或可执行 provider request。

## Audit Action Allowlist

建议后续 audit event action 只允许：

```text
refund_command_received
refund_guard_blocked
refund_guard_manual_review_required
refund_request_idempotency_key_created
refund_provider_request_prepared
refund_provider_request_blocked
refund_notification_received
refund_notification_verified
refund_notification_normalized
refund_notification_duplicate_seen
refund_notification_digest_conflict
refund_manual_review_opened
refund_manual_review_assigned
refund_manual_review_resolved
refund_runtime_mutation_blocked
refund_settlement_blocked
```

本阶段不得新增：

```text
refund_state_mutated
refund_workflow_executed
provider_refund_request_sent
settlement_adjusted
commission_adjusted
payout_adjusted
```

## Audit Metadata Required Fields

每条审计事件至少需要：

- audit event id。
- action。
- actor type：admin / vendor / system_job / provider。
- actor id 或 provider event id。
- order id。
- payment id。
- payment session id。
- merchant order ref。
- seller id。
- market id。
- requested amount minor。
- currency。
- captured amount minor。
- previous refunded amount minor。
- pending refund amount minor。
- local refund command idempotency key。
- provider refund request key。
- provider refund id when available。
- notification idempotency key when available。
- raw payload digest when notification-driven。
- decision type。
- block code / manual review reason。
- retryable。
- createdAt。

禁止记录：

- raw provider payload。
- private key / certificate / token / APIv3 key。
- full webhook signature secret。
- full user phone、证件号、银行卡号或完整地址。
- provider SDK request object。
- executable workflow command。

## RBAC And Ownership Gate

Admin 写入口进入后续 runtime 前必须校验：

- Admin role 允许退款操作。
- actor market scope 包含 order market。
- high-risk refund reason 需要更高权限或二次确认。
- 操作必须写 audit note。

Vendor 写入口进入后续 runtime 前必须校验：

- actor seller scope 包含 order seller。
- 只能申请或建议退款，不直接改变平台资金状态。
- 跨市场 / 跨 seller 订单必须 manual review。
- 缺 audit note 或 reason code 必须 blocked。

System job：

- 只能处理已验签 provider notification / reconciliation 标记出的 retry-safe 工作。
- 不允许绕过 amount guard、ownership guard 或 manual review gate。

## Settlement / Commission / Payout Block

退款 final state 进入真实 runtime 前：

- settlement batch 不得读取未确认退款作为可结算金额。
- commission 不得自动扣减。
- payout 不得自动调整或发起。
- 已生成 settlement / payout 的订单必须进入 manual review。
- 后续 settlement gate 必须同时读取 refund final state、reconciliation passed 和 dispute state。

## 后续 PR 顺序

建议：

1. `refund-manual-review-audit-contract`
   - 纯函数 decision builder + tests。
   - 只输出 non-executable audit decision。

2. `refund-audit-event-allowlist-contract`
   - 纯 TypeScript allowlist + tests。
   - 不写 DB，不注册 event log migration。

3. `refund-runtime-gate-validation`
   - 汇总 command / amount / idempotency / notification / manual review gate。
   - 仍不接真实 provider。

4. `refund-inbox-state-transition-plan`
   - docs-only 规划 inbox 状态机和 owner。
   - 不修改 order / payment / refund runtime。

## Go / No-Go

Go to next contract PR：

- 只做 docs-only 或纯函数 + tests。
- 输出必须不可执行。
- 不新增 route。
- 不写 DB。
- 不接 provider refund API。
- 不执行 workflow。

No-Go to real refund runtime：

- payment success 真实 provider sandbox 未完成。
- refund command / amount / idempotency / notification / manual review 未全部验证。
- RBAC / ownership gate 未完成。
- settlement / commission / payout block 未完成。
- reconciliation gate 未完成。

## 验证记录

本轮为 docs-only plan；验证：

```text
git diff --check
git diff --name-only
git ls-files --others --exclude-standard
```
