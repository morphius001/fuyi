# Refund Provider Query Reconciliation Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

Provider query snapshot 只能作为 reconciliation / manual review 的输入，不能直接写平台退款成功状态，也不能直接触发 settlement、commission、payout、permission、fulfillment 或 logistics mutation。

本轮只做 docs-only 规划：不新增 route，不连接 DB，不注册 module，不接 SDK，不写真实密钥，不调用真实微信支付 / 支付宝 query API，不执行 Medusa workflow。

## 上游输入

未来 reconciliation owner 只消费不可执行 snapshot：

```text
source: provider_query_snapshot
provider: wechat_pay | alipay
queryFollowUpId: string
providerRefundId?: string
localRefundCommandKey?: string
merchantOrderReference?: string
paymentProviderSessionId?: string
providerRefundState: succeeded | failed | processing | closed | abnormal | unknown
amount?: { currency: "CNY"; value: number }
queriedAt: string
rawPayloadDigest?: string
redactionApplied: true
providerQueryAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
```

这些字段只能来自经过 redaction 的 snapshot；不得保存 raw payload、签名、证书、公钥、私钥、API key、完整手机号、完整地址、银行卡或身份证号。

## Reconciliation Owner

建议新增 future owner：`RefundProviderQueryReconciliationOwner`。

它负责把 provider query snapshot 与本地只读快照对比：

- 本地 refund command：金额、币种、provider refund id、payment session、merchant order ref。
- 本地 payment / refund session 状态：只读，不写。
- Provider snapshot：状态、金额、币种、provider refund id。
- Inbox / audit 证据：source inbox id、query follow-up id、operator / system actor。

第一版输出仍不可执行：

```text
executable: false
workflowExecutionAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
decision: ready_for_manual_review | mismatch_requires_review | provider_still_processing | blocked
```

## Decision Matrix

可以进入人工复核的场景：

- Provider snapshot 显示 succeeded，且金额、币种、provider refund id、payment session 与本地只读快照一致。
- Provider snapshot 显示 failed / closed / abnormal，需要运营确认后续动作。
- Provider snapshot 显示 processing，进入延迟重查或人工复核排队。

必须阻断的场景：

- Query snapshot 未经过 redaction。
- Provider / local 金额或币种不一致。
- Provider refund id 与本地 expected snapshot 冲突。
- Payment session / merchant order reference 不一致。
- 本地状态已经处于 terminal conflict。
- 输入要求执行 workflow、写 refund success state、调整 settlement / commission / payout、弱化 permission 或修改 fulfillment / logistics。

## Manual Review Handoff

即使 provider snapshot 显示退款成功，第一版也只能生成人工复核输入：

```text
manualReviewReason: provider_query_snapshot_consistent | provider_query_mismatch | provider_processing | provider_failure
recommendedNextStep: review_platform_refund_state | schedule_requery | investigate_provider_mismatch
stateMutationAllowed: false
financialMutationAllowed: false
fulfillmentMutationAllowed: false
```

人工复核也不能绕过后续 refund state owner、workflow command adapter、权限、审计、结算/佣金/打款隔离。

## 后续 PR 顺序

1. `refund-provider-query-reconciliation-contract`：新增纯函数合同和 focused tests，输出不可执行 reconciliation decision / manual review handoff。
2. `refund-provider-query-reconciliation-validation`：验证 contract 文件范围、tests 和 No-Go。
3. `refund-provider-query-local-fixture-contract`：如确需 query snapshot fixtures，仅使用 redacted fake vectors，不接 SDK、不发网络请求。
4. `refund-state-mutation-readiness-plan`：只有在 reconciliation / manual review / permission / audit 全部准备好后，才规划状态写入 readiness，不直接实现。

## 验证计划

本计划 PR 验证已通过：

```bash
git diff --check
git status --short --branch
```

子智能体只读复核返回 No Findings，并确认：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 没有新增真实 provider query route / SDK / secrets / DB / workflow。
- 没有把 provider query snapshot 当作平台退款成功。
- 没有把 reconciliation 输出接到财务、权限、履约或物流 mutation。

## No-Go

仍禁止：

- Query snapshot 直接写 refund success state。
- Query snapshot 直接执行 workflow。
- Query snapshot 直接触发 settlement / commission / payout。
- Query snapshot 绕过 permission / ownership / audit。
- Query snapshot 修改 fulfillment / logistics。
- 真实 provider refund request 或 refund query API 调用。
