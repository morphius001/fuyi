# Refund Provider Inbox Route Local Wiring Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

下一步可以把当前 provider route disabled skeleton 推进到 local in-memory inbox-only wiring。该阶段只允许在 `NODE_ENV=development`、local target、local in-memory storage、provider fixture config 明确存在时读取 body、调用 provider verifier contract、写入 in-memory refund inbox repository，并返回安全响应。

这仍不是可用退款 runtime。它不连接 DB、不注册 module、不接 SDK、不写真实密钥、不调用 provider refund API、不调用 refund query API、不执行 workflow、不写平台退款成功状态。

## 当前基线

PR #380 已完成：

- `/china/refund-inbox/wechat-pay` route file exists。
- `/china/refund-inbox/alipay` route file exists。
- Route 默认 disabled。
- Local shadow flags enabled 时仍返回 disabled。
- Route 不读取 body。
- Route 不写 inbox。
- Config parser 阻断 production-like env、state mutation、provider mismatch、unsupported mode、non-local env、local DB 和 real-looking secrets。
- Safe response helper 固定 `refundSuccessState: false`，并对 key / value 递归 redaction。

## 后续 Implementation Scope

建议 PR 名：

```text
refund-provider-inbox-route-local-wiring
```

允许修改：

```text
packages/api/src/api/china/refund-inbox/wechat-pay/route.ts
packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
packages/api/src/api/china/refund-inbox/alipay/route.ts
packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-response.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-local-repository.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-normalizer.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-local-repository.unit.spec.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-normalizer.unit.spec.ts
docs/refund-provider-inbox-route-local-wiring.md
```

不允许修改：

- `apps/**`。
- checkout、cart、order placement、payment capture、refund state owner、settlement、commission、payout、permission、fulfillment、logistics runtime。
- `medusa-config.ts` module registration。
- migration application。
- `.env*` with real secrets。

## Feature Gate

local wiring 只允许：

```text
NODE_ENV=development
CHINA_REFUND_RUNTIME_ENABLED=true
CHINA_REFUND_NOTIFY_ROUTE_ENABLED=true
CHINA_REFUND_STATE_MUTATION_ENABLED=false
CHINA_REFUND_PROVIDER=wechat_pay | alipay
CHINA_REFUND_ROUTE_MODE=provider_inbox_only
CHINA_REFUND_TARGET_ENV=local
CHINA_REFUND_INBOX_LOCAL_INMEMORY=true
CHINA_REFUND_INBOX_LOCAL_DB=false 或未设置
```

新增 fixture config 必须明确 fake/test-only：

微信支付：

```text
CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_SIGNATURE=<fake deterministic signature>
CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_CIPHERTEXT=<fake ciphertext>
CHINA_REFUND_WECHAT_FIXTURE_DECRYPTED_RESOURCE_JSON=<redacted fixture json>
CHINA_REFUND_WECHAT_FIXTURE_PLATFORM_SERIAL=<fixture serial>
CHINA_REFUND_WECHAT_EXPECTED_MCH_ID=<fixture mch id>
CHINA_REFUND_WECHAT_EXPECTED_APP_ID=<fixture app id>
```

支付宝：

```text
CHINA_REFUND_ALIPAY_FIXTURE_EXPECTED_SIGNATURE=<fake deterministic signature>
CHINA_REFUND_ALIPAY_EXPECTED_APP_ID=<fixture app id>
CHINA_REFUND_ALIPAY_EXPECTED_SELLER_ID=<fixture seller id>
CHINA_REFUND_ALIPAY_REFUND_NOTIFY_MODE=product_specific_refund_notify | trade_async_notify | refund_query_follow_up
```

真实 key、private key、APIv3 key、证书、公钥、webhook token 或生产 merchant id 出现在 env 中必须 blocked。

## Request Flow

允许流程：

1. Config gate 通过前不读取 body。
2. 读取 raw body。
3. 构建 provider raw notification。
4. 调用 provider verifier contract。
5. 将 verified provider result 转成 internal refund envelope。
6. `repository.receiveNotification()` 写 local in-memory inbox。
7. `markSignatureVerified()` / `markNormalized()`。
8. 对 non-success provider event 写 manual review 或 processed_for_audit_only。
9. `markRuntimeMutationBlocked()` 或 `markProcessedForAuditOnly()`。
10. 返回 safe response。

