# Refund Provider Inbox Route Disposable DB Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

下一步可以把 provider refund inbox route 从 local in-memory inbox-only rehearsal 推进到 local disposable DB inbox-only rehearsal。该阶段只允许在 development、local target、disposable PostgreSQL database、fixture-only provider config 全部通过时读取 body、调用 provider verifier contract、归一化 envelope，并写入一次性 DB 中的 refund inbox / event log。

这仍不是可用退款 runtime。它不连接预发或生产 DB、不注册 module、不接 SDK、不写真实密钥、不调用 provider refund API、不调用 refund query API、不执行 workflow、不写平台退款成功状态。

## 当前基线

PR #383 / #384 已完成：

- `/china/refund-inbox/wechat-pay` 和 `/china/refund-inbox/alipay` provider route 存在。
- Route 默认 disabled。
- 未通过 local gate 时不读取 body。
- 通过 development/local/in-memory/fixture-only gate 后，route 可调用 provider refund verifier contract。
- Provider result 会归一化为 internal refund envelope。
- Local in-memory repository 只写 inbox / audit-only result。
- 所有 response 固定 `runtimeMutationBlocked: true`、`stateMutationBlocked: true`、`refundSuccessState: false`。

## 后续 Implementation Scope

建议 PR 名：

```text
refund-provider-inbox-route-disposable-db
```

允许修改：

```text
packages/api/src/api/china/refund-inbox/wechat-pay/route.ts
packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
packages/api/src/api/china/refund-inbox/alipay/route.ts
packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-response.ts
packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-normalizer.ts
packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts
packages/api/src/modules/china-payment-notification/db-refund-inbox-repository.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts
packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-normalizer.unit.spec.ts
packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
packages/api/src/modules/china-payment-notification/__tests__/db-refund-inbox-repository.unit.spec.ts
docs/refund-provider-inbox-route-disposable-db.md
```

不允许修改：

- `apps/**`。
- checkout、cart、order placement、payment capture、refund state owner、settlement、commission、payout、permission、fulfillment、logistics runtime。
- `medusa-config.ts` module registration。
- Production / staging / preprod connection config。
- `.env*` with real secrets。

## Disposable DB Gate

新增 DB wiring 只允许：

```text
NODE_ENV=development
CHINA_REFUND_RUNTIME_ENABLED=true
CHINA_REFUND_NOTIFY_ROUTE_ENABLED=true
CHINA_REFUND_STATE_MUTATION_ENABLED=false
CHINA_REFUND_PROVIDER=wechat_pay | alipay
CHINA_REFUND_ROUTE_MODE=provider_inbox_only
CHINA_REFUND_TARGET_ENV=local
CHINA_REFUND_INBOX_LOCAL_INMEMORY=false 或未设置
CHINA_REFUND_INBOX_LOCAL_DB=true
CHINA_REFUND_INBOX_DATABASE_URL=postgres://.../fuyi_refund_provider_inbox_route_dry_run_<suffix>
```

DB guard 必须同时满足：

- Host 只能是 local host class：`localhost`、`127.0.0.1`、Unix socket 或当前项目已有 local PG allowlist。
- Database name 必须以 `fuyi_refund_provider_inbox_route_dry_run_` 开头。
- `NODE_ENV=production`、`APP_ENV=production`、`APP_ENV=staging`、`APP_ENV=preprod` 必须 blocked。
- URL 中出现 production-like host、cloud provider host、shared DB name、真实 credential hint 或 non-local port mismatch 必须 blocked。
- `CHINA_REFUND_STATE_MUTATION_ENABLED=true` 必须 blocked。
- 真实 key、private key、APIv3 key、证书、公钥、webhook token 或生产 merchant id 出现在 env 中必须 blocked。

## Request Flow

允许流程：

1. Config gate 和 disposable DB gate 通过前不读取 body。
2. 建立 local disposable DB client。
3. 读取 raw body。
4. 构建 provider raw notification。
5. 调用 provider verifier contract。
6. 将 verified provider result 转成 internal refund envelope。
7. 通过 DB-backed refund inbox repository 写 disposable DB。
8. 写 event log：received、signature_verified、normalized、runtime_mutation_blocked、manual_review 或 processed_for_audit_only。
9. 返回 safe response。

禁止流程：

