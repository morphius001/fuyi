# Mock 服务 Provider 边界设计

日期：2026-05-03
范围：本地生鲜供应链平台的客服、短信、物流、直播、AI 快速上架 mock provider 设计

## 目标

本文件定义中国大陆本地化第一阶段的 mock-only provider / adapter 边界，用于后续分 PR 实现和替换真实服务。第一阶段只允许 mock、占位、审计字段和接口合同设计，不接入真实腾讯 IM、环信、阿里云短信、腾讯短信、快递100、菜鸟、顺丰、京东物流、真实直播、真实 AI 服务。

这些 provider 面向本地生鲜供应链场景，包括消费者下单咨询、商户客服、市场/档口直播、本地配送、冷链配送、快递打印、以及商户通过一句话、语音或拍照生成商品草稿。所有 mock 输出都不得作为真实支付、履约、发货、库存扣减、退款、结算、佣金或权限判断依据。

## 设计原则

- 保留 Stripe、Algolia、Resend、TalkJS 既有路径，任何中国本地替代 provider 都必须是 additive、switchable、adapter-based。
- mock provider 默认未注册到生产运行时，不自动改写 Medusa / Mercur core。
- 配置由环境变量或模块配置驱动，但文档和代码不得包含真实应用编号、商户号、服务密钥、生产凭证、私钥、短信签名、物流月结号、直播推流密钥或 AI 服务凭据。
- provider 返回的是 mock id、object key、reference、状态说明和错误映射，不直接写订单、履约、库存、退款、结算、佣金、权限状态。
- 所有后续真实 provider 都必须补充签名校验、回调验签、幂等、重试、错误映射、审计字段和运营可见失败原因。
- mock 数据必须在 UI 和 API 响应中标明来源，例如 `source: "mock"`、`isMock: true` 或页面说明，不能伪装成真实外部服务结果。

## 建议模块边界

建议保留一个未注册的本地服务模块，按能力拆 provider 合同：

```text
packages/api/src/modules/china-service-providers/
  types.ts
  utils.ts
  providers/mock-chat-provider.ts
  providers/mock-sms-provider.ts
  providers/mock-logistics-provider.ts
  providers/mock-live-provider.ts
  providers/mock-ai-listing-provider.ts
```

当前 skeleton baseline 已创建上述 mock-only 类型和内存 provider，但保持未注册。后续 skeleton PR 或真实 provider PR 仍不得把这些 provider 接入 `packages/api/medusa-config.ts`，除非有单独任务明确要求接入 mock 运行时。

## 通用合同字段

所有 provider input 建议包含：

- `platformId`：平台或 marketplace 标识。
- `marketId`：批发市场、农贸市场、园区或区域站点标识。
- `vendorId`：商户、档口或供应商标识。
- `actorId` / `actorRole`：操作者与角色，例如 platform operator、vendor staff、consumer、support agent。
- `businessKey`：业务引用，例如咨询单、商品草稿、直播场次、配送预览。
- `idempotencyKey`：可重试动作必须提供。
- `traceId`：审计和排障链路。
- `mockScenario`：成功、失败、超时、频控、审核拒绝、异常件等模拟场景。

所有 provider output 建议包含：

- `provider`：例如 `mock_chat`、`mock_sms`、`mock_logistics`。
- `source: "mock"`。
- `status`：mock 状态，不映射为真实履约状态。
- `providerReference`：稳定 mock reference，不能冒充真实外部单号。
- `audit`：请求时间、操作者、场景、脱敏摘要、失败原因。
- `warnings`：说明 mock 结果不可作为真实履约、支付或库存依据。

## MockChatProvider

用途：

- 消费者与商户客服会话。
- 商户与平台客服会话。
- 直播间咨询占位。
- 售后、投诉、敏感词拦截的占位设计。

建议能力：

- `createOrGetConversation(input)`：按 `platformId + marketId + vendorId + participantRefs + contextKey` 返回稳定 mock 会话 id。
- `sendMessage(input)`：保存或返回 mock 消息结果，支持文本、图片 object key、售后凭证 object key；不上传真实附件。
- `listMessages(input)`：返回 mock 消息列表，用于 UI 骨架和空状态验证。
- `getUnreadCount(input)`：返回 mock 未读数，不写真实用户状态。
- `markRead(input)`：只返回 mock read receipt，不作为真实客服 SLA 依据。
- `screenContent(input)`：返回敏感词、投诉、违规占位结果，不接真实内容安全服务。
- `createComplaintPlaceholder(input)`：记录投诉占位 reference，不触发真实工单、处罚或退款。

