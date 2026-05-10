# Refund Provider Inbox Route Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

下一阶段可以规划真实 provider 退款通知的 inbox-only route shadow，但仍不能启用真实退款 runtime。该 route 的第一版只能把已验签、已归一化、已脱敏的支付宝 / 微信支付退款通知写入 inbox / audit；它不代表退款成功，不调用 provider refund request，不调用 refund query API，不执行 workflow，也不写平台退款状态。

当前结论仍是：No-Go to real refund runtime。允许的下一步只是单独 PR 中实现默认关闭的 provider inbox-only shadow，并且只能在 local / disposable preprod gate 下演练。

## 当前基线

已具备的前置能力：

- fake/local refund inbox route 已证明本地 in-memory 与 disposable DB inbox-only 语义。
- refund inbox schema / adapter rehearsal 已覆盖 refund-only state、actor、audit action 和 metadata redaction。
- 微信支付退款结果回调 verifier 纯函数合同已覆盖 redacted fixtures、fake deterministic signature、解密器形状、merchant / app / order / refund request / amount / currency 校验。
- 支付宝退款相关通知 verifier 纯函数合同已覆盖 sign / sign_type、canonical payload、fake deterministic signature、app / seller / order / trade / refund request / amount / currency 和 product mode。
- provider verifier 输出仍标记 `fixtureOnly: true` / `executable: false`，不代表平台退款成功。

仍未具备：

- 真实 provider route 实现。
- 真实 SDK / 证书 / 平台公钥 / APIv3 key / 私钥管理。
- 目标环境 migration application / module registration。
- platform refund state owner handoff。
- refund workflow execution。
- settlement / commission / payout / fulfillment / logistics 联动。
- Admin / Vendor 人工复核 UI 和权限边界。

## Route Shadow 草案

后续实现 PR 可以预留两个 provider-specific path，或一个 provider 参数化 path。第一版建议明确分开，避免支付宝 / 微信支付响应合同混淆：

```text
POST /china/refund-inbox/wechat-pay
POST /china/refund-inbox/alipay
```

第一版 route mode 只能是 provider inbox-only shadow：

- 读取 provider body。
- 先做 provider-specific signature / identity / amount / currency verification。
- 生成 normalized refund envelope。
- 计算 digest 和 idempotency key。
- 写入 inbox / event log。
- 返回 provider-compatible but safe response。

禁止：

- route handler 直接写 order / payment / refund terminal state。
- route handler 调用 provider refund request API。
- route handler 调用 provider refund query API。
- route handler 执行 workflow 或派发可执行 command。
- route handler 触发 settlement、commission、payout、permission、fulfillment 或 logistics mutation。

## Feature Flags

默认必须全关：

```text
CHINA_REFUND_RUNTIME_ENABLED=false
CHINA_REFUND_NOTIFY_ROUTE_ENABLED=false
CHINA_REFUND_STATE_MUTATION_ENABLED=false
CHINA_REFUND_PROVIDER=disabled
CHINA_REFUND_ROUTE_MODE=disabled
```

允许的后续 route mode：

| Mode | 语义 |
| --- | --- |
| `disabled` | 不处理 provider 通知，不读取 body。 |
| `provider_inbox_only` | 验签后只写 inbox / audit，不写平台退款状态。 |
| `provider_runtime_shadow` | 仍只写 inbox / audit，可附加 non-executable shadow decision。 |

生产默认仍必须 blocked。`provider_inbox_only` 只允许在 local 或 disposable preprod gate 通过后短期开启；`CHINA_REFUND_STATE_MUTATION_ENABLED=true` 必须是后续独立 PR，不能和 route shadow 同批上线。

No-Go：

- `.env*`、代码或文档样例写入真实 app id、merchant id、private key、APIv3 key、证书、公钥、webhook token 或 DB URL。
- production / preprod 自动启用 provider route。
- fake secret、fixture serial 或 sandbox key 被当成生产配置。

## Verification And Normalization Gate

provider route 必须先验签，再归一化，再写 inbox。

微信支付：

- 校验 `Wechatpay-Signature`、`Wechatpay-Timestamp`、`Wechatpay-Nonce`、`Wechatpay-Serial`。
- 按平台证书 / 公钥序列号选择 verifier。
- 验签通过后才能解密 `resource`。
- 解密后校验 `mchid`、`appid`、`out_trade_no`、`out_refund_no`、`refund_id`、金额、币种和 event type。
- `REFUND.SUCCESS` 只能进入 provider envelope，不等于平台退款成功。

支付宝：

- 校验 `sign` / `sign_type`，canonical payload 必须排除签名字段。
- 明确 charset、RSA2、公钥选择、app_id、seller_id / seller_email、trade_no、out_trade_no、out_request_no / out_biz_no、金额和币种。
- `trade_status` / product-specific refund notify 的产品模式必须显式区分。
- trade-only 或 query-required 通知只能进入 review / query-required envelope；本阶段不调用 query API。

验签失败、identity mismatch、amount mismatch、currency mismatch、unknown refund id、malformed payload 均不得写成 `accepted` 成功态。可写 rejected audit，但不得泄露 raw provider payload。

