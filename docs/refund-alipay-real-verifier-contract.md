# Refund Alipay Real Verifier Contract

更新时间：2026-05-10 Asia/Shanghai

## 结论

已新增支付宝退款相关通知 verifier 纯函数合同和 redacted fixtures。该合同只验证 `sign`、`sign_type`、canonical payload、fake deterministic signature、app / seller / order / trade / refund request / amount / currency 和 product mode。

本轮不接支付宝 SDK，不读真实密钥，不新增 route，不写 inbox / event log，不调用 provider refund API 或 refund query API，不执行 workflow，不写 refund success state，也不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

`refund.succeeded` 只代表支付宝相关通知在 product-specific refund notify mode 下形成 verifier envelope，不代表平台退款成功。trade-only notification 和 query-required mode 仍保持 manual review / follow-up 语义。

## 变更文件

```text
packages/api/src/modules/china-payment-notification/alipay-refund-notification-test-vectors.ts
packages/api/src/modules/china-payment-notification/alipay-refund-notification-verifier.ts
packages/api/src/modules/china-payment-notification/__tests__/alipay-refund-notification-verifier.unit.spec.ts
packages/api/src/modules/china-payment-notification/index.ts
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/tasks/refund-alipay-real-verifier-contract.md
docs/refund-alipay-real-verifier-contract.md
.codex/queue.md
project-ledger/changelog.md
project-ledger/status.md
project-ledger/handoff.md
```

## Contract 内容

新增：

- `AlipayRefundNotifyMode`
- `AlipayRefundNotifyVector`
- `buildAlipayRefundNotificationCanonicalPayloadContract()`
- `verifyAlipayRefundNotificationContract()`
- `AlipayRefundVerifierContractInput`
- `AlipayRefundVerifierContractResult`
- `AlipayRefundVerifierFailureCode`

覆盖：

- product-specific refund notify -> `refund.succeeded` verifier envelope。
- trade-only notification -> `trade.updated` + non-executable review semantics。
- refund query follow-up mode -> `refund.unknown` + query-required semantics。

## Safety Boundary

输出始终：

```text
fixtureOnly: true
executable: false
```

结果不包含：

- canonical payload 明文。
- private key。
- 支付宝公钥或证书全文。
- provider refund request。
- refund query command。
- workflow command。
- refund state mutation。

## 验证结果

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/alipay-refund-notification-verifier.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/alipay-notification-verifier.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-notification-verifier.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

结果：

- Focused Alipay refund / Alipay notification / refund verifier tests：3 suites / 29 tests passed。
- API typecheck passed。
- Payment notification harness：42 suites / 322 tests passed。
- Payment DB dry-run row count：`2|9`，down/drop cleanup 通过。
- `packages/api/.mercur/index.d.ts` 由 typecheck 触发后已恢复，未纳入本轮。
- Runtime grep 仅命中既有 negative assertion / denylist / runtime-gate 文案，未发现新增 route、provider refund API、refund query API、workflow execution、refund state mutation、settlement / commission / payout / fulfillment / logistics 执行路径。
- `git diff --check` passed。

## Rollback

代码级 revert 本 PR 即可。本轮不写 DB、不注册 module、不接 route、不读真实密钥，所以不需要数据回滚。

## 下一步

建议做 `refund-provider-real-verifier-contract-validation`，汇总微信和支付宝 verifier 合同；仍不得接 provider route、provider refund API、refund query API、workflow 或 refund success state。