边界：

- 不接腾讯 IM、环信、TalkJS 真实运行时。
- TalkJS 后续可作为 `ChatProvider` adapter 保留，不被 mock 删除。
- 不改变订单归属、售后状态、退款状态、商户权限。
- 聊天附件只使用 storage object key/reference，不返回长期公开 URL。
- 敏感词和投诉 mock 只给运营流程设计用，不作为处罚依据。

错误映射：

- `CHAT_PROVIDER_UNAVAILABLE`
- `CHAT_RATE_LIMITED`
- `CHAT_CONTENT_REVIEW_PENDING`
- `CHAT_CONTENT_REJECTED_MOCK`
- `CHAT_CONVERSATION_NOT_FOUND`

## MockSmsProvider

用途：

- 手机验证码占位。
- 订单、售后、配送、直播提醒等通知占位。
- 模板、发送记录、频率限制和失败模拟设计。

建议能力：

- `sendVerificationCode(input)`：生成 mock 验证码发送记录，不返回真实验证码给外部用户界面。
- `sendTemplateMessage(input)`：按模板 id 和变量生成 mock 短信记录。
- `getSendRecord(input)`：查询 mock 发送记录。
- `simulateDeliveryStatus(input)`：返回 queued、sent、failed、rate_limited 等 mock 状态。
- `checkRateLimit(input)`：按手机号、场景、商户、IP 或 actor 模拟频控。

模板场景：

- 登录/注册验证码。
- 商户入驻审核通知。
- 订单创建、备货、配送提醒。
- 冷链异常、到货提醒。
- 售后进度提醒。
- 直播开播提醒。

边界：

- 不接阿里云短信、腾讯短信或任何真实短信通道。
- Resend 继续作为 email channel 保留，SMS provider 不替代 Resend。
- 手机号存储优先 E.164，审计展示必须脱敏。
- mock 发送成功不能作为用户已验证、订单已通知或履约已完成依据。
- 营销短信只做合规占位，真实接入前必须设计退订、授权和审计。

错误映射：

- `SMS_PROVIDER_UNAVAILABLE`
- `SMS_TEMPLATE_NOT_FOUND`
- `SMS_RATE_LIMITED`
- `SMS_MOBILE_INVALID`
- `SMS_DELIVERY_FAILED_MOCK`

## MockLogisticsProvider

用途：

- 本地配送和同城骑手配送占位。
- 冷链配送占位。
- 快递打印、电子面单、运单预览。
- 物流轨迹、异常件、补打、作废占位。

建议能力：

- `previewShipment(input)`：生成运费、时效、冷链要求、配送范围的 mock 预览，不锁库存、不改订单。
- `createMockShipment(input)`：生成 mock shipment reference；不生成真实运单号。
- `createWaybillPreview(input)`：返回电子面单预览 object key/reference，不调用真实面单接口。
- `reprintWaybill(input)`：返回补打占位记录，不触发真实打印。
- `voidWaybill(input)`：返回作废占位记录，不影响真实承运商。
- `getTracking(input)`：返回 mock 轨迹节点，如已创建、待揽收、运输中、冷链温控正常、派送中、签收占位。
- `simulateException(input)`：返回延迟、温控异常、地址不详、拒收、破损等 mock 异常。

本地生鲜字段：

- `deliveryMode`：local_delivery、cold_chain、express、market_pickup。
- `temperatureBand`：ambient、chilled、frozen。
- `freshnessWindow`：建议送达时段。
- `pickupMarket` / `stallNo`：市场与档口。
- `packageSpec`：泡沫箱、冰袋、周转筐等包装占位。

边界：

- 不接快递100、菜鸟、顺丰、京东物流或真实骑手平台。
- 不生成真实运单号；mock tracking no 必须带明显前缀，例如 `MOCK-LOG-`。
- 不直接修改订单、履约、库存、售后、退款、结算或支付状态。
- 面单、签收证明、异常照片只返回 object key/reference。
- 物流异常 mock 只能驱动 UI/运营演示，不能自动退款、扣款或处罚商户。

错误映射：

