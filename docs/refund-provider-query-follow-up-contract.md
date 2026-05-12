# Refund Provider Query Follow-up Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `planRefundProviderQueryFollowUp()` 纯函数合同，把退款 provider query follow-up 输入映射为不可执行 shadow query command DTO 和 audit event。

该合同不会调用微信支付 / 支付宝 query API，不执行 Medusa workflow，不写平台退款成功状态。所有输出固定：

```text
executable: false
providerQueryAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
```

## 修改文件

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `packages/api/src/modules/china-payment-notification/refund-provider-query-follow-up.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-provider-query-follow-up.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-provider-query-follow-up-contract.md`
- `docs/refund-provider-query-follow-up-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Contract

第一版支持的 provider：

- `wechat_pay`
- `alipay`

第一版支持的触发来源：

- `missing_provider_refund_id`
- `query_required_notification`
- `delayed_provider_state`
- `manual_review_follow_up`
- `reconciliation_follow_up`

安全阻断：

- 验签未通过。
- 金额或币种不匹配。
- ownership / permission 未通过。
- 平台本地状态已终态冲突。
- 输入要求 runtime mutation。
- 缺少 provider-specific query key。

允许计划时也只生成 `provider_refund_query_shadow` DTO，且 `providerQueryAllowed=false`。

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-provider-query-follow-up.unit.spec.ts
cd ../..
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
```

结果：

```text
1 test suite passed
6 tests passed
API typecheck passed
```

补充验证已通过：

```text
payment notification harness passed: 45 suites / 342 tests, DB dry-run 2|9
runtime grep only matched existing denylist keys and negative assertions
git diff --check passed
subagent readonly review: No Findings
```

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
