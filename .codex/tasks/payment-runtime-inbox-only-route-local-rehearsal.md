# payment-runtime-inbox-only-route-local-rehearsal

## 目标

在现有 mock provider route 的 focused tests 中完成 local inbox-only rehearsal 保护性断言，证明 fake payload 只能进入本地 inbox-only 路径，不会暴露 checkout、workflow 或 payment/order state command。

## 范围

- 补充 `packages/api/src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts` 的本地演练断言。
- 覆盖 local DB host / port gate、signed payload、duplicate、missing / invalid signature 和 response redaction。
- 记录验证结果和后续边界。
- 更新 ledger / queue。

## 非目标

- 不修改 route runtime 实现。
- 不新增真实支付宝 / 微信支付 route。
- 不注册 Medusa payment provider。
- 不接支付宝 / 微信支付 SDK。
- 不读取真实 app id、mch id、merchant id、private key、公钥、证书、APIv3 key 或 token。
- 不接 checkout，不执行 payment workflow，不改变 payment/order state。
- 不连接外部 DB 或生产 DB，不注册生产 migration。
- 不处理退款、对账、结算、佣金、打款、分账、履约或物流。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
grep -RIn -e execute_workflow -e paymentStateCommand -e orderStateCommand -e checkout -e wechat_pay -e alipay packages/api/src/api/china/payment-webhooks packages/api/src/api/china/payment-providers packages/api/src/api/admin/china/mock-payment-webhooks || true
git diff --check
```

## 交付

- provider mock route focused tests
- `docs/payment-runtime-inbox-only-route-local-rehearsal.md`
- `.codex/tasks/payment-runtime-inbox-only-route-local-rehearsal.md`
- ledger / queue 更新
