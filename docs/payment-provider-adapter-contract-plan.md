# Payment Provider Adapter Contract Plan

更新时间：2026-05-08 13:45 Asia/Shanghai

## 目标

为中国本地支付接入定义 Provider / Adapter 合同。此文档只规划边界，不实现真实支付宝或微信支付。

当前支付通知链路已经具备：

- mock notification payload / signature skeleton。
- inbox / event log migration skeleton。
- local disposable DB dry-run。
- neutral mock webhook route local-only smoke。
- runtime gate contract。
- preprod disposable DB script skeleton。

但真实支付 Provider 仍没有接入，也不应在没有合同和预发验证前直接接入。

## 分层原则

```text
Medusa payment provider boundary
  -> ChinaPaymentProvider facade
    -> ProviderAdapter interface
      -> MockChinaPayAdapter
      -> AlipayAdapter
      -> WeChatPayAdapter
  -> PaymentNotificationNormalizer
  -> PaymentNotificationInbox
  -> StateGuard
  -> WorkflowCommandMapper
```

第一阶段只允许 mock adapter。支付宝和微信支付 adapter 必须等 mock adapter、preprod disposable DB 和 runtime gate 都通过后再拆 PR。

## ProviderAdapter 合同

未来 adapter 建议暴露以下能力：

```ts
type CreatePaymentInput = {
  merchantOrderRef: string
  amountValue: number
  currency: "CNY"
  subject: string
  notifyUrl: string
  returnUrl?: string
  clientIp?: string
  metadata?: Record<string, unknown>
}

type CreatePaymentResult = {
  provider: "mock_china_pay" | "alipay" | "wechat_pay"
  providerPaymentId: string
  providerTransactionId?: string
  paymentUrl?: string
  qrCodeUrl?: string
  clientPayload?: Record<string, unknown>
  expiresAt?: string
  rawPayloadDigest: string
}

type ProviderAdapter = {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>
  queryPayment(input: QueryPaymentInput): Promise<QueryPaymentResult>
  closePayment(input: ClosePaymentInput): Promise<ClosePaymentResult>
  normalizeNotification(input: RawNotificationInput): Promise<NormalizedPaymentNotification>
  verifyNotification(input: RawNotificationInput): Promise<SignatureVerificationResult>
}
```

退款、对账和结算不应塞进第一版支付 adapter。它们后续需要单独 serial PR：

- refund adapter。
- reconciliation adapter。
- merchant settlement / payout adapter。

## Notify URL 与 Return URL

支付成功必须以后端异步通知为准。

- `notifyUrl`: provider server-to-server callback，是支付状态推进的唯一候选入口。
- `returnUrl`: 前端跳转地址，只能展示 pending / waiting confirmation，不得改变支付状态。

Provider adapter 不得让前端 return URL 直接触发支付成功。

## 验签规则

每个真实 adapter 必须实现：

- provider 原始报文 canonicalization。
- signature algorithm mapping。
- platform public key / certificate loading。
- timestamp / nonce / event id 校验。
- signature failure reason。
- raw payload digest。

日志不得输出：

- private key。
- provider secret。
- raw payload。
- signature。
- full certificate content。
- full DB URL。

## 幂等规则

所有 provider notification 归一化后必须产生稳定 idempotency key：

```text
payment_notify:<provider>:<event_id>
```

如果 provider 没有稳定 event id，使用：

```text
payment_notify:<provider>:<merchant_order_ref>:<provider_transaction_id>
```

不得使用随机 UUID 作为幂等主键。

## 错误映射

Adapter 只能输出受控错误码：

- `SIGNATURE_INVALID`
- `PAYLOAD_INVALID`
- `PROVIDER_MISMATCH`
- `AMOUNT_MISMATCH`
- `CURRENCY_UNSUPPORTED`
- `ORDER_REFERENCE_MISSING`
- `PROVIDER_TIMEOUT`
- `PROVIDER_RATE_LIMITED`
- `PROVIDER_UNAVAILABLE`
- `CONFIG_MISSING`

未知 provider error 必须映射到 `PROVIDER_UNAVAILABLE` 或 `PAYLOAD_INVALID`，并保存脱敏后的 provider code。

## 配置与密钥

真实 adapter 配置必须来自环境或 secret manager，不得写入仓库：

- provider enabled flag。
- app id。
- merchant id。
- private key reference。
- public key / certificate reference。
- notify URL base。
- return URL base。
- sandbox / production mode。

本地和预发环境可以使用 mock config，但变量名必须明显：

```text
CHINA_PAYMENT_PROVIDER=mock_china_pay
CHINA_PAYMENT_RUNTIME_MODE=mock_inbox_only
```

不得把 mock secret 当生产密钥。

## 后续 PR 拆分

### PR 1: Mock China PaymentProvider Contract

- 实现未注册 mock provider contract。
- 不接 checkout runtime。
- 不调用 workflow。
- 单测覆盖 create / query / close / notify normalize / verify。

### PR 2: Provider Adapter Registry Skeleton

- 实现 adapter registry 纯函数。
- 默认只返回 mock adapter。
- production 默认 disabled。
- 不读取真实密钥。

### PR 3: Mock PaymentProvider Runtime Dry Run

- 只在 local / preprod disposable DB gate 下启用。
- 仍不执行 payment workflow。
- 输出 command prepared / audit-only。

### PR 4: Alipay Adapter Design And Test Vectors

- docs + fake test vectors。
- 不接真实支付宝。
- 不写真实 app id / merchant id / key。

### PR 5: WeChat Pay Adapter Design And Test Vectors

- docs + fake test vectors。
- 不接真实微信支付。
- 不写真实 mch id / app id / cert / key。

### PR 6: Real Provider Sandbox Gate

- 必须有 disposable preprod DB。
- 必须有 secret manager。
- 必须不执行真实订单状态推进。

## Go / No-Go

Go:

- Mock adapter 单测通过。
- Runtime gate 默认 blocked。
- Preprod disposable DB 验证通过。
- 密钥加载路径不打印密钥。
- notify URL 验签、幂等、重试、审计全部具备。

No-Go:

- 需要真实商户号或密钥写入仓库。
- 需要前端 return URL 作为支付成功依据。
- 需要跳过 inbox 或 state guard。
- 需要直接执行 payment workflow。
- 需要退款、对账、结算、佣金或权限同时混入。

## 当前结论

下一步可以做 `mock-china-payment-provider-contract`，但仍必须保持未注册、mock-only、不接 checkout runtime、不执行 payment workflow。
