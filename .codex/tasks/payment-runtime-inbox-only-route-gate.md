# payment-runtime-inbox-only-route-gate

## 目标

审计并固化 payment runtime inbox-only route gate，确认现有 mock route 仍默认关闭、只允许 mock/local DB/inbox-only rehearsal，不能接真实支付宝 / 微信支付、checkout 或 workflow。

## 范围

- 审计现有 mock payment webhook / provider route gate。
- 汇总 route unit tests、payment harness、API typecheck、runtime grep 和 diff check。
- 记录进入下一步 inbox-only route plan / rehearsal 的 Go / No-Go。
- 更新 ledger / queue。

## 非目标

- 不新增 runtime route。
- 不注册 Medusa payment provider。
- 不接支付宝 / 微信支付 SDK。
- 不读取真实 app id、mch id、merchant id、private key、公钥、证书、APIv3 key 或 token。
- 不接 checkout，不执行 payment workflow。
- 不写新的 inbox / event log runtime，不连接外部 DB，不注册 migration。
- 不处理退款、对账、结算、佣金、打款、履约或物流。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
grep -RIn "execute_workflow\\|paymentStateCommand\\|orderStateCommand\\|checkout\\|wechat_pay\\|alipay" packages/api/src/api/china/payment-webhooks packages/api/src/api/china/payment-providers packages/api/src/api/admin/china/mock-payment-webhooks || true
git diff --check
```

## 交付

- `docs/payment-runtime-inbox-only-route-gate.md`
- `.codex/tasks/payment-runtime-inbox-only-route-gate.md`
- ledger / queue 更新