- 调用 provider refund request。
- 调用 provider refund query。
- 执行 workflow。
- 写平台 refund success state。
- 发送 settlement / commission / payout / permission / fulfillment / logistics command。

## Schema Prerequisite

Implementation PR 必须复用当前 refund schema / local DB rehearsal 已验证的约束：

- Refund-only processing status 原样写入和读回。
- Actor 支持 `system_job` 等 refund inbox 审计来源。
- Positive amount guard。
- Event action allowlist 阻断 runtime mutation action。
- Metadata redaction helper / check 不允许 raw payload、signature、secret、DB URL、provider request/query、workflow/state mutation command。

如果 schema 不满足，implementation 必须 fail closed，并回到 docs / rehearsal 修正；不能在 route 内绕开约束。

## Provider Event Mapping

微信支付：

| Provider event | Disposable DB inbox decision | 平台退款成功 |
| --- | --- | --- |
| `REFUND.SUCCESS` | `accepted` then `runtime_mutation_blocked` | 否 |
| `REFUND.ABNORMAL` | `manual_review` | 否 |
| `REFUND.CLOSED` | `manual_review` 或 `processed_for_audit_only` | 否 |

支付宝：

| Provider mode / event | Disposable DB inbox decision | 平台退款成功 |
| --- | --- | --- |
| `product_specific_refund_notify` verified | `accepted` then `runtime_mutation_blocked` | 否 |
| `trade_async_notify` trade-only | `processed_for_audit_only` | 否 |
| `refund_query_follow_up` | `query_required` / `manual_review` | 否，且不调用 query API |
| amount / currency / identity mismatch | `manual_review` 或 `rejected` | 否 |

## Response Mapping

Disposable DB wiring 可返回：

| Decision | HTTP | 说明 |
| --- | --- | --- |
| disabled | 503 | 不读 body。 |
| db_gate_blocked | 503 | 不读 body，不连接 DB。 |
| accepted | 202 | 只代表 disposable DB inbox accepted。 |
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
- production / staging / preprod blocked 不读 body。
- DB gate missing 不读 body。
- unsafe DB host / DB name / credential hint blocked 不读 body。
- provider mismatch 不读 body。
- real-looking secret blocked 不读 body。
- local disposable DB gate 通过后才读取 body。
- WeChat verified success 写 disposable DB inbox，但 response 不是退款成功。
- WeChat abnormal / closed 进入 manual review / audit-only。
- Alipay product-specific refund notify 写 disposable DB inbox，但 response 不是退款成功。
- Alipay trade-only 进入 processed_for_audit_only。
- Alipay query-required 不调用 query API。
- duplicate same digest 返回 duplicate。
- duplicate digest conflict 返回 manual_review。
- disposable DB write failure 返回 fail closed response，不继续执行任何 state mutation。
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
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-normalizer.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/db-refund-inbox-repository.unit.spec.ts
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
  packages/api/src/api/china/refund-inbox/wechat-pay \
  packages/api/src/api/china/refund-inbox/alipay \
  packages/api/src/modules/china-payment-notification/refund-provider-inbox-*.ts || true
```

`packages/api/.mercur/index.d.ts` 如果由 typecheck 刷新，仍按项目规则恢复，除非该 PR 明确执行 codegen 并只包含本轮 route type。

## Rollback

- 设置 `CHINA_REFUND_NOTIFY_ROUTE_ENABLED=false`。
- 设置 `CHINA_REFUND_RUNTIME_ENABLED=false`。
- 保持 `CHINA_REFUND_STATE_MUTATION_ENABLED=false`。
- 删除 disposable DB。
- revert disposable DB wiring PR。

无生产数据回滚，因为该阶段只允许 local disposable DB。

## Next Sequence

1. `refund-provider-inbox-route-disposable-db`：实现 local disposable DB inbox-only wiring。
2. `refund-provider-inbox-route-disposable-db-validation`：合并后验证。
3. `refund-state-owner-handoff-plan`：规划平台退款状态 owner 和 workflow command。
4. `refund-reconciliation-boundary-plan`：规划 provider refund notification、query follow-up 和人工对账边界。

## No-Go

仍禁止：

- 真实 SDK dependency。
- 真实密钥 / 证书 / webhook token。
- 生产、预发、staging 或普通共享 DB 连接。
- provider refund request。
- provider refund query API。
- workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission weakening。
- fulfillment / logistics mutation。
