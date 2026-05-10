# payment-provider-verifier-normalizer-validation

## 目标

汇总支付宝 / 微信支付 fake-only verifier + normalizer 合同阶段，确认下一步是否允许进入 runtime inbox-only route gate。

## 范围

- 汇总 WeChat Pay / Alipay verifier contract。
- 汇总 WeChat Pay / Alipay normalizer contract。
- 记录 focused tests、payment harness、API typecheck、runtime grep 和 diff check。
- 固化 runtime gate 前的 No-Go 条件。
- 更新 ledger / queue。

## 非目标

- 不新增或修改 runtime。
- 不新增 API route。
- 不注册 Provider。
- 不接支付宝 / 微信支付 SDK。
- 不读取真实 app id、mch id、merchant id、private key、公钥、证书、APIv3 key 或 token。
- 不接 checkout，不执行 payment workflow。
- 不写 inbox / event log，不连接 DB，不注册 migration。
- 不处理退款、对账、结算、佣金、打款、履约或物流。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
find apps packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/links packages/api/medusa-config.ts -path "*/node_modules" -prune -o -type f -print 2>/dev/null | xargs grep -n "NotificationContract" 2>/dev/null || true
git diff --check
```

## 交付

- `docs/payment-provider-verifier-normalizer-validation.md`
- `.codex/tasks/payment-provider-verifier-normalizer-validation.md`
- ledger / queue 更新