- `LOGISTICS_PROVIDER_UNAVAILABLE`
- `LOGISTICS_OUT_OF_RANGE_MOCK`
- `LOGISTICS_COLD_CHAIN_UNAVAILABLE_MOCK`
- `LOGISTICS_WAYBILL_PREVIEW_FAILED`
- `LOGISTICS_TRACKING_EXCEPTION_MOCK`

## MockLiveProvider

用途：

- 市场直播、店铺/档口直播、今日鲜货直播。
- 直播回放、审核、违规、投诉占位。
- 直播间咨询与商品讲解的流程设计。

建议能力：

- `createLiveSession(input)`：创建 mock 直播场次，绑定 market、vendor、stall、商品草稿或商品 reference。
- `startLivePreview(input)`：返回 mock 推流/播放占位，不返回真实推流地址。
- `endLiveSession(input)`：结束 mock 场次，不结算、不分佣。
- `listLiveSessions(input)`：按市场、商户、状态查询 mock 场次。
- `createReplayPlaceholder(input)`：生成回放占位 object key/reference，不处理真实视频。
- `reviewLiveContent(input)`：返回审核通过、待审、拒绝的 mock 结果。
- `reportLiveViolation(input)`：生成违规/投诉占位 reference。
- `getLiveConsultationLink(input)`：返回直播咨询会话占位，可与 `MockChatProvider` 的 contextKey 对齐。

边界：

- 不接真实推流、CDN、IM、内容安全、支付、打赏或带货交易服务。
- 不通过直播状态改变商品上下架、库存、订单、支付、结算、佣金或权限。
- 回放只做 object key/reference 占位，不生成长期公开 URL。
- 违规和投诉 mock 不触发真实处罚、限流、封禁或退款。

错误映射：

- `LIVE_PROVIDER_UNAVAILABLE`
- `LIVE_REVIEW_PENDING_MOCK`
- `LIVE_REVIEW_REJECTED_MOCK`
- `LIVE_STREAM_NOT_AVAILABLE_MOCK`
- `LIVE_VIOLATION_REPORTED_MOCK`

## MockAiListingProvider

用途：

- 商户一句话上架。
- 商户语音上架占位。
- 拍照识别生鲜商品占位。
- 输出商品草稿，辅助商户补全标题、类目、规格、产地、保鲜要求、建议价格文案。

建议能力：

- `createListingDraftFromText(input)`：根据一句话描述返回商品草稿。
- `createListingDraftFromVoice(input)`：根据语音 object key/reference 返回商品草稿；不调用真实语音识别。
- `createListingDraftFromImage(input)`：根据图片 object key/reference 返回商品草稿；不调用真实视觉模型。
- `suggestCategoryAndAttributes(input)`：返回 mock 类目、规格、产地、温层、保质期建议。
- `validateDraftForReview(input)`：返回缺失字段、风险词、价格异常提示。
- `submitDraftForMerchantConfirmation(input)`：只进入商户确认态，不正式上架。

草稿字段建议：

- 商品名称、类目、产地、品牌/档口、规格、单位、起订量。
- 温层、保鲜期、包装方式、库存展示文案。
- 建议价格文案、促销文案、主图 object key。
- 风险提示：称重误差、预售、冷链要求、不可售区域。

硬性边界：

- AI 输出必须是 `draft`，必须由商户确认后才能进入后续商品创建/更新流程。
- mock AI 不允许直接正式上架、不扣库存、不改价格、不改商品发布状态。
- 不接真实大模型、语音识别、OCR、图片识别或内容安全服务。
- 不把 mock 识别结果当作食品安全、产地证明、合规审核或平台处罚依据。

错误映射：

- `AI_LISTING_PROVIDER_UNAVAILABLE`
- `AI_LISTING_INPUT_UNSUPPORTED`
- `AI_LISTING_REVIEW_REQUIRED`
- `AI_LISTING_LOW_CONFIDENCE_MOCK`
- `AI_LISTING_POLICY_WARNING_MOCK`

## Feature / Module Switch 设计

能力开关应按平台、市场、角色逐层判断，避免一个全局变量打开所有高风险入口。

建议配置维度：

- 平台：`platformId`，用于灰度启用本地化 provider。
- 市场：`marketId`，用于只给特定批发市场、农贸市场或区域站点启用。
- 商户：`vendorId`，用于白名单试点。
- 角色：platform operator、market operator、vendor admin、vendor staff、support agent、consumer。
- 能力：chat、sms、logistics、live、ai_listing。
- provider：mock、disabled、future_real_provider。

