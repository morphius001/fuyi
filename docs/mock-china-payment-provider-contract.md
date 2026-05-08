# Mock China PaymentProvider Contract

更新时间：2026-05-08 14:05 Asia/Shanghai

## 目标

新增未注册 Mock China PaymentProvider contract，用于后续支付宝/微信支付接入前的 adapter 合同评审。

本轮只新增纯函数和单元测试：

- `createPayment`
- `queryPayment`
- `closePayment`
- `verifyNotification`
- `normalizeNotification`

## 文件

- `packages/api/src/modules/china-payment-notification/mock-china-payment-provider.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/mock-china-payment-provider.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## 安全边界

本轮没有：

- 注册 Medusa payment provider。
- 修改 `packages/api/medusa-config.ts`。
- 接 checkout runtime。
- 连接数据库。
- 调用 payment workflow。
- 接支付宝或微信支付。
- 写真实密钥、商户号、证书或 webhook token。
- 改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 合同行为

`createPayment` 只返回 deterministic mock result：

- `providerPaymentId`
- `mock://` payment URL。
- `mock://` QR code URL。
- `rawPayloadDigest`
- 脱敏 client payload。

`queryPayment` 固定返回 `pending`，不推进状态。

`closePayment` 只返回 contract result，不关闭真实订单或支付。

`verifyNotification` 和 `normalizeNotification` 复用现有 mock signature / normalizer。

## 验证

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 下一步

下一步可以做 `mock-payment-provider-registry-contract`：

- 仍保持纯函数。
- 默认 production disabled。
- 不读取真实密钥。
- 不接 checkout runtime。
- 不执行 payment workflow。
