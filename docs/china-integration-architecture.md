# 中国本地化集成架构

日期：2026-05-02  
范围：支付、通知、聊天、短信、物流、搜索、对象存储/CDN、地址与结算边界

## 原则

- 中国本地化集成必须采用 provider 或 adapter 边界。
- 第一阶段先 mock，不接真实微信支付、支付宝、短信、IM、物流。
- 保留 Stripe、Algolia、Resend、TalkJS 路径。
- 不直接修改 Mercur core 或 Medusa core。
- 配置必须由环境变量驱动。
- 不写真实 app id、商户号、私钥、webhook token、短信凭据、IM 凭据、物流凭据。
- 支付成功以后端异步通知为准。
- 通知必须验签、幂等、可重试，并保留原始 provider event。

## 当前仓库集成状态

当前本地源码：

- 没有自定义 payment/refund/commission/payout/order split 实现。
- 没有已注册的本地 Chat/SMS/Logistics/Search/Storage runtime provider；Chat/SMS/Logistics 仅有未注册的 mock-only 边界用于测试和后续 adapter 设计。
- 没有真实 TalkJS、Resend、Algolia 运行时代码接入，但项目规则要求后续保留这些路径。
- `packages/api/src/api` 只有两个 custom route，均返回 200。
- `packages/api/src/api/middlewares.ts` 的 `routes` 为空。
- `packages/api/src/modules`、`workflows`、`subscribers`、`jobs`、`links` 当前只有 README。
- seed 使用默认 `pp_system_default` 和 Europe/EUR 示例数据。

## Provider 分层

建议把中国本地化 provider 分成以下层：

```text
UI layer
  Storefront / Admin / Vendor

API layer
  packages/api/src/api
  webhook routes
  admin/vendor/store custom routes

Workflow layer
  packages/api/src/workflows
  payment notification workflow
  refund workflow
  logistics event workflow

Module layer
  packages/api/src/modules
  china-payment
  china-notification
  china-logistics
  china-chat

Provider adapter layer
  mock providers
  wechat pay
  alipay
  sms adapters
  logistics adapters
  chat adapters

External services
  WeChat Pay
  Alipay
  SMS provider
  IM provider
  logistics provider
  object storage / CDN
```

当前已新增未注册的 Chat/SMS/Logistics mock provider 边界，位于：

```text
packages/api/src/modules/china-service-providers/
  types.ts
  utils.ts
  providers/mock-chat-provider.ts
  providers/mock-sms-provider.ts
  providers/mock-logistics-provider.ts
```

执行说明见 `docs/mock-service-providers.md`。该模块未加入 `packages/api/medusa-config.ts`，因此当前不改变运行时业务路径。

## Chat Provider

接口草案：

```ts
interface ChatProvider {
  createOrGetConversation(input: CreateConversationInput): Promise<{
    conversationId: string;
  }>;
  sendMessage(input: SendMessageInput): Promise<{
    messageId: string;
    status: "sent" | "failed";
    reason?: string;
  }>;
  listMessages(input: ListMessagesInput): Promise<{
    messages: ChatMessage[];
  }>;
  getUnreadCount(input: UnreadCountInput): Promise<{
    count: number;
  }>;
}
```

`MockChatProvider`：

- 生成稳定 mock conversation id。
- 生成稳定 mock message id。
- 模拟 unread count。
- 返回可审计错误码。
- 附件只保存 object key/reference。

TalkJS：

- 作为 ChatProvider 的一个 adapter 保留。
- 不被 mock provider 替代。
- 不在中国 IM PR 中删除。

## SMS Provider

接口草案：

```ts
interface SmsProvider {
  sendSms(input: SendSmsInput): Promise<{
    providerMessageId: string;
    status: "queued" | "sent" | "failed";
    reason?: string;
  }>;
  getDeliveryStatus(input: DeliveryStatusInput): Promise<{
    status: "queued" | "delivered" | "failed";
    reason?: string;
  }>;
}
```

`MockSmsProvider`：

- 模拟验证码短信。
- 模拟订单通知短信。
- 记录模板 id、业务场景、幂等键、脱敏手机号、失败原因。
- 不发送真实短信。

安全要求：

- 手机号脱敏。
- 幂等键。
- 频控。
- 模板审计。
- 营销短信需要退订和合规边界。

Resend：

- 继续归属 email notification channel。
- SMS provider 不替代 Resend。

## Logistics Provider

接口草案：

```ts
interface LogisticsProvider {
  createShipment(input: CreateShipmentInput): Promise<{
    shipmentId: string;
    trackingNo: string;
    carrierCode: string;
  }>;
  getTracking(input: TrackingInput): Promise<{
    events: TrackingEvent[];
  }>;
  cancelShipment(input: CancelShipmentInput): Promise<{
    canceled: boolean;
  }>;
}
```

`MockLogisticsProvider`：

- 对接 Medusa fulfillment 边界。
- 模拟顺丰、中通等 carrier code。
- 模拟轨迹节点。
- 模拟异常件和签收。
- 面单、签收证明、售后图片只返回 storage object key。

边界：

- 不直接改订单状态。
- 不直接改退款状态。
- 不直接改结算状态。
- 真实快递100、菜鸟等后续独立 PR。

## Search Provider

当前未发现 Algolia 接入代码，但项目规则要求保留 Algolia。

