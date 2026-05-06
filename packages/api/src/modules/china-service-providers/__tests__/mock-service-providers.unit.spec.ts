import {
  MockAiListingProvider,
  MockChatProvider,
  MockLiveProvider,
  MockLogisticsProvider,
  MockSmsProvider,
} from "..";

describe("mock China service providers", () => {
  it("creates stable chat conversations and replays idempotent messages", async () => {
    const provider = new MockChatProvider();
    const conversation = await provider.createOrGetConversation({
      contextKey: "order:order_123",
      participants: [
        { id: "cus_1", type: "customer" },
        { id: "seller_1", type: "seller" },
      ],
    });
    const replayedConversation = await provider.createOrGetConversation({
      contextKey: "order:order_123",
      participants: [
        { id: "seller_1", type: "seller" },
        { id: "cus_1", type: "customer" },
      ],
    });

    expect(replayedConversation).toEqual({
      conversationId: conversation.conversationId,
      replayed: true,
    });

    const sent = await provider.sendMessage({
      conversationId: conversation.conversationId,
      senderId: "cus_1",
      body: "hello",
      idempotencyKey: "chat-msg-1",
    });
    const replayed = await provider.sendMessage({
      conversationId: conversation.conversationId,
      senderId: "cus_1",
      body: "hello",
      idempotencyKey: "chat-msg-1",
    });
    const unread = await provider.getUnreadCount({
      conversationId: conversation.conversationId,
      participantId: "seller_1",
    });
    const messages = await provider.listMessages({
      conversationId: conversation.conversationId,
    });

    expect(sent.status).toBe("sent");
    expect(replayed).toMatchObject({
      messageId: sent.messageId,
      status: "sent",
      replayed: true,
    });
    expect(unread.count).toBe(1);
    expect(messages.messages).toHaveLength(1);
  });

  it("audits SMS sends with masked mainland mobile and idempotent replay", async () => {
    const provider = new MockSmsProvider({ defaultStatus: "sent" });
    const sent = await provider.sendSms({
      mobile: "+86 138-0013-8000",
      templateId: "verification_login",
      scene: "verification",
      businessKey: "login:cus_1",
      idempotencyKey: "sms-1",
      variables: {
        code: "123456",
      },
    });
    const replayed = await provider.sendSms({
      mobile: "13800138000",
      templateId: "verification_login",
      scene: "verification",
      businessKey: "login:cus_1",
      idempotencyKey: "sms-1",
    });
    const delivery = await provider.getDeliveryStatus({
      providerMessageId: sent.providerMessageId,
    });

    expect(sent.status).toBe("sent");
    expect(replayed).toMatchObject({
      providerMessageId: sent.providerMessageId,
      replayed: true,
    });
    expect(delivery.status).toBe("sent");
    expect(provider.listAuditRecords()).toMatchObject([
      {
        maskedMobile: "+86138****8000",
        templateId: "verification_login",
        scene: "verification",
        idempotencyKey: "sms-1",
      },
    ]);
  });

  it("rate limits SMS attempts by masked mobile and scene", async () => {
    const provider = new MockSmsProvider({ maxAttemptsPerMobileScene: 1 });

    await provider.sendSms({
      mobile: "13800138000",
      templateId: "order_notice",
      scene: "order_notice",
      businessKey: "order:1",
      idempotencyKey: "sms-rate-1",
    });
    const limited = await provider.sendSms({
      mobile: "13800138000",
      templateId: "order_notice",
      scene: "order_notice",
      businessKey: "order:2",
      idempotencyKey: "sms-rate-2",
    });

    expect(limited.status).toBe("failed");
    expect(limited.reason?.code).toBe("RATE_LIMITED");
  });

  it("creates logistics shipments without mutating order state and supports cancel replay", async () => {
    const provider = new MockLogisticsProvider();
    const shipment = await provider.createShipment({
      orderId: "order_123",
      fulfillmentId: "ful_123",
      carrierCode: "SF",
      recipientMobile: "13800138000",
      recipientAddressDigest: "Shanghai Pudong Zhangjiang",
      idempotencyKey: "ship-1",
    });
    const replayedShipment = await provider.createShipment({
      orderId: "order_123",
      fulfillmentId: "ful_123",
      carrierCode: "SF",
      recipientMobile: "13800138000",
      recipientAddressDigest: "Shanghai Pudong Zhangjiang",
      idempotencyKey: "ship-1",
    });
    const tracking = await provider.getTracking({
      trackingNo: shipment.trackingNo,
    });
    const canceled = await provider.cancelShipment({
      shipmentId: shipment.shipmentId,
      idempotencyKey: "cancel-1",
    });
    const replayedCancel = await provider.cancelShipment({
      shipmentId: shipment.shipmentId,
      idempotencyKey: "cancel-1",
    });
    const canceledTracking = await provider.getTracking({
      trackingNo: shipment.trackingNo,
    });

    expect(replayedShipment).toMatchObject({
      shipmentId: shipment.shipmentId,
      replayed: true,
    });
    expect(tracking.events.map((event) => event.status)).toEqual([
      "created",
      "picked_up",
      "in_transit",
      "delivered",
    ]);
    expect(canceled).toEqual({
      canceled: true,
      replayed: false,
    });
    expect(replayedCancel).toEqual({
      canceled: true,
      replayed: true,
    });
    expect(canceledTracking.events).toMatchObject([
      {
        status: "canceled",
      },
    ]);
  });

  it("maps provider failures to auditable error codes", async () => {
    const chatProvider = new MockChatProvider();
    const smsProvider = new MockSmsProvider();
    const logisticsProvider = new MockLogisticsProvider();
    const conversation = await chatProvider.createOrGetConversation({
      contextKey: "after-sales:as_123",
      participants: [
        { id: "cus_1", type: "customer" },
        { id: "operator_1", type: "operator" },
      ],
    });
    const failedChat = await chatProvider.sendMessage({
      conversationId: conversation.conversationId,
      senderId: "cus_1",
      body: "attachment upload pending",
      idempotencyKey: "chat-fail-1",
      simulateFailure: true,
    });

    expect(failedChat).toMatchObject({
      status: "failed",
      reason: {
        code: "PROVIDER_UNAVAILABLE",
        retryable: true,
      },
    });
    await expect(
      smsProvider.sendSms({
        mobile: "12800138000",
        templateId: "verification_login",
        scene: "verification",
        businessKey: "login:cus_1",
        idempotencyKey: "sms-invalid-1",
      }),
    ).rejects.toMatchObject({
      code: "INVALID_INPUT",
      retryable: false,
    });
    await expect(
      logisticsProvider.getTracking({
        trackingNo: "missing_tracking_no",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      retryable: false,
    });
  });

  it("creates mock live sessions without returning real stream URLs", async () => {
    const provider = new MockLiveProvider();
    const created = await provider.createLiveSession({
      marketId: "market_sanmen",
      vendorId: "vendor_ahaiseafood",
      stallNo: "A-18",
      title: "今日梭子蟹讲货",
      productRefs: ["prod_crab"],
      idempotencyKey: "live-1",
    });
    const replayed = await provider.createLiveSession({
      marketId: "market_sanmen",
      vendorId: "vendor_ahaiseafood",
      stallNo: "A-18",
      title: "今日梭子蟹讲货",
      productRefs: ["prod_crab"],
      idempotencyKey: "live-1",
    });
    const preview = await provider.startLivePreview({
      sessionId: created.sessionId,
    });
    const list = await provider.listLiveSessions({
      marketId: "market_sanmen",
      status: "previewing",
    });
    const ended = await provider.endLiveSession({
      sessionId: created.sessionId,
      idempotencyKey: "live-end-1",
    });

    expect(created.status).toBe("review_pending");
    expect(replayed).toMatchObject({
      sessionId: created.sessionId,
      replayed: true,
    });
    expect(preview).toMatchObject({
      status: "previewing",
      previewObjectKey: `mock-live/previews/${created.sessionId}.html`,
    });
    expect(preview.warnings).toContain("no real stream, IM, payment, or settlement behavior");
    expect(list.sessions).toHaveLength(1);
    expect(ended).toEqual({
      sessionId: created.sessionId,
      status: "ended",
      replayed: false,
    });
  });

  it("creates AI listing drafts that require merchant confirmation", async () => {
    const provider = new MockAiListingProvider();
    const created = await provider.createListingDraft({
      vendorId: "vendor_ahaiseafood",
      marketId: "market_sanmen",
      source: "text",
      text: "上架三门梭子蟹，公母混装，68 元一斤，今天到货 36 筐",
      idempotencyKey: "ai-draft-1",
    });
    const replayed = await provider.createListingDraft({
      vendorId: "vendor_ahaiseafood",
      marketId: "market_sanmen",
      source: "text",
      text: "上架三门梭子蟹，公母混装，68 元一斤，今天到货 36 筐",
      idempotencyKey: "ai-draft-1",
    });
    const validation = await provider.validateDraftForMerchantConfirmation({
      draftId: created.draft.draftId,
    });

    expect(created.draft).toMatchObject({
      title: "三门梭子蟹草稿",
      category: "鲜活水产",
      suggestedPriceText: "建议价 68 元",
      stockText: "今日到货 36 筐",
      status: "draft",
    });
    expect(created.draft.warnings).toContain(
      "merchant confirmation required before any future listing action",
    );
    expect(replayed).toMatchObject({
      draft: {
        draftId: created.draft.draftId,
      },
      replayed: true,
    });
    expect(validation.warnings).toContain(
      "validation is mock-only and does not check real food safety credentials",
    );
  });

  it("keeps low-confidence AI drafts in review state", async () => {
    const provider = new MockAiListingProvider();
    const created = await provider.createListingDraft({
      vendorId: "vendor_materials",
      marketId: "market_sanmen",
      source: "text",
      text: "上架冰袋 12 元一箱",
      idempotencyKey: "ai-draft-low-confidence",
      simulateLowConfidence: true,
    });

    expect(created.draft).toMatchObject({
      title: "市场物料冰袋草稿",
      category: "市场物料",
      status: "needs_review",
    });
    expect(created.draft.warnings).toContain("low confidence mock review required");
  });
});
