# Refund Route Runtime Readiness Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

真实退款通知 route / runtime 当前仍为 No-Go。已有工作只证明 fake/local inbox-only route、本地 disposable DB schema / repository / adapter 和审计约束在受控环境中可演练；这些结果不能推导为真实退款成功、真实 provider 可接入、退款 workflow 可执行，或结算、佣金、打款、履约、物流可联动。

下一阶段若要从 `/china/refund-inbox/mock` 走向真实 provider refund notification route，必须先通过本文的 readiness gate。任何一个 gate 未通过，都只能继续保持 fake/local inbox-only 或 docs/test-only 状态。

## 当前基线

已经完成的低风险基线：

- `/china/refund-inbox/mock` 默认 disabled，production / preprod / staging blocked。
- fake/local in-memory inbox-only gate 可验证 accepted / duplicate / manual review response。
- fake/local disposable DB-backed inbox-only gate 可写入 shared inbox / event log。
- migration skeleton 已扩展 refund-only processing status、refund audit action、actor、positive amount 和 metadata redaction constraints。
- local PG refund inbox adapter 已在新 schema 下原样写入 / 读回 refund state 和 actor。
- real-adapter rehearsal 仍只连接本地 disposable PostgreSQL。

仍未完成且不能假设存在：

- 真实支付宝 / 微信支付 refund notification verifier。
- 真实 provider certificate / platform key / serial rotation。
- 真实 refund route feature flag rollout。
- module registration 和目标环境 migration application。
- refund state owner handoff。
- provider refund request execution。
- refund workflow execution。
- settlement / commission / payout reconciliation。
- Admin / Vendor 退款权限、归属和人工复核 UI。
- 生产 observability、告警、审计导出和回滚演练。

## Readiness Gates

### Gate 1: File And Runtime Boundary

上线前必须确认真实 route PR 的文件范围被限定为 route gate、provider verifier / normalizer、inbox repository wiring、tests 和 docs。

No-Go 条件：

- 同一 PR 修改 checkout、cart、order placement、settlement、commission、payout、fulfillment、logistics 或 permission runtime。
- route 直接调用 provider refund request API。
- route 直接执行 refund workflow 或写退款成功状态。
- route response 把 accepted / duplicate / manual_review 表达为退款成功。
- route 暴露 raw payload、signature、secret、DB URL、workflow command 或 provider request command。

### Gate 2: Environment And Feature Flags

真实 route 必须默认关闭，并且至少拆成三层开关：

```text
CHINA_REFUND_RUNTIME_ENABLED=false
CHINA_REFUND_NOTIFY_ROUTE_ENABLED=false
CHINA_REFUND_STATE_MUTATION_ENABLED=false
```

推荐附加 gate：

```text
CHINA_REFUND_PROVIDER=mock_china_pay | alipay | wechat_pay
CHINA_REFUND_ROUTE_MODE=disabled | fake_inbox_only | provider_inbox_only | provider_runtime_shadow
CHINA_REFUND_TARGET_ENV=local | disposable_preprod | production
```

Go 条件：

- production 默认全 false。
- preprod 只能在 disposable DB、备份、rollback 和 operator approval 准备完成后开启 inbox-only。
- `provider_runtime_shadow` 只能写 inbox / audit，不改变退款状态。
- `CHINA_REFUND_STATE_MUTATION_ENABLED=true` 必须单独 PR，不能跟 route 启用同批上线。

No-Go 条件：

- `.env*` 或代码中硬编码真实 app id、merchant id、private key、APIv3 key、证书、webhook token 或 DB URL。
- 本地默认值在 production 自动启用真实 provider。
- preprod / production 复用 fake secret。

### Gate 3: Provider Verification

真实 provider notification 必须先验签，再 normalize，再写 inbox。验签失败只能进入拒绝审计，不得进入 refund state mutation。

Go 条件：

