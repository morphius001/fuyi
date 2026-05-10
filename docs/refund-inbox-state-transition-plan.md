# Refund Inbox State Transition Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮只规划退款通知 inbox 的状态机和 owner 边界，不实现 runtime。

结论：可以继续设计 refund inbox，但仍不能启用真实退款 runtime。inbox 状态、normalized envelope、manual review decision 和 audit event 都不能代表退款成功；它们只能作为后续 guard、人工复核、对账和最终状态 owner 的输入。

## 当前前置状态

已具备：

- payment notification inbox skeleton 已预留 `refund.succeeded` / `refund.failed` event type。
- refund fake fixtures、verifier、normalizer 已具备 fake-only 合同。
- refund amount guard、request idempotency、manual review audit decision 和 audit event allowlist 已具备不可执行合同。
- `china-payment-notification` 仍未注册到 `medusa-config.ts`。

仍未具备：

- 真实 refund route。
- DB-backed refund inbox repository。
- refund inbox state transition owner。
- provider refund request sender。
- payment / refund workflow execution。
- settlement / commission / payout adjustment。
- reconciliation gate。

## Proposed Inbox States

建议后续 inbox 只使用审计和处理状态，不直接表达资金成功：

- `received`：收到 provider notification 或 fake rehearsal input，仅保存 digest / idempotency 语义。
- `signature_verified`：验签合同通过；不代表退款成功。
- `normalized`：已映射为 refund notification envelope；不代表退款成功。
- `duplicate_seen`：相同 idempotency key 和相同 raw digest 重放，必须 no-op。
- `digest_conflict_manual_review`：相同 idempotency key 但 raw digest 不同，必须人工复核。
- `guard_checked`：金额、币种、providerRefundId、merchant ref、ownership 等 guard 已评估。
- `manual_review_required`：需要人工复核；不能自动改变退款状态。
- `state_owner_pending`：未来可交给独立 state transition owner 评估；当前仍不执行。
- `runtime_mutation_blocked`：当前阶段明确阻断 order / payment / refund mutation。
- `terminal_rejected`：无效签名、unsupported event 或不可解析 payload 等终止处理。
- `processed_for_audit_only`：只完成审计记录或 rehearsal 记录，不产生业务状态变化。

当前阶段不得新增：

```text
refunded
refund_failed
refund_state_mutated
workflow_executed
settlement_adjusted
commission_adjusted
payout_adjusted
```

## Allowed Transitions

允许的状态流转：

```text
received -> signature_verified
received -> terminal_rejected
signature_verified -> normalized
normalized -> duplicate_seen
normalized -> digest_conflict_manual_review
normalized -> guard_checked
guard_checked -> manual_review_required
guard_checked -> state_owner_pending
guard_checked -> runtime_mutation_blocked
manual_review_required -> runtime_mutation_blocked
manual_review_required -> state_owner_pending
state_owner_pending -> processed_for_audit_only
runtime_mutation_blocked -> processed_for_audit_only
duplicate_seen -> processed_for_audit_only
digest_conflict_manual_review -> runtime_mutation_blocked
terminal_rejected -> processed_for_audit_only
```

要求：

- `state_owner_pending` 只是交接点，不是退款完成状态。
- `processed_for_audit_only` 只表示当前输入已被安全归档或跳过，不表示业务完成。
- 未来真实状态 mutation 必须由单独 state transition owner 合同定义，不能由 provider callback、normalizer 或 manual review 直接执行。

## Owner Boundaries

Provider callback owner：

- 只负责接收 provider notification、验签、计算 raw digest。
- 不读写 order / payment / refund 状态。
- 不调用 provider refund API。

Inbox repository owner：

- 只负责 idempotency、duplicate replay、digest conflict、append-only event 语义。
- 不决定退款是否成功。
- 不执行 workflow。

Refund guard owner：

- 只评估 amount、currency、providerRefundId、merchant order ref、payment session、provider transaction、seller / market ownership、RBAC 和 manual review reasons。
- 输出仍必须不可执行。

Manual review owner：

- 只负责复核任务的 opened / assigned / resolved 语义。
- 复核通过不能直接改变退款状态。
- 必须保留 actor、reason、audit note 和 redaction policy。

State transition owner：

