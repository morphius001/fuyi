# refund-notification-fake-fixtures

## 目标

新增退款通知 fake-only fixtures 和 focused tests，覆盖 `refund.succeeded` / `refund.failed`；不实现 verifier / normalizer / runtime。

## 范围

- 新增 `refund-notification-test-vectors.ts`。
- 新增 focused unit tests。
- 将测试加入 payment notification harness。
- 更新 docs / ledger / queue。

## 非目标

- 不实现 verifier。
- 不实现 normalizer。
- 不新增 refund route。
- 不写 DB，不注册 migration。
- 不调用 Medusa refund workflow。
- 不接支付宝 / 微信支付 refund API。
- 不读取真实 secret。
- 不输出 refund success state mutation。
- 不改变 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-notification-test-vectors.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
grep -RIn -e refund.succeeded -e refund.failed -e providerRefundRequest -e refundStateMutation -e createRefund -e wechat_refund -e alipay_refund packages/api/src/modules/china-payment-notification packages/api/src/api/china || true
git diff --check
```

## 交付

- `packages/api/src/modules/china-payment-notification/refund-notification-test-vectors.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-notification-test-vectors.unit.spec.ts`
- `docs/refund-notification-fake-fixtures.md`
- `.codex/tasks/refund-notification-fake-fixtures.md`
- harness / ledger / queue 更新
