# Refund Provider Query Follow-up Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

退款 provider query 需要成为独立 follow-up owner，不能由 provider notification route、refund state owner handoff contract 或 workflow shadow command contract 直接调用。

第一版继续保持 docs-only：只定义边界、触发条件、输入输出、审计和后续 PR 顺序；不新增 query route，不接 SDK，不写真实密钥，不连接 DB，不执行 Medusa workflow，不写平台退款成功状态。

## 外部接口依据

- 微信支付合作伙伴文档的退款查询接口说明为：提交退款申请后可查询退款状态；合作伙伴场景的单笔查询示例使用 `GET /v3/ecommerce/refunds/id/{refund_id}`，并要求认证信息、`Accept: application/json` 和二级商户号等输入。参考：[微信支付查询单笔退款文档](https://pay.weixin.qq.com/doc/v3/partner/4012476908)。
- 支付宝开放平台 API V3 的 `alipay.trade.fastpay.refund.query` 用于查询通过退款接口提交的退款请求是否执行成功，示例输入包含 `out_request_no`、`out_trade_no`、`trade_no` 等字段，响应可能包含 `refund_status`。参考：[支付宝开放平台 API V3 Postman 文档](https://www.postman.com/alipay-dev/apiv3/request/y87u527/)。

以上依据只用于规划字段和风险，不代表本项目已接入这些接口。

## Owner 分层

新增 future owner：`RefundProviderQueryFollowUpOwner`。

它只消费不可执行输入：

```text
provider: wechat_pay | alipay
trigger: missing_provider_refund_id | query_required_notification | delayed_provider_state | manual_review_follow_up | reconciliation_follow_up
providerRefundId?: string
localRefundCommandKey?: string
merchantOrderReference?: string
paymentProviderSessionId?: string
amount?: { currency: "CNY"; value: number }
requestedBy: system_job | operator_shadow | reconciliation_shadow
sourceInboxId?: string
sourceAuditEventId?: string
```

第一版输出仍不可执行：

```text
executable: false
providerQueryAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
queryCommand?: redacted shadow DTO
auditEvent: provider_refund_query_follow_up_planned | provider_refund_query_follow_up_blocked
```

## 触发条件

允许进入 query follow-up 计划的场景：

- Provider notification 缺少 `providerRefundId`，需要后续人工或系统查询补齐引用。
- Alipay trade-only / query-required 通知场景，不能直接视为退款成功。
- WeChat / Alipay provider 状态存在延迟，需要延后再确认。
- Handoff contract 因 provider refund id、金额、币种、归属或终态冲突返回 `query_required`。
- Reconciliation 发现 provider / platform snapshot 不一致，但尚未允许写退款成功状态。

直接阻断：

- signature / verifier 未通过。
- amount 或 currency 与本地 refund command 不匹配。
- 缺少 merchant / seller / session ownership 校验依据。
- 当前 order / payment / refund session 已处于终态冲突。
- operator permission 或 audit actor 不满足要求。
- 任何要求立即执行 workflow、写 refund success state、调整 settlement / commission / payout 的输入。

## Provider 差异

### WeChat Pay

后续实现必须区分直连商户和服务商 / 电商平台商户模式，不能把 `sub_mchid`、平台商户号、商户证书、公钥 / 证书序列号写入代码。

第一版 contract 只保留 redacted query command：

```text
provider: "wechat_pay"
queryBy: providerRefundId | outRefundNo
subMerchantRef?: redacted
credentialProfileRef?: redacted
```

### Alipay

后续实现必须确认产品模式和 API 版本，不能把同步退款响应、支付成功通知或 trade-only notification 当成退款成功。`out_request_no` 应优先来自本地退款请求幂等键，`trade_no` / `out_trade_no` 只能作为查询定位辅助。

第一版 contract 只保留 redacted query command：

```text
provider: "alipay"
queryBy: outRequestNo | tradeNo | outTradeNo
appProfileRef?: redacted
```

## 审计与限流

Query follow-up owner 后续必须记录：

- 触发来源：notification / handoff / reconciliation / manual review。
- 去敏后的 provider、query key 类型、source inbox id 和 audit event id。
- 幂等键：`provider + query key + localRefundCommandKey + trigger`。
- 限流策略：按 provider、merchant、refund command 和 trigger 分桶。
- 重试策略：指数退避，失败进入 manual review，不得无限重试。
- 结果用途：只能生成 query snapshot 或 manual review input，不能直接写平台退款成功状态。

## 后续 PR 顺序

1. `refund-provider-query-follow-up-contract`：新增纯函数合同和 focused tests，输出不可执行 query command / audit event。
2. `refund-provider-query-follow-up-validation`：验证 contract 文件范围和 No-Go。
3. `refund-provider-query-reconciliation-plan`：规划 query snapshot 如何进入 reconciliation，不直接进入 refund success mutation。
4. `refund-provider-query-local-fixture-contract`：如确需 fixtures，只使用 redacted fake vectors，不接 SDK、不发网络请求。

## 验证计划

本计划 PR 验证：

```bash
git diff --check
git status --short --branch
```

子智能体只读复核需确认：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 没有新增真实 provider query route / SDK / secrets / DB / workflow。
- 没有把 provider query result 当作平台退款成功。

## No-Go

仍禁止：

- Provider inbox route 内直接 query provider。
- Handoff / shadow command contract 内直接 query provider。
- 真实 provider refund request 或 refund query API 调用。
- Workflow execution。
- Refund success state mutation。
- Settlement / commission / payout mutation。
- Permission weakening。
- Fulfillment / logistics mutation。