## Idempotency And Inbox Semantics

幂等 owner 是 inbox repository，不是 workflow。

建议 key 组成：

- provider。
- provider event id / notify id。
- provider refund id。
- local refund request id。
- merchant order reference。
- normalized digest。

语义：

| 场景 | Route decision | 说明 |
| --- | --- | --- |
| 首次验签通过 | `accepted` | 只表示 inbox / audit accepted。 |
| same digest replay | `duplicate` | 只表示重复通知，不重复写 event。 |
| same key different digest | `manual_review` | 进入人工复核，不覆盖旧记录。 |
| trade-only update | `processed_for_audit_only` | 只记录交易状态相关审计，不代表退款完成。 |
| query-required | `manual_review` 或 `query_required` | 本阶段不调用 provider query API。 |
| 验签失败 | `rejected` | 可审计，但不得触发状态变更。 |
| DB retryable error | `retryable_error` | route 需让 provider 可重试。 |

`accepted`、`duplicate`、`manual_review`、`processed_for_audit_only`、`query_required` 均不得等同平台退款成功。

## Response Safety

response 只能返回安全摘要，例如：

```json
{
  "status": "accepted",
  "mode": "provider_inbox_only",
  "provider": "wechat_pay",
  "record": {
    "provider_event_id": "evt_redacted",
    "provider_refund_id": "refund_redacted",
    "decision": "accepted"
  }
}
```

禁止 response、log、event metadata、audit metadata 暴露：

- raw body / raw payload。
- signature、nonce、serial 的完整组合。
- app secret、private key、APIv3 key、证书、公钥、webhook token。
- DB URL、workflow command、provider refund request command、provider query command。
- 完整手机号、身份证号、银行卡号、详细地址。
- checkout、order、settlement、commission、payout、fulfillment 或 logistics 可执行指令。

## Planned Files For Future Implementation

本任务不实现以下文件，仅规划后续 PR 边界：

```text
packages/api/src/api/china/refund-inbox/wechat-pay/route.ts
packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
packages/api/src/api/china/refund-inbox/alipay/route.ts
packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-response.ts
```

后续 implementation PR 仍必须：

- 默认 disabled。
- 不注册真实 provider SDK。
- 不连接生产或普通预发 DB。
- 不启用 refund state mutation。
- 不修改 cart、checkout、order placement、settlement、commission、payout、permission、fulfillment 或 logistics。

## Verification Matrix

未来 provider inbox route shadow PR 至少需要：

```bash
git diff --check
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts \
  src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/wechat-pay-refund-notification-verifier.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/alipay-refund-notification-verifier.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
grep -RIn \
  -e providerRefundRequest \
  -e refundQuery \
  -e execute_workflow \
  -e refundStateMutation \
  -e settlement_adjusted \
  -e commission_adjusted \
  -e payout_adjusted \
  -e fulfillment \
  -e logistics \
  packages/api/src/api/china/refund-inbox || true
```

Route tests 必须覆盖：

- 默认 disabled 不读取 body。
- production / preprod / staging blocked。
- env incomplete blocked。
- invalid signature rejected。
- identity mismatch rejected 或 manual review。
- amount / currency mismatch manual review。
- accepted 不含退款成功语义。
- duplicate same digest 不重复写 event。
- different digest conflict 进入 manual review。
- trade-only / query-required 不调用 refund query API。
- response redaction 不泄露 raw body、signature、secret、DB URL、workflow command 或 provider request command。

## Rollback

后续 route shadow PR 的回滚方式必须是配置优先：

- 设置 `CHINA_REFUND_NOTIFY_ROUTE_ENABLED=false`。
- 设置 `CHINA_REFUND_RUNTIME_ENABLED=false`。
- 保持 `CHINA_REFUND_STATE_MUTATION_ENABLED=false`。
- 从 provider 控制台暂停或切回 webhook endpoint。
- 保留 inbox 只读，不删除已写入的 audit rows。
- 如需代码回滚，revert route shadow PR。

生产不应需要删除数据才能回滚；如果需要删除数据才能回滚，则 route shadow 仍为 No-Go。

## Release Sequence

建议继续小 PR 串行：

1. `refund-provider-inbox-route-plan-validation`：在最新 main 上验证本计划仍只改 docs / task / ledger。
2. `refund-provider-inbox-route-shadow-plan`：把 provider route implementation PR 的文件范围、测试夹具、feature flag 和 redaction helper 再细化。
3. `refund-provider-inbox-route-shadow`：默认 disabled，实现 provider inbox-only route shadow，只允许 local / disposable preprod gate。
4. `refund-state-owner-handoff-plan`：规划平台 refund state owner、workflow command 和人工复核，不执行。
5. `refund-state-mutation-shadow-contract`：只输出不可执行 shadow command。
6. `refund-reconciliation-settlement-plan`：单独规划退款对账、结算、佣金和打款调整。

## No-Go

当前及下一步仍禁止：

- 真实 SDK 接入。
- 真实密钥 / 证书 / webhook token。
- provider refund request。
- provider refund query API。
- workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission weakening。
- fulfillment / logistics mutation。
- route response 或日志暴露 raw provider payload。