- 支付宝：明确 canonical payload、`sign` / `sign_type` 排除规则、charset、RSA / RSA2、seller / app identity match 和 replay window。
- 微信支付：明确平台证书序列号、证书轮换、回调报文验签、密文解密、nonce / timestamp replay window 和 merchant identity match。
- 每个 provider 都必须输出 normalized refund envelope，并保留 `signatureVerified: true | false`。
- verifier / normalizer focused tests 覆盖 success、bad signature、wrong merchant、wrong amount、wrong currency、unknown refund id、replay 和 malformed payload。

No-Go 条件：

- 签名失败仍写入 accepted。
- 前端 return URL 或人工刷新作为退款成功来源。
- raw provider payload 直接进入 response、日志或 audit metadata。

### Gate 4: Inbox And Idempotency

真实 route 第一阶段只能 provider inbox-only。幂等 owner 是 inbox repository，不是 workflow。

Go 条件：

- `provider_event_id` / `provider_refund_id` / normalized digest / local refund command key 的组合规则明确。
- same digest duplicate 返回 duplicate / replay，不重复写 event。
- different digest conflict 必须进入 manual review。
- retryable DB error 不能吞掉；route 必须返回可重试语义。
- event log action 只允许 refund audit allowlist。

No-Go 条件：

- 用 provider refund id 单字段决定成功。
- 幂等冲突自动覆盖旧记录。
- duplicate response 写成 refund succeeded。

### Gate 5: Schema And Migration

module registration 或 migration application 必须晚于 operator preflight。

Go 条件：

- 目标 DB 已完成备份。
- operator preflight SQL 证明没有不兼容旧数据。
- migration up / down 在 disposable preprod rehearsal 通过。
- rollback runbook 明确 event log / helper function / indexes 的恢复策略。
- 生产执行窗口、负责人和 freeze window 明确。

No-Go 条件：

- 未注册 migration skeleton 被误认为已经应用到真实环境。
- down migration 会静默删除仍需保留的 refund inbox rows。
- 目标环境存在旧 payment-first constraints，但 route 写入新 refund-only state。

### Gate 6: Refund State Owner Handoff

inbox state、provider notification state 和平台 refund state 必须分离。`refund.succeeded` notification 只代表 provider 声称退款完成，不等于平台已完成所有业务状态。

Go 条件：

- 明确 platform refund entity / workflow 的 owner。
- 明确 allowed state transition、terminal state、retry state 和 manual review state。
- state mutation command 必须包含 signature verification result、amount/currency check、ownership check、permission result 和 idempotency key。
- workflow 执行必须异步、幂等、可重试，并保留 provider event data 的 redacted reference。

No-Go 条件：

- route handler 直接写 order / payment / refund terminal state。
- provider notification 金额或币种不匹配仍进入成功状态。
- refund success 触发 settlement、commission、payout、fulfillment 或 logistics 自动变更。

### Gate 7: Permission, Ownership, And Manual Review

人工复核必须先存在 owner、actor 和 audit boundary。

Go 条件：

- Admin / Vendor / system job 的 actor type 和 resource ownership 明确。
- Vendor 只能看到自己有权处理的退款。
- manual review 必须记录 reason code、operator note redaction、timestamp 和 previous decision。
- 高风险场景默认 manual review：digest conflict、amount mismatch、merchant mismatch、late event、unknown refund id、terminal state conflict。

No-Go 条件：

- Vendor 可跨商户处理退款。
- Admin action 绕过审计。
- manual review 直接触发 payout / commission adjustment。

### Gate 8: Settlement, Commission, Payout, Fulfillment, Logistics Block

退款 runtime 初次启用不得联动财务和履约状态。

Go 条件：

- refund notification inbox-only 阶段不写 settlement / commission / payout。
- reconciliation 任务另行设计 provider账单、平台订单、退款记录和商户结算的匹配。
- fulfillment / logistics 只能看到只读 refund pending / review 状态，不自动取消、拦截或改派。

