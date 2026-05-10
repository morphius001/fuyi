# Refund Provider Inbox Route Shadow Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

未来 `refund-provider-inbox-route-shadow` implementation PR 可以开始，但第一版仍必须默认关闭、生产阻断、只写 inbox / audit，并且不改变平台退款状态。该 PR 的目标不是上线真实退款 runtime，而是在 local / disposable preprod gate 下验证真实 provider 通知进入 inbox-only route 的最小闭环。

本任务仍是 docs-only plan，不新增 route、不连接 DB、不注册 module、不接 SDK、不写真实密钥、不执行 workflow。

## Implementation PR 边界

允许的未来文件范围：

```text
packages/api/src/api/china/refund-inbox/wechat-pay/route.ts
packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
packages/api/src/api/china/refund-inbox/alipay/route.ts
packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-response.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-response.unit.spec.ts
docs/refund-provider-inbox-route-shadow.md
```

限制：

- 不修改 checkout、cart、order placement、settlement、commission、payout、permission、fulfillment 或 logistics runtime。
- 不修改 `medusa-config.ts` 注册真实 provider 或 module。
- 不新增 production migration application。
- 不新增真实 SDK dependency。
- 不写 `.env` 或真实部署配置。

## Feature Flag Contract

后续 implementation PR 必须新增纯函数 config parser，并保持默认 disabled：

```text
CHINA_REFUND_RUNTIME_ENABLED=false
CHINA_REFUND_NOTIFY_ROUTE_ENABLED=false
CHINA_REFUND_STATE_MUTATION_ENABLED=false
CHINA_REFUND_PROVIDER=disabled
CHINA_REFUND_ROUTE_MODE=disabled
CHINA_REFUND_TARGET_ENV=local
```

允许模式：

| Env / Mode | 允许行为 |
| --- | --- |
| `disabled` | 不读取 body，返回 disabled / not found。 |
| `provider_inbox_only` + local gate | 使用 redacted fixtures 或 local provider vectors 写 in-memory / local disposable DB inbox。 |
| `provider_inbox_only` + disposable preprod gate | 仅在 operator approval、备份、rollback、DB name / host guard 通过后短期开启。 |
| `provider_runtime_shadow` | 可生成 non-executable shadow decision，但仍不得写平台退款状态。 |

硬阻断：

- `NODE_ENV=production` 且 notify route 开启。
- `CHINA_REFUND_STATE_MUTATION_ENABLED=true`。
- `CHINA_REFUND_PROVIDER` 与 route provider 不一致。
- DB URL 缺失、DB name 不符合 disposable 前缀、actual DB 不匹配、host 非 allowlist。
- local in-memory 与 local DB 同时开启。
- 任何真实 secret / private key 直接来自代码默认值。

## Request Handling Order

Route handler 顺序必须固定：

1. 解析 config gate。
2. disabled / blocked 时在读取 body 前返回。
3. 读取 raw body。
4. 调用 provider-specific verifier。
5. 验证 provider、merchant identity、amount、currency、order ref、refund request ref。
6. 构造 normalized refund envelope。
7. 计算 digest 和 idempotency key。
8. 写 inbox / event log。
9. 对 response 做 redaction。
10. 返回 provider-compatible but non-success response semantics。

禁止在任何步骤中：

- 调用 provider refund request。
- 调用 provider refund query。
- 执行 workflow。
- 写平台 refund success state。
- 发出 settlement / commission / payout / fulfillment / logistics command。

## Provider Wiring

微信支付 route：

- 只能复用 `verifyWechatPayRefundNotification()` 或后续同名真实 verifier contract。
- `REFUND.SUCCESS` 只映射为 provider envelope event，不等于平台成功。
- `REFUND.ABNORMAL` / `REFUND.CLOSED` 必须进入 manual review / non-success audit。
- serial / signature / nonce / timestamp 不得完整回显。

支付宝 route：

