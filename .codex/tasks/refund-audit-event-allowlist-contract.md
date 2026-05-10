# refund-audit-event-allowlist-contract

## 目标

新增退款 audit event action allowlist 纯函数和 focused tests。

## 范围

- 新增 `refund-audit-event-allowlist.ts`。
- 新增 focused unit tests。
- 将测试加入 payment notification harness。
- 更新 docs / ledger / queue。

## 非目标

- 不写 DB，不注册 migration。
- 不新增 refund route。
- 不调用 Medusa refund workflow。
- 不接支付宝 / 微信支付 refund API 或真实 SDK。
- 不读取真实 secret、证书、APIv3 key、app id 或 merchant id。
- 不输出 provider refund request。
- 不输出 refund success state mutation。
- 不改变 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-audit-event-allowlist.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
grep -RIn -e refundStateMutation -e providerRefundRequest -e createRefund -e wechat_refund -e alipay_refund -e workflow_execution packages/api/src/modules/china-payment-notification/refund-audit-event-allowlist.ts packages/api/src/modules/china-payment-notification/__tests__/refund-audit-event-allowlist.unit.spec.ts packages/api/src/api/china || true
git diff --check
```

## 交付

- `packages/api/src/modules/china-payment-notification/refund-audit-event-allowlist.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-audit-event-allowlist.unit.spec.ts`
- `docs/refund-audit-event-allowlist-contract.md`
- `.codex/tasks/refund-audit-event-allowlist-contract.md`
- harness / ledger / queue 更新