No-Go 条件：

- 退款通知直接触发商户结算扣减、佣金回滚、打款冻结、履约取消或物流拦截。
- 同一 PR 同时开启退款状态和结算 / 佣金 / 打款 mutation。

### Gate 9: Observability And Rollback

真实 route 必须能安全观察、可暂停、可回滚。

Go 条件：

- 非敏感指标：provider、event type、route mode、decision、manual review reason、retryable error count、duplicate count、digest conflict count。
- 告警：验签失败突增、digest conflict、unknown refund id、DB write failure、state mutation disabled hit。
- rollback：关闭 notify route、关闭 runtime、关闭 state mutation、保留 inbox 只读、停止 provider webhook 配置。
- provider webhook endpoint 切换有回退 URL 或暂停机制。

No-Go 条件：

- 无法区分 rejected / duplicate / manual review / processed_for_audit_only。
- 回滚需要删除生产数据。
- 日志泄露 raw payload、手机号、地址、证件号、银行卡、secret 或 provider private fields。

## Release Sequence

建议拆成串行 PR，不并行推进高风险状态：

1. `refund-route-runtime-readiness-validation`：在最新 main 上复核本文 gate 和现有 mock/local route 状态。
2. `refund-provider-real-verifier-plan`：按支付宝 / 微信支付分别规划真实验签，不接 SDK。
3. `refund-provider-real-verifier-contract`：实现 provider-specific verifier 纯函数和 fake/sandbox vectors，不接 route。
4. `refund-provider-inbox-route-plan`：规划 provider inbox-only route，不写业务状态。
5. `refund-provider-inbox-route-shadow`：默认 disabled，只在 disposable preprod 写 inbox / audit。
6. `refund-state-owner-handoff-plan`：规划平台退款状态 owner 和 workflow command，不执行。
7. `refund-state-mutation-shadow-contract`：只输出不可执行或 shadow command，人工复核通过后再进入单独 runtime PR。
8. `refund-reconciliation-settlement-plan`：退款对账、结算、佣金和打款调整单独规划。

## Verification Matrix

每个后续真实 route 相关 PR 至少需要：

```bash
git diff --check
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-schema-constraint-migration-rehearsal.sh
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
```

真实 provider / route PR 还必须额外验证：

- production / preprod / staging guard。
- disabled-by-default。
- bad signature rejected。
- wrong merchant / amount / currency rejected。
- duplicate same digest replay。
- digest conflict manual review。
- response redaction。
- runtime grep 未出现 provider refund request、workflow execution、refund state mutation、settlement / commission / payout / fulfillment / logistics mutation。

## Rollback

最小 rollback 顺序：

1. 设置 `CHINA_REFUND_NOTIFY_ROUTE_ENABLED=false`。
2. 设置 `CHINA_REFUND_RUNTIME_ENABLED=false`。
3. 设置 `CHINA_REFUND_STATE_MUTATION_ENABLED=false`。
4. 暂停 provider webhook 或切回未启用 URL。
5. 保留 inbox / event log 只读，禁止删除生产记录。
6. 对已进入 manual review 的事件保持人工处理，不自动重放到 runtime。

## Go / No-Go

Go 仅限：

- docs-only readiness。
- fake/local inbox-only。
- disabled-by-default provider inbox route shadow。
- 本地或 disposable preprod rehearsal。

No-Go 仍包括：

- 真实 provider refund request。
- refund workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission weakening。
- fulfillment / logistics mutation。
- 预发 / 生产 DB 未经备份、preflight 和 rollback 演练的 migration。

## 下一步

建议先做 `refund-route-runtime-readiness-validation`，在合并后复核本文 gate、现有 route 状态和验证命令；之后才能按 provider verifier / inbox-only shadow 的顺序继续拆分。不要直接进入真实退款成功状态或财务联动。
