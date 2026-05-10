import {
  refundAuditEventAllowedActions,
  refundAuditEventForbiddenActions,
  validateRefundAuditEventAllowlistContract,
} from "..";

const baseMetadata = {
  auditEventId: "refund_audit_001",
  actorType: "admin",
  actorId: "admin_001",
  orderId: "order_001",
  paymentId: "pay_001",
  paymentSessionId: "payses_001",
  merchantOrderRef: "pay_mock_001",
  sellerId: "seller_001",
  marketId: "market_001",
  requestedAmountMinor: 128560,
  currency: "CNY",
  capturedAmountMinor: 128560,
  previousRefundedAmountMinor: 0,
  pendingRefundAmountMinor: 0,
  localRefundCommandIdempotencyKey: "refund_cmd_001",
  refundRequestIdempotencyKey: "refund_req_001",
  providerRefundId: "refund_fake_001",
  notificationIdempotencyKey:
    "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
  rawPayloadDigest: "sha256:fake_digest",
  decisionType: "manual_review_required",
  retryable: false,
  createdAt: "2026-05-10T00:01:00.000Z",
};

describe("validateRefundAuditEventAllowlistContract", () => {
  it("allows every refund audit action in the current non-executable allowlist", () => {
    for (const action of refundAuditEventAllowedActions) {
      const result = validateRefundAuditEventAllowlistContract({
        action,
        metadata: baseMetadata,
      });

      expect(result).toMatchObject({
        allowed: true,
        action,
        fixtureOnly: true,
        executable: false,
      });
    }
  });

  it("blocks explicitly forbidden refund mutation and payout actions", () => {
    for (const action of refundAuditEventForbiddenActions) {
      const result = validateRefundAuditEventAllowlistContract({
        action,
        metadata: baseMetadata,
      });

      expect(result).toMatchObject({
        allowed: false,
        action,
        failureCode: "REFUND_AUDIT_ACTION_FORBIDDEN",
        fixtureOnly: true,
        executable: false,
      });
    }
  });

  it("blocks unsupported audit actions", () => {
    const result = validateRefundAuditEventAllowlistContract({
      action: "refund_success_marked",
      metadata: baseMetadata,
    });

    expect(result).toMatchObject({
      allowed: false,
      failureCode: "REFUND_AUDIT_ACTION_UNSUPPORTED",
    });
  });

  it("requires minimum audit metadata before future DB writes", () => {
    const { orderId: _orderId, paymentId: _paymentId, ...metadata } =
      baseMetadata;
    const result = validateRefundAuditEventAllowlistContract({
      action: "refund_guard_manual_review_required",
      metadata,
    });

    expect(result).toMatchObject({
      allowed: false,
      failureCode: "REFUND_AUDIT_METADATA_MISSING",
    });
    expect(JSON.stringify(result)).toContain("orderId");
    expect(JSON.stringify(result)).toContain("paymentId");
  });

  it("blocks sensitive provider or user data in audit metadata", () => {
    const result = validateRefundAuditEventAllowlistContract({
      action: "refund_notification_verified",
      metadata: {
        ...baseMetadata,
        rawProviderPayload: "{raw-provider-payload}",
        privateKey: "BEGIN PRIVATE KEY",
      },
    });

    expect(result).toMatchObject({
      allowed: false,
      failureCode: "REFUND_AUDIT_METADATA_SENSITIVE",
    });
  });

  it("blocks executable provider requests, workflow commands, and state mutation payloads", () => {
    const result = validateRefundAuditEventAllowlistContract({
      action: "refund_provider_request_prepared",
      metadata: {
        ...baseMetadata,
        providerRefundRequest: {
          url: "https://provider.example/refund",
        },
      },
    });

    expect(result).toMatchObject({
      allowed: false,
      failureCode: "REFUND_AUDIT_METADATA_EXECUTABLE",
    });
  });

  it("does not expose provider APIs, secrets, workflow calls, or refund state mutations", () => {
    const result = validateRefundAuditEventAllowlistContract({
      action: "refund_runtime_mutation_blocked",
      metadata: baseMetadata,
    });
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN CERTIFICATE");
    expect(serialized).not.toContain("APIv3");
    expect(serialized).not.toContain("wechat_refund");
    expect(serialized).not.toContain("alipay_refund");
    expect(serialized).not.toContain("createRefund");
    expect(serialized).not.toContain("workflow_execution");
    expect(serialized).not.toContain("refundStateMutation");
    expect(result).not.toHaveProperty("providerRefundRequest");
  });
});
