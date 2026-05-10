import {
  buildRefundProviderInboxRouteSafeResponse,
  redactRefundProviderInboxRouteMetadata,
} from "../refund-provider-inbox-response";

describe("refund provider inbox route response", () => {
  it("redacts raw, secret, command, financial, fulfillment, and logistics metadata", () => {
    const metadata = redactRefundProviderInboxRouteMetadata({
      safeDecision: "accepted_for_inbox_only",
      rawProviderPayload: "{}",
      signature: "provider_signature_should_not_leak",
      apiV3Key: "api_v3_key_should_not_leak",
      databaseUrl: "postgres://secret",
      workflowCommand: { type: "execute_workflow" },
      providerRefundRequest: { request: true },
      settlementAdjusted: true,
      commissionAdjusted: true,
      payoutAdjusted: true,
      fulfillmentCommand: "cancel",
      logisticsCommand: "intercept",
      note: "rawProviderPayload={\"secret\":\"provider_signature_should_not_leak\"}",
      callbackUrl: "postgres://codex:secret@127.0.0.1:5432/db",
      contact: "13800000000",
      bank: "6222021234567890123",
      address: "浙江省杭州市西湖区文三路 1 号",
      workflowNote: "workflowCommand: execute_workflow",
      arrayValue: ["safe", "providerRefundQuery should not leak"],
      nested: {
        detail: "apiV3 secret should not leak",
        keep: "ok",
      },
    });

    expect(metadata).toEqual({
      safeDecision: "accepted_for_inbox_only",
      note: "[redacted]",
      callbackUrl: "[redacted]",
      contact: "[redacted]",
      bank: "[redacted]",
      address: "[redacted]",
      workflowNote: "[redacted]",
      arrayValue: ["safe", "[redacted]"],
      nested: {
        detail: "[redacted]",
        keep: "ok",
      },
    });
  });

  it("marks accepted as inbox/audit-only and not refund success", () => {
    const response = buildRefundProviderInboxRouteSafeResponse({
      status: "accepted",
      provider: "wechat_pay",
      mode: "provider_inbox_only",
      metadata: {
        safeDecision: "accepted_for_inbox_only",
      },
    });

    expect(response).toMatchObject({
      status: "accepted",
      surface: "refund_provider_inbox",
      provider: "wechat_pay",
      mode: "provider_inbox_only",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      refundSuccessState: false,
      successMeans: "inbox_or_audit_only",
      metadata: {
        safeDecision: "accepted_for_inbox_only",
      },
    });
  });
});