- 未来单独定义；必须读取 verified notification、guard result、manual review result、reconciliation result 和 settlement block。
- 必须在 RBAC、audit allowlist、幂等和 rollback guidance 通过后才能考虑 runtime。
- 当前阶段必须保持 `runtime_mutation_blocked`。

Settlement / commission / payout owner：

- 在 refund final state 和 reconciliation 均未完成前，必须 block 下游结算、佣金和打款调整。
- 已生成 settlement batch 或 payout 进入不可逆阶段时，必须进入 manual review。

## Idempotency Rules

建议 notification idempotency key：

```text
refund_notify:{provider}:{eventId}
```

要求：

- 相同 key + 相同 raw digest：进入 `duplicate_seen`，no-op。
- 相同 key + 不同 raw digest：进入 `digest_conflict_manual_review`，阻断 runtime mutation。
- providerRefundId 必须绑定 local refund request key；不匹配进入 manual review。
- provider event id 缺失时，只能使用更弱 fallback key，并标记 higher risk。
- provider request accepted / timeout / unknown 不能替代 notification finality。

## Audit Action Mapping

允许映射到既有 refund audit allowlist：

- `refund_notification_received`
- `refund_notification_verified`
- `refund_notification_normalized`
- `refund_notification_duplicate_seen`
- `refund_notification_digest_conflict`
- `refund_guard_manual_review_required`
- `refund_runtime_mutation_blocked`
- `refund_settlement_blocked`

仍禁止：

```text
refund_state_mutated
refund_workflow_executed
provider_refund_request_sent
settlement_adjusted
commission_adjusted
payout_adjusted
```

审计 metadata 不能包含 raw provider payload、private key、certificate、APIv3 key、webhook secret、完整手机号、证件号、银行卡号、完整地址、provider SDK request object 或 executable workflow command。

## Failure Matrix

| 场景 | 状态 | 处理 |
| --- | --- | --- |
| 缺失签名 | `terminal_rejected` | audit only，不写退款状态 |
| 签名无效 | `terminal_rejected` | audit only，不写退款状态 |
| unsupported event | `terminal_rejected` | audit only，不写退款状态 |
| malformed payload | `terminal_rejected` | audit only，不写退款状态 |
| 非 CNY | `manual_review_required` | 阻断 runtime mutation |
| amount mismatch | `manual_review_required` | 阻断 runtime mutation |
| providerRefundId mismatch | `manual_review_required` | 阻断 runtime mutation |
| merchant order ref mismatch | `manual_review_required` | 阻断 runtime mutation |
| duplicate same digest | `duplicate_seen` | no-op + audit |
| duplicate digest conflict | `digest_conflict_manual_review` | manual review + runtime blocked |
| provider unknown / timeout | `manual_review_required` | 等待后续 notification / reconciliation |
| settlement batch locked | `manual_review_required` | settlement blocked |
| payout irreversible | `manual_review_required` | payout / commission blocked |

## Go / No-Go

Go：

- 继续 docs-only state owner plan。
- 继续纯函数 state transition contract。
- 继续 fake-only inbox transition tests。
- 继续 local disposable DB dry-run，不注册生产 migration。
- 继续 audit event mapping 验证。

No-Go：

- 不新增真实 refund route。
- 不写真实 DB repository runtime。
- 不注册 migration。
- 不接支付宝 / 微信支付 refund API 或 SDK。
- 不生成 provider refund request。
- 不执行 Medusa payment / refund workflow。
- 不修改 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 后续 PR 顺序建议

1. `refund-inbox-state-transition-contract`
   - 纯函数 state transition evaluator + tests。
   - 输出仍为不可执行 decision。

2. `refund-runtime-gate-validation-v2`
   - 汇总 amount guard、idempotency、notification、manual review、audit allowlist 和 inbox state plan。
   - 再次确认 No-Go / Go 条件。

3. `refund-inbox-repository-plan`
   - docs-only 或 interface-only，定义 DB owner 和事务边界。
   - 不注册 migration，不接 route。

## 验证记录

本轮已执行并通过：

```text
git diff --check
git diff --name-only
git ls-files --others --exclude-standard
```

子智能体只读复核通过：

- diff 是否 docs-only。
- 是否没有修改 `apps/**` 或 `packages/**`。
- 是否明确 inbox state / normalized envelope / manual review 不代表退款成功。
- 是否禁止 provider API、workflow、state mutation、checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime。
