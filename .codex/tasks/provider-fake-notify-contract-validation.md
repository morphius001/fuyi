# provider-fake-notify-contract-validation

## 目标

汇总支付 Provider fake notify 阶段的合同和验证结果，确认后续只能进入 verifier / normalizer 纯函数合同，不能直接接 SDK、checkout 或 payment workflow。

## 范围

- 汇总 WeChat Pay / Alipay fake notify test plan 和 fake-only fixture PR。
- 记录当前 harness、API typecheck、runtime registration grep 和 diff check 结果。
- 固化后续 verifier / normalizer 的安全边界。
- 更新 ledger / queue。

## 非目标

- 不新增或修改 runtime。
- 不实现 canonicalization helper、verifier、decryptor 或 normalizer。
- 不新增 API route。
- 不接支付宝 / 微信支付 SDK。
- 不读取真实 app id、mch id、merchant id、private key、公钥、证书、APIv3 key 或 token。
- 不接 checkout，不执行 payment workflow。
- 不写 inbox / event log，不连接 DB，不注册 migration。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
grep -RIn "china-payment-notification" packages/api/medusa-config.ts || true
grep -RIn "createDisabled.*ProviderAdapter" packages/api/src/api packages/api/medusa-config.ts || true
git diff --check
```

## 交付

- `docs/provider-fake-notify-contract-validation.md`
- `.codex/tasks/provider-fake-notify-contract-validation.md`
- ledger / queue 更新
