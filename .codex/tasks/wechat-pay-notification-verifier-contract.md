# wechat-pay-notification-verifier-contract

## 目标

新增微信支付 fake notify verifier 纯函数合同，为后续真实验签 / 解密实现提供稳定输入输出形状。

## 范围

- 新增 `verifyWechatPayNotificationContract()`。
- 只校验 fake raw notification 的必需 header、trusted fake serial、expected fake signature、timestamp tolerance 和 encrypted resource algorithm。
- 新增 focused unit tests。
- 将 focused test 纳入 payment notification harness。
- 更新 docs / ledger / queue。

## 非目标

- 不实现真实 RSA / SHA256 签名验签。
- 不实现 AES-GCM 解密。
- 不读取真实 app id、mch id、merchant private key、APIv3 key、平台证书、公钥或 token。
- 不接微信支付 SDK。
- 不新增 API route。
- 不接 checkout，不执行 payment workflow。
- 不写 inbox / event log，不连接 DB，不注册 migration。
- 不处理退款、对账、结算、佣金、打款、履约或物流。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/wechat-pay-notification-verifier.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

## 交付

- `packages/api/src/modules/china-payment-notification/wechat-pay-notification-verifier.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-notification-verifier.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `docs/wechat-pay-notification-verifier-contract.md`
- ledger / queue 更新