- 只能复用 `verifyAlipayRefundNotification()` 或后续同名真实 verifier contract。
- product-specific refund notify 可进入 provider refund envelope。
- trade-only notify 只能是 `processed_for_audit_only` / review。
- query-required 只能返回 query-required audit，不得调用 query API。
- `success` response 给 provider 的语义只代表“通知已接收或拒绝重试策略”，不代表平台退款成功。

## Response Redaction Helper

后续 response helper 至少提供：

```ts
type RefundProviderInboxResponseStatus =
  | "disabled"
  | "accepted"
  | "duplicate"
  | "manual_review"
  | "processed_for_audit_only"
  | "query_required"
  | "rejected"
  | "retryable_error"
```

response / event metadata / audit metadata denylist：

- raw body / raw payload。
- `sign`、signature、nonce、serial 的完整组合。
- app secret、private key、APIv3 key、证书、公钥、webhook token。
- DB URL。
- provider refund request command。
- provider refund query command。
- workflow command。
- refund state mutation command。
- 完整手机号、身份证号、银行卡号、详细地址。
- settlement、commission、payout、fulfillment、logistics command。

`accepted`、`duplicate`、`manual_review`、`processed_for_audit_only`、`query_required` 必须在类型注释和 docs 中标明不是平台退款成功。

## Test Matrix

后续 implementation PR 必须覆盖：

Config parser：

- 默认 disabled。
- production blocked。
- preprod / staging blocked unless disposable gate explicitly present。
- state mutation flag true blocked。
- provider mismatch blocked。
- unsafe DB URL / DB name blocked。
- real-looking secret from default value blocked。

Route tests：

- disabled 不读取 body。
- env incomplete 不读取 body。
- invalid signature rejected。
- missing signature rejected。
- malformed payload rejected。
- wrong merchant / app / seller manual review。
- amount mismatch manual review。
- currency mismatch rejected 或 manual review。
- accepted only writes inbox / audit。
- duplicate same digest returns duplicate。
- duplicate different digest returns manual review。
- WeChat abnormal / closed never produce refund success。
- Alipay trade-only returns processed_for_audit_only。
- Alipay query-required does not call query API。
- response redaction removes raw body、signature、secret、DB URL、commands。

Runtime grep：

```bash
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
  packages/api/src/api/china/refund-inbox \
  packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts \
  packages/api/src/modules/china-payment-notification/refund-provider-inbox-response.ts || true
```

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
  src/modules/china-payment-notification/__tests__/wechat-pay-refund-notification-verifier.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/alipay-refund-notification-verifier.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
```

如果 typecheck 更新 `packages/api/.mercur/index.d.ts`，必须按项目规则确认是否由 route type generation 引起；除非 implementation PR 明确需要 route type 更新，否则恢复该文件。

## Rollback

第一层回滚必须只靠配置：

- `CHINA_REFUND_NOTIFY_ROUTE_ENABLED=false`。
- `CHINA_REFUND_RUNTIME_ENABLED=false`。
- `CHINA_REFUND_STATE_MUTATION_ENABLED=false`。
- provider 控制台暂停或切回 webhook endpoint。
- inbox 保留只读。

代码回滚：

- revert `refund-provider-inbox-route-shadow` PR。
- 不删除已写入 inbox / audit rows。
- 不尝试补跑 workflow 或财务 / 履约联动。

## PR Sequence

1. `refund-provider-inbox-route-shadow`：默认 disabled route skeleton + config / response helpers + tests，只写 inbox / audit。
2. `refund-provider-inbox-route-shadow-validation`：合并后验证文件范围、tests、harness、runtime grep。
3. `refund-state-owner-handoff-plan`：平台退款状态 owner / workflow command planning。
4. `refund-state-mutation-shadow-contract`：non-executable state mutation shadow command。
5. `refund-reconciliation-settlement-plan`：退款对账、结算、佣金和打款调整规划。

## No-Go

本阶段仍禁止：

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
