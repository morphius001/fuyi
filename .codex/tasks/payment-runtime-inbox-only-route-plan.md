# payment-runtime-inbox-only-route-plan

## 目标

规划下一步 mock payment runtime inbox-only route local rehearsal，明确只在现有 mock provider route / local disposable DB 边界内演练通知入 inbox，不接真实支付宝 / 微信支付、checkout 或 payment workflow。

## 范围

- 盘点现有 mock route gate、local DB gate、provider registry gate 和 response contract。
- 定义下一步 local rehearsal 的允许文件、环境变量、测试矩阵和回滚方式。
- 固化 Go / No-Go，确保 rehearsal 只验证 mock payload -> inbox -> duplicate / rejected response。
- 更新 ledger / queue。

## 非目标

- 不新增真实支付宝 / 微信支付 route。
- 不注册 Medusa payment provider。
- 不接支付宝 / 微信支付 SDK。
- 不读取真实 app id、mch id、merchant id、private key、公钥、证书、APIv3 key 或 token。
- 不接 checkout，不执行 payment workflow，不改变 payment/order state。
- 不连接外部 DB 或生产 DB，不注册生产 migration。
- 不处理退款、对账、结算、佣金、打款、分账、履约或物流。

## 验证

```bash
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

- `docs/payment-runtime-inbox-only-route-plan.md`
- `.codex/tasks/payment-runtime-inbox-only-route-plan.md`
- ledger / queue 更新