禁止流程：

- 调用 provider refund request。
- 调用 provider refund query。
- 执行 workflow。
- 写平台 refund success state。
- 发送 settlement / commission / payout / permission / fulfillment / logistics command。

## Provider Event Mapping

微信支付：

| Provider event | Local inbox decision | 平台退款成功 |
| --- | --- | --- |
| `REFUND.SUCCESS` | `accepted` then `runtime_mutation_blocked` | 否 |
| `REFUND.ABNORMAL` | `manual_review` | 否 |
| `REFUND.CLOSED` | `manual_review` 或 `processed_for_audit_only` | 否 |

支付宝：

| Provider mode / event | Local inbox decision | 平台退款成功 |
| --- | --- | --- |
| `product_specific_refund_notify` verified | `accepted` then `runtime_mutation_blocked` | 否 |
| `trade_async_notify` trade-only | `processed_for_audit_only` | 否 |
| `refund_query_follow_up` | `query_required` / `manual_review` | 否，且不调用 query API |
| amount / currency / identity mismatch | `manual_review` 或 `rejected` | 否 |

## Response Mapping

第一版 local wiring 可返回：

| Decision | HTTP | 说明 |
| --- | --- | --- |
| disabled | 503 | 不读 body。 |
| accepted | 202 | 只代表 local inbox accepted。 |
| duplicate | 200 | 只代表 same digest replay。 |
| manual_review | 409 | 只代表需要人工复核。 |
| processed_for_audit_only | 202 | 只代表审计记录。 |
| query_required | 202 或 409 | 不调用 provider query API。 |
| rejected | 400 | 验签 / payload / identity fail。 |

所有 response 必须包含：

```json
{
  "runtimeMutationBlocked": true,
  "stateMutationBlocked": true,
  "refundSuccessState": false,
  "successMeans": "inbox_or_audit_only"
}
```

## Test Matrix

新增 tests 必须覆盖：

- disabled 不读 body。
- production blocked 不读 body。
- provider mismatch 不读 body。
- real-looking secret blocked 不读 body。
- local gate 通过后才读取 body。
- WeChat verified success 写 local in-memory inbox，但 response 不是退款成功。
- WeChat abnormal / closed 进入 manual review / audit-only。
- Alipay product-specific refund notify 写 local in-memory inbox，但 response 不是退款成功。
- Alipay trade-only 进入 processed_for_audit_only。
- Alipay query-required 不调用 query API。
- duplicate same digest 返回 duplicate。
- duplicate digest conflict 返回 manual_review。
- response 不泄露 raw body、signature / sign、serial、secret、DB URL、provider request/query、workflow/state mutation 或用户敏感数据。

## Verification Commands

后续 implementation PR 至少运行：

```bash
git diff --check
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts \
  src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-response.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-local-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-normalizer.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
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
  packages/api/src/api/china/refund-inbox/wechat-pay \
  packages/api/src/api/china/refund-inbox/alipay \
  packages/api/src/modules/china-payment-notification/refund-provider-inbox-*.ts || true
```

`packages/api/.mercur/index.d.ts` 如果由 typecheck 刷新，仍按项目规则恢复，除非该 PR 明确执行 codegen 并只包含本轮 route type。

## Rollback

- 设置 `CHINA_REFUND_NOTIFY_ROUTE_ENABLED=false`。
- 设置 `CHINA_REFUND_RUNTIME_ENABLED=false`。
- 保持 `CHINA_REFUND_STATE_MUTATION_ENABLED=false`。
- 清空 local in-memory repository。
- revert local wiring PR。

无生产数据回滚，因为 local wiring 不连接生产或预发 DB。

## Next Sequence

1. `refund-provider-inbox-route-local-wiring`：实现 local in-memory inbox-only wiring。
2. `refund-provider-inbox-route-local-wiring-validation`：合并后验证。
3. `refund-provider-inbox-route-disposable-db-plan`：规划 disposable DB wiring，不直接实现。
4. `refund-state-owner-handoff-plan`：规划平台退款状态 owner 和 workflow command。

## No-Go

仍禁止：

- 真实 SDK dependency。
- 真实密钥 / 证书 / webhook token。
- 生产或普通预发 DB 连接。
- provider refund request。
- provider refund query API。
- workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission weakening。
- fulfillment / logistics mutation。
