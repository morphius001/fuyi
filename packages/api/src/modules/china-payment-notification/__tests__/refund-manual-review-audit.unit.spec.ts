import {
  buildRefundManualReviewAuditDecision,
  evaluateRefundAmountGuardContract,
  RefundAmountGuardInput,
  RefundManualReviewAuditInput,
} from "..";

const guardInput = (
  overrides: Partial<RefundAmountGuardInput> = {},
): RefundAmountGuardInput => ({
  commandId: "refund_cmd_001",
  idempotencyKey: "refund_cmd:mock_china_pay:order_001:pay_001:128560:admin:admin_001:customer_requested:2026-05-10",
  provider: "mock_china_pay",
  merchantOrderRef: "pay_mock_001",
  orderId: "order_001",
  paymentId: "pay_001",
  paymentSessionId: "payses_001",
  providerTransactionId: "mock_txn_001",
  requestedAmountMinor: 128560,
  currency: "CNY",
  reasonCode: "customer_requested",
  reasonNote: "customer requested full refund before fulfillment",
  actor: {
    type: "admin",
    id: "admin_001",
    roleKeys: ["refund:write"],
    marketIds: ["market_001"],
    sellerIds: ["seller_001"],
  },
  ownership: {
    marketId: "market_001",
    sellerId: "seller_001",
    orderSellerId: "seller_001",
    orderMarketId: "market_001",
    paymentSellerId: "seller_001",
    paymentMarketId: "market_001",
  },
  paymentSnapshot: {
    capturedAmountMinor: 128560,
    currency: "CNY",
    status: "captured",
    provider: "mock_china_pay",
    providerTransactionId: "mock_txn_001",
  },
  refundSnapshot: {
    previousRefundedAmountMinor: 0,
    pendingRefundAmountMinor: 0,
    priorIdempotencyKeys: [],
    priorProviderRefundIds: [],
    lastKnownRefundStatus: "none",
  },
  requestedAt: "2026-05-10T00:01:00.000Z",
  ...overrides,
});

const baseInput = (
  overrides: Partial<RefundManualReviewAuditInput> = {},
): RefundManualReviewAuditInput => {
  const guardDecision =
    overrides.guardDecision ?? evaluateRefundAmountGuardContract(guardInput());

  return {
    guardDecision,
    signals: [],
    auditContext: {
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
      createdAt: "2026-05-10T00:01:00.000Z",
    },
    ...overrides,
  };
};

describe("buildRefundManualReviewAuditDecision", () => {
  it("keeps accepted guard decisions non-executable even when review is not required", () => {
    const result = buildRefundManualReviewAuditDecision(baseInput());

    expect(result).toMatchObject({
      required: false,
      reasonCodes: [],
      severity: "low",
      retryable: false,
      blockRuntimeMutation: true,
      auditAction: "refund_runtime_mutation_blocked",
      fixtureOnly: true,
      executable: false,
    });
    expect(result.redactionPolicy).toEqual({
      includeRawPayload: false,
      includeProviderSecrets: false,
      includeUserSensitiveData: false,
      includeExecutableCommand: false,
    });
    expect(result).not.toHaveProperty("providerRefundRequest");
    expect(result).not.toHaveProperty("refundStateMutation");
  });

  it("requires manual review for guard blocked decisions", () => {
    const guardDecision = evaluateRefundAmountGuardContract(
      guardInput({ currency: "USD" }),
    );
    const result = buildRefundManualReviewAuditDecision(
      baseInput({ guardDecision }),
    );

    expect(result).toMatchObject({
      required: true,
      reasonCodes: ["guard_blocked"],
      severity: "high",
      auditAction: "refund_guard_blocked",
      executable: false,
    });
    expect(result.auditMetadata).toMatchObject({
      decisionType: "blocked",
      guardBlockCode: "CURRENCY_UNSUPPORTED",
      manualReviewRequired: true,
    });
  });

  it("requires manual review for guard manual review decisions", () => {
    const guardDecision = evaluateRefundAmountGuardContract(
      guardInput({
        refundSnapshot: {
          previousRefundedAmountMinor: 0,
          pendingRefundAmountMinor: 1000,
          priorIdempotencyKeys: [],
          priorProviderRefundIds: [],
          lastKnownRefundStatus: "pending",
        },
      }),
    );
    const result = buildRefundManualReviewAuditDecision(
      baseInput({ guardDecision }),
    );

    expect(result).toMatchObject({
      required: true,
      reasonCodes: ["guard_manual_review_required"],
      severity: "medium",
      auditAction: "refund_guard_manual_review_required",
    });
  });

  it("uses explicit signals for notification, ownership, and reconciliation risks", () => {
    const result = buildRefundManualReviewAuditDecision(
      baseInput({
        signals: [
          {
            reasonCode: "amount_mismatch",
            severity: "high",
            retryable: false,
          },
          {
            reasonCode: "seller_ownership_mismatch",
            severity: "critical",
          },
          {
            reasonCode: "provider_unknown_or_timeout",
            severity: "medium",
            retryable: true,
          },
        ],
      }),
    );

    expect(result.required).toBe(true);
    expect(result.reasonCodes).toEqual([
      "amount_mismatch",
      "seller_ownership_mismatch",
      "provider_unknown_or_timeout",
    ]);
    expect(result.severity).toBe("critical");
    expect(result.retryable).toBe(true);
    expect(result.auditAction).toBe("refund_guard_manual_review_required");
  });

  it("uses digest conflict audit action for duplicate payload conflicts", () => {
    const result = buildRefundManualReviewAuditDecision(
      baseInput({
        signals: [
          {
            reasonCode: "duplicate_digest_conflict",
            severity: "critical",
          },
        ],
      }),
    );

    expect(result).toMatchObject({
      required: true,
      severity: "critical",
      auditAction: "refund_notification_digest_conflict",
    });
  });

  it("blocks runtime mutation for settlement and payout locks", () => {
    const result = buildRefundManualReviewAuditDecision(
      baseInput({
        signals: [
          {
            reasonCode: "settlement_or_payout_locked",
            severity: "critical",
          },
        ],
      }),
    );

    expect(result.required).toBe(true);
    expect(result.blockRuntimeMutation).toBe(true);
    expect(result.auditMetadata).toHaveProperty(
      "manualReviewReasonCodes",
      ["settlement_or_payout_locked"],
    );
  });

  it("keeps audit metadata scoped and avoids sensitive or executable fields", () => {
    const result = buildRefundManualReviewAuditDecision(
      baseInput({
        signals: [
          {
            reasonCode: "refund_reason_or_audit_note_missing",
            severity: "medium",
          },
        ],
      }),
    );
    const serialized = JSON.stringify(result);

    expect(result.auditMetadata).toMatchObject({
      auditEventId: "refund_audit_001",
      actorType: "admin",
      orderId: "order_001",
      paymentId: "pay_001",
      paymentSessionId: "payses_001",
      requestedAmountMinor: 128560,
      currency: "CNY",
      localRefundCommandIdempotencyKey: "refund_cmd_001",
      notificationIdempotencyKey:
        "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
      manualReviewRequired: true,
    });
    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN CERTIFICATE");
    expect(serialized).not.toContain("APIv3");
    expect(serialized).not.toContain("wechat_refund");
    expect(serialized).not.toContain("alipay_refund");
    expect(serialized).not.toContain("createRefund");
    expect(serialized).not.toContain("workflow_execution");
    expect(serialized).not.toContain("refundStateMutation");
    expect(serialized).not.toContain("rawProviderPayload");
    expect(result).not.toHaveProperty("providerRefundRequest");
  });
});
