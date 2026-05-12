# Refund Provider Query Local Fixture Contract

更新时间：2026-05-12 Asia/Shanghai

## 结论

新增 `refund-provider-query-local-fixtures`，提供 redacted fake provider query snapshot vectors，供后续 reconciliation / manual review 合同测试使用。

这些 fixtures 不发网络请求，不调用微信支付 / 支付宝 query API，不执行 workflow，不写平台退款成功状态。所有 fixture 固定：

```text
fixtureOnly: true
executable: false
networkRequestAllowed: false
providerQueryAllowed: false
runtimeMutationBlocked: true
refundSuccessState: false
```

## 修改文件

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `packages/api/src/modules/china-payment-notification/refund-provider-query-local-fixtures.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-provider-query-local-fixtures.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/tasks/refund-provider-query-local-fixture-contract.md`
- `docs/refund-provider-query-local-fixture-contract.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Fixtures

第一版包含：

- `wechat_pay_query_success_snapshot`：provider succeeded，但 reconciliation 结果仍是 manual review。
- `alipay_query_processing_snapshot`：provider processing，进入 schedule requery / manual review。
- `alipay_query_mismatch_snapshot`：金额 mismatch，进入 mismatch review。

所有 snapshot 都只保存 redacted field 和 digest，不保存 raw payload、签名、证书、私钥、API key、完整手机号、完整地址、银行卡或身份证号。

## Verification

已运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/refund-provider-query-local-fixtures.unit.spec.ts
cd ../..
/home/codex/.bun/bin/bunx tsc --noEmit -p packages/api/tsconfig.json
```

结果：

```text
1 test suite passed
3 tests passed
API typecheck passed
```

补充验证已通过：

```text
payment notification harness passed: 47 suites / 351 tests, DB dry-run 2|9
runtime grep found no executable provider query / workflow / refund success switches in the new fixture files
git diff --check passed
```

## No-Go

仍禁止：

- Fixture 发起真实 provider query。
- Fixture 结果直接写 refund success state。
- Fixture 结果直接执行 workflow。
- Fixture 结果直接触发 settlement / commission / payout。
- Fixture 绕过 permission / ownership / audit。
- Fixture 修改 fulfillment / logistics。
