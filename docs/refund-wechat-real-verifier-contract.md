# Refund WeChat Real Verifier Contract

更新时间：2026-05-10 Asia/Shanghai

## 结论

已新增微信支付退款结果回调 verifier 纯函数合同和 redacted fixtures。该合同只验证 header、serial、timestamp、fake deterministic signature、resource algorithm、deterministic test decryptor、merchant / app / order / refund request / amount / currency 和 event mapping。

本轮不接微信支付 SDK，不读真实密钥，不新增 route，不写 inbox / event log，不调用 provider refund API，不执行 workflow，不写 refund success state，也不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

`refund.succeeded` 只代表微信支付回调声称退款成功并通过 verifier 合同，不代表平台退款成功。

## 变更文件

```text
packages/api/src/modules/china-payment-notification/wechat-pay-refund-notification-test-vectors.ts
packages/api/src/modules/china-payment-notification/wechat-pay-refund-notification-verifier.ts
packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-refund-notification-verifier.unit.spec.ts
packages/api/src/modules/china-payment-notification/index.ts
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/tasks/refund-wechat-real-verifier-contract.md
docs/refund-wechat-real-verifier-contract.md
.codex/queue.md
project-ledger/changelog.md
project-ledger/status.md
project-ledger/handoff.md
```

## Contract 内容

新增：

- `WechatPayRefundNotificationBody`
- `WechatPayRefundDecryptedResource`
- `WechatPayRefundNotifyVector`
- `verifyWechatPayRefundNotificationContract()`
- `WechatPayRefundVerifierContractInput`
- `WechatPayRefundVerifierContractResult`
- `WechatPayRefundVerifierFailureCode`

覆盖：

- `REFUND.SUCCESS` -> `refund.succeeded`
- `REFUND.ABNORMAL` -> `refund.abnormal`
- `REFUND.CLOSED` -> `refund.closed`
- unknown -> non-executable verifier failure

## Safety Boundary

输出始终：

```text
fixtureOnly: true
executable: false
```

结果不包含：

- raw decrypted payload。
- private key。
- APIv3 key。
- platform certificate body。
- provider refund request。
- workflow command。
- refund state mutation。

## 验证结果

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/wechat-pay-refund-notification-verifier.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-notification-verifier.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

结果：

- Focused verifier / refund verifier tests：2 suites / 24 tests passed。
- API typecheck passed。
- Payment notification harness：41 suites / 313 tests passed。
- Payment DB dry-run row count：`2|9`，down/drop cleanup 通过。
- `packages/api/.mercur/index.d.ts` 由 typecheck 触发后已恢复，未纳入本轮。
- Runtime grep 仅命中既有 negative assertion / denylist / runtime-gate 文案，未发现新增 route、provider refund request、workflow execution、refund state mutation、settlement / commission / payout / fulfillment / logistics 执行路径。
- `git diff --check` passed。

## Rollback

代码级 revert 本 PR 即可。本轮不写 DB、不注册 module、不接 route、不读真实密钥，所以不需要数据回滚。

## 下一步

建议做 `refund-alipay-real-verifier-contract` 或先做 provider verifier contract validation。仍不得接 provider route、provider refund API、workflow 或 refund success state。