建议：

- 后续定义 SearchProvider 或索引策略。
- 商品、商家、类目、促销可进入搜索索引。
- 聊天、短信、物流原始内容默认不进入公网搜索索引。
- 中国搜索替代方案必须 additive，不删除 Algolia。

## Storage / CDN

用途：

- 商品图片。
- 聊天附件。
- 售后凭证。
- 物流面单。
- 签收证明。
- 对账文件。

边界：

- provider 返回 object key/reference。
- 签名 URL 由 storage/CDN adapter 生成。
- 不在 provider 中保存真实 CDN secret。
- 不返回长期公开 URL 给含手机号、地址、面单、售后凭证的资源。

## Payment Provider

建议 provider：

- `MockChinaPaymentProvider`
- `WeChatPayProvider`
- `AlipayProvider`

建议目录：

```text
packages/api/src/modules/china-payment/
  providers/mock-china-payment.ts
  providers/wechat-pay.ts
  providers/alipay.ts
  services/notification-idempotency.ts
  services/signature-verifier.ts
  services/reconciliation.ts
  models/china-payment-event.ts
  models/china-payment-reconciliation-record.ts
```

### MockChinaPaymentProvider

要求：

- identifier：`china_mock`
- `initiatePayment` 返回 pending。
- 返回 mock 二维码或跳转占位。
- 生成 provider order id。
- 只有后端 mock notify 通过幂等处理后，才允许进入成功动作。
- `refundPayment` 只生成 mock refund request/result。

### WeChatPayProvider

要求：

- identifier：`wechat_pay`
- 支持 JSAPI/H5/Native/App 预下单设计。
- 通知验签。
- 解密 resource。
- 校验 `out_trade_no`、金额、币种、商户号、交易状态。
- 退款通知验签解密。
- provider transaction id + refund id 做幂等。

第一轮不接真实商户号。

### AlipayProvider

要求：

- identifier：`alipay`
- 支持 web/wap/app trade create/page pay 设计。
- 通知验签。
- 校验 `app_id`、`seller_id`、`out_trade_no`、`total_amount`、`trade_status`。
- 退款以 `out_request_no` 做业务幂等。
- 保存 `trade_no`、`refund_fee`、失败原因。

第一轮不接真实 app id 或生产私钥。

## 支付通知幂等

建议事件表字段：

- `id`
- `provider`
- `provider_event_id`
- `provider_transaction_id`
- `merchant_order_no`
- `event_type`
- `raw_payload`
- `signature_valid`
- `idempotency_key`
- `processing_status`
- `processed_at`
- `retry_count`
- `last_error`
- `created_at`
- `updated_at`

处理流程：

1. 接收 provider notify。
2. 记录原始事件。
3. 验签。
4. 构造幂等键。
5. 如果已处理，直接返回 provider 期望的成功响应。
6. 校验金额、币种、订单号、商户号。
7. 调用 Medusa/Mercur payment workflow。
8. 保存处理结果。
9. 失败时保存错误并允许重试。

## Refund

退款要求：

- 保存 refund request。
- 保存 provider refund id。
- 保存 provider transaction id。
- 支持退款通知。
- 支持重复退款通知幂等。
- 保存失败原因。
- 不提前释放佣金或结算。

退款是高风险串行 PR，必须在支付通知幂等稳定后推进。

## Reconciliation

对账要求：

- 保存原始账单行。
- 匹配 provider transaction id。
- 匹配商户订单号。
- 匹配金额、手续费、退款、结算日期。
- 标记差异。
- 不自动改订单或结算金额。

## Settlement / Payout / Commission

结算前置条件：

- 支付稳定。
- 退款稳定。
- 对账稳定。
- 佣金规则明确。
- 商家权限明确。

风险：

- 一笔 payment collection 可能关联多个 seller order。
- capture 金额可能涉及分摊。
- 优惠、运费、部分退款、售后赔付会影响 seller payable。
- 商家只能看到自己的结算和 payout。

## 地址与物流关系

地址 provider 边界：

- 地址仍以 Medusa 标准字段为主。
- 区县/街道先用 `address_2` 或 `metadata` 过渡。
- 物流 provider 不应依赖未评审的新增字段。
- 如果需要独立持久化区县/街道，必须单独 migration PR。

## 验证矩阵

基础：

- `bun run lint`
- `bun run check-types`
- `bun run build`

API：

- `bun --cwd packages/api run test:unit`
- `bun --cwd packages/api run test:integration:http`
- 涉及模块时运行 integration modules 测试。

Payment：

- 有效签名。
- 无效签名。
- 重复通知。
- 乱序通知。
- 金额不一致。
- 未知订单号。
- pending/success/failure mock flow。

Refund：

- 全额退款。
- 部分退款。
- 重复退款通知。
- 退款失败。
- 退款后佣金/结算不可提前释放。

Logistics：

- 创建 mock shipment。
- 查询 mock tracking。
- 异常件。
- 签收。
- 不改订单/退款/结算状态。

Chat/SMS：

- 成功发送。
- 失败发送。
- 重复幂等。
- 手机号脱敏。
- 错误映射。

UI：

- Admin 桌面和移动。
- Vendor 桌面和移动。
- Storefront 存在后检查首页、搜索、类目、商品详情、购物车、结账、移动端粘性购买。
