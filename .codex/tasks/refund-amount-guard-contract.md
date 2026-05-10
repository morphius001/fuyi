# refund-amount-guard-contract

## 目标

新增退款金额 guard 纯函数合同和 focused tests，校验金额、币种、支付状态、actor、ownership、reason 和幂等重放边界；输出始终 `executable: false`。

## 范围

- 新增 `refund-amount-guard.ts` 纯函数。
- 新增 focused unit tests。
- 导出合同 helper。
- 更新 docs / ledger / queue。

## 非目标

- 不新增 refund route。
- 不写 DB，不注册 migration。
- 不调用 Medusa refund workflow。
- 不接支付宝 / 微信支付 refund API。
- 不读取真实 secret。
- 不改变 order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-amount-guard.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
grep -RIn -e execute_workflow -e providerRefundRequest -e refundStateMutation -e createRefund -e refund_api packages/api/src/modules/china-payment-notification packages/api/src/api/china || true
git diff --check
```

## 交付

- `packages/api/src/modules/china-payment-notification/refund-amount-guard.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-amount-guard.unit.spec.ts`
- `docs/refund-amount-guard-contract.md`
- `.codex/tasks/refund-amount-guard-contract.md`
- ledger / queue 更新
