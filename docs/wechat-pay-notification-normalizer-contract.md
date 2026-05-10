# WeChat Pay Notification Normalizer Contract

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增微信支付 fake notify normalizer 纯函数合同。

它不是生产解密实现，不接微信支付 SDK，不接 checkout，不写 inbox，不执行 payment workflow。

## 文件

- `packages/api/src/modules/china-payment-notification/wechat-pay-notification-normalizer.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-notification-normalizer.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## 合同内容

新增：

- `normalizeWechatPayNotificationContract()`。
- `WechatPayNotificationNormalizerContractInput`。
- `WechatPayNotificationNormalizerContractResult`。
- `WechatPayNotificationNormalizerFailureCode`。

当前 normalizer 只接受 fake-only verifier result 和 fake decrypted resource，并要求调用方显式传入：

- `expectedAppId`。
- `expectedMchId`。
- 可选 expected amount。

它校验：

- verification 必须是 `signatureStatus=verified` 且 `resourceStatus=accepted`。
- decrypted `appid` 匹配 expected fake app id。
- decrypted `mchid` 匹配 expected fake mch id。
- `trade_state=SUCCESS` 才映射为 `payment.succeeded`。
- `currency` / `payer_currency` 必须是 `CNY`。
- `total` / `payer_total` 必须一致。
- expected amount 必须匹配。
- `out_trade_no` 和 `transaction_id` 必须存在。

成功时输出标准 `ChinaPaymentNotificationEnvelope`：

- `provider=wechat_pay`。
- `eventType=payment.succeeded`。
- `merchantOrderRef=out_trade_no`。
- `providerTransactionId=transaction_id`。
- `amount.value` 使用分为单位的整数。
- `idempotencyKey=payment_notify:wechat_pay:<event_id>`。
- `signature.status=verified`。
- `riskFlags=[]`。

## 行为边界

本轮不做：

- AES-GCM 解密。
- 真实 RSA / SHA256 验签。
- official platform certificate / public key lookup。
- env secret 读取。
- SDK 调用。
- API route。
- checkout binding。
- payment workflow execution。
- inbox / event log 写入。
- DB / migration。
- refund、reconciliation、settlement、commission、payout、fulfillment 或 logistics runtime。

返回结果也不包含：

- `paymentUrl`。
- `qrCodeUrl`。
- `clientPayload`。
- executable workflow command。

## 验证

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/wechat-pay-notification-normalizer.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
find apps packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/links packages/api/medusa-config.ts -path "*/node_modules" -prune -o -type f -print 2>/dev/null | xargs grep -n "normalizeWechatPayNotificationContract" 2>/dev/null || true
git diff --check
```

结果：

```text
Focused normalizer unit test:
Test Suites: 1 passed, 1 total
Tests: 8 passed, 8 total

payment-notification-idempotency-harness.sh:
Test Suites: 28 passed, 28 total
Tests: 184 passed, 184 total
disposable DB dry-run created, rolled back, and cleaned up.

bunx tsc --noEmit -p tsconfig.json passed.
Runtime grep for normalizeWechatPayNotificationContract outside node_modules returned no output.
git diff --check passed.
```

## 下一步

推荐：

1. `alipay-notification-normalizer-contract`
2. `payment-provider-verifier-normalizer-validation`
3. `payment-runtime-inbox-only-route-gate`

后续仍不得读取真实 secret，不得接 SDK，不得接 checkout，不得执行 payment workflow。
