# refund-request-idempotency-contract

## 目标

新增退款请求幂等 key 纯函数合同和 focused tests，区分 local command idempotency 和 provider refund request idempotency；不实现 runtime。

## 范围

- 扩展 `idempotency.ts`，新增退款 local command key 和 provider refund request key builder。
- 新增 focused unit tests。
- 将测试加入 payment notification harness。
- 更新 docs / ledger / queue。

## 非目标

- 不新增 refund route。
- 不写 DB，不注册 migration。
- 不调用 Medusa refund workflow。
- 不接支付宝 / 微信支付 refund API。
- 不读取真实 secret。
- 不输出 refund success。
- 不改变 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-request-idempotency.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
grep -RIn -e refund_req -e refund_cmd -e providerRefundRequest -e refundStateMutation -e createRefund packages/api/src/modules/china-payment-notification packages/api/src/api/china || true
git diff --check
```

## 交付

- `packages/api/src/modules/china-payment-notification/idempotency.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-request-idempotency.unit.spec.ts`
- `docs/refund-request-idempotency-contract.md`
- `.codex/tasks/refund-request-idempotency-contract.md`
- harness / ledger / queue 更新