示例环境变量仅作为命名建议，不能携带真实凭据：

```text
CHINA_CHAT_PROVIDER=mock
CHINA_SMS_PROVIDER=mock
CHINA_LOGISTICS_PROVIDER=mock
CHINA_LIVE_PROVIDER=mock
CHINA_AI_LISTING_PROVIDER=mock
CHINA_FEATURE_CHAT_ENABLED_MARKETS=market_demo
CHINA_FEATURE_LIVE_ENABLED_ROLES=platform_operator,vendor_admin
CHINA_FEATURE_AI_LISTING_REQUIRES_VENDOR_CONFIRMATION=true
```

运行时策略：

- 默认 `disabled`，显式启用 mock。
- UI 只展示当前角色和市场允许的入口。
- API 层再次校验能力开关，不能只依赖前端隐藏。
- 高风险动作即使 mock 开启，也不能触发真实订单、发货、库存、退款、结算、佣金或权限变更。

## 安全与审计边界

- 不写真实密钥、签名、生产凭证、商户号、物流月结号、直播推流密钥或 AI provider key。
- 不把 mock 状态当真实履约、真实通知、真实支付、真实发货或真实审核依据。
- 不修改订单、发货、库存、退款、结算、佣金、权限逻辑。
- 所有手机号、地址、面单、聊天附件、售后凭证、直播回放 object key 在审计和 UI 中需要脱敏或最小化展示。
- provider event 应保留 `source`、`provider`、`businessKey`、`idempotencyKey`、`traceId`、`actorId`、`createdAt`、`failureReason`。
- 真实 provider 接入前必须增加签名校验、回调验签、幂等表、重试策略、死信/补偿策略、运营可见错误码。

## 真实 Provider 替换策略

推荐替换顺序：

1. 先定义稳定 provider interface 和 mock 单元测试，保持未注册或仅在 dev/mock 环境注册。
2. 增加 provider selector 和配置校验，默认 disabled。
3. 为真实 provider 建立单独 adapter，不删除 mock provider。
4. 对真实 provider 增加签名、回调、幂等、重试、错误映射、审计持久化。
5. 先在 sandbox / test credential 环境手动验证，再按平台、市场、商户、角色灰度。
6. 通过 feature flag 回滚到 mock 或 disabled。

每类 provider 的真实替换重点：

- Chat：IM 用户映射、会话权限、附件安全、敏感词/投诉回调、客服 SLA 审计。
- SMS：签名与模板审核、频控、退订、发送回执、手机号脱敏、失败重试。
- Logistics：电子面单签名、真实运单号、轨迹 webhook、异常件、补打/作废、冷链温控证据。
- Live：推流鉴权、播放鉴权、回放存储、内容审核、投诉处置、直播间 IM 隔离。
- AI Listing：模型输入脱敏、图片/语音 object key 权限、草稿审核、商户确认、内容安全。

## 验证步骤

文档 PR：

```bash
git diff -- docs/mock-service-providers.md
git status --short --branch
```

如后续添加 skeleton：

```bash
bun run check-types
bun run lint
```

人工核验：

- 确认没有新增真实服务 SDK、真实 endpoint 或真实凭据。
- 确认没有修改 `packages/api/medusa-config.ts` 注册真实 provider。
- 确认没有修改支付、订单、退款、结算、佣金、权限逻辑。
- 确认 mock 物流不生成真实运单号。
- 确认 AI 快速上架只产生商品草稿，必须商户确认。
- 确认直播不接真实推流、IM、支付或打赏能力。

## 后续 PR 顺序建议

1. Provider interface 文档与类型 skeleton：只新增未注册接口、通用错误码、mock 工具函数。
2. Chat/SMS mock skeleton：覆盖客服会话、未读数、模板短信、频控和失败模拟。
3. Logistics mock skeleton：覆盖本地配送、冷链、面单预览、轨迹、异常、补打/作废占位。
4. Live mock skeleton：覆盖市场/档口/今日鲜货直播、回放、审核、违规/投诉占位。
5. AI Listing mock skeleton：覆盖文本/语音/图片生成商品草稿和商户确认门槛。
6. Feature/module switch PR：按平台、市场、商户、角色启用 mock 能力，默认 disabled。
7. 真实 provider 预研 PR：只做签名、回调、幂等、重试、审计设计，不接生产服务。
