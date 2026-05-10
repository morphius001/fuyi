import { evaluateRefundAmountGuardContract, RefundAmountGuardInput } from "..";

const baseInput = (
  overrides: Partial<RefundAmountGuardInput> = {},
): RefundAmountGuardInput => ({
  commandId: "refund_cmd_001",
  idempotencyKey: "refund:order_001:payment_001:128560",
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
    capturedAt: "2026-05-10T00:00:00.000Z",
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

describe("evaluateRefundAmountGuardContract", () => {
  it("accepts valid full refunds for guard only without becoming executable", () => {
    const result = evaluateRefundAmountGuardContract(baseInput());

    expect(result).toMatchObject({
      executable: false,
      decisionType: "accepted_for_guard_only",
      retryable: false,
    });
    expect(result).not.toHaveProperty("providerRefundRequest");
    expect(result).not.toHaveProperty("refundStateMutation");
    expect(result.auditMetadata).toMatchObject({
      actorType: "admin",
      orderId: "order_001",
      requestedAmountMinor: 128560,
      capturedAmountMinor: 128560,
      decisionType: "accepted_for_guard_only",
    });
  });

  it("blocks non-positive refund amounts", () => {
    const result = evaluateRefundAmountGuardContract(
      baseInput({ requestedAmountMinor: 0 }),
    );

    expect(result).toMatchObject({
      executable: false,
      decisionType: "blocked",
      blockCode: "AMOUNT_NOT_POSITIVE",
    });
  });

  it("blocks over-refunds across previous, pending, and requested amounts", () => {
    const result = evaluateRefundAmountGuardContract(
      baseInput({
        requestedAmountMinor: 10000,
        refundSnapshot: {
          previousRefundedAmountMinor: 120000,
          pendingRefundAmountMinor: 0,
          priorIdempotencyKeys: [],
          priorProviderRefundIds: [],
          lastKnownRefundStatus: "none",
        },
      }),
    );

    expect(result).toMatchObject({
      decisionType: "blocked",
      blockCode: "REFUND_AMOUNT_EXCEEDS_CAPTURED",
    });
  });

  it("manual-reviews pending refund conflicts", () => {
    const result = evaluateRefundAmountGuardContract(
      baseInput({
        requestedAmountMinor: 1000,
        refundSnapshot: {
          previousRefundedAmountMinor: 0,
          pendingRefundAmountMinor: 1000,
          priorIdempotencyKeys: [],
          priorProviderRefundIds: [],
          lastKnownRefundStatus: "pending",
        },
      }),
    );

    expect(result).toMatchObject({
      decisionType: "manual_review_required",
      blockCode: "REFUND_PENDING_CONFLICT",
    });
  });

  it("blocks unsupported payment states", () => {
    const result = evaluateRefundAmountGuardContract(
      baseInput({
        paymentSnapshot: {
          ...baseInput().paymentSnapshot,
          status: "authorized",
        },
      }),
    );

    expect(result).toMatchObject({
      decisionType: "blocked",
      blockCode: "PAYMENT_NOT_CAPTURED",
    });
  });

  it("blocks fully refunded payment states", () => {
    const result = evaluateRefundAmountGuardContract(
      baseInput({
        paymentSnapshot: {
          ...baseInput().paymentSnapshot,
          status: "refunded",
        },
      }),
    );

    expect(result).toMatchObject({
      decisionType: "blocked",
      blockCode: "PAYMENT_ALREADY_REFUNDED",
    });
  });

  it("blocks currency and provider mismatches", () => {
    expect(
      evaluateRefundAmountGuardContract(baseInput({ currency: "USD" })),
    ).toMatchObject({
      blockCode: "CURRENCY_UNSUPPORTED",
    });
    expect(
      evaluateRefundAmountGuardContract(baseInput({ provider: "alipay" })),
    ).toMatchObject({
      blockCode: "PROVIDER_MISMATCH",
    });
    expect(
      evaluateRefundAmountGuardContract(
        baseInput({
          paymentSnapshot: {
            ...baseInput().paymentSnapshot,
            currency: "USD" as "CNY",
          },
        }),
      ),
    ).toMatchObject({
      blockCode: "CURRENCY_MISMATCH",
    });
  });

  it("blocks seller and market ownership mismatches", () => {
    expect(
      evaluateRefundAmountGuardContract(
        baseInput({
          ownership: {
            ...baseInput().ownership,
            orderSellerId: "seller_other",
          },
        }),
      ),
    ).toMatchObject({
      blockCode: "SELLER_OWNERSHIP_MISMATCH",
    });
    expect(
      evaluateRefundAmountGuardContract(
        baseInput({
          ownership: {
            ...baseInput().ownership,
            paymentMarketId: "market_other",
          },
        }),
      ),
    ).toMatchObject({
      blockCode: "MARKET_OWNERSHIP_MISMATCH",
    });
  });

  it("requires admin refund roles and vendor seller ownership", () => {
    expect(
      evaluateRefundAmountGuardContract(
        baseInput({
          actor: {
            ...baseInput().actor,
            roleKeys: [],
          },
        }),
      ),
    ).toMatchObject({
      blockCode: "RBAC_REQUIRED",
    });
    expect(
      evaluateRefundAmountGuardContract(
        baseInput({
          actor: {
            type: "vendor",
            id: "vendor_001",
            roleKeys: ["refund:write"],
            marketIds: ["market_001"],
            sellerIds: ["seller_other"],
          },
        }),
      ),
    ).toMatchObject({
      blockCode: "ACTOR_NOT_ALLOWED",
    });
  });

  it("requires reason and audit notes for partial or other refunds", () => {
    expect(
      evaluateRefundAmountGuardContract(
        baseInput({
          requestedAmountMinor: 1000,
          reasonCode: undefined,
        }),
      ),
    ).toMatchObject({
      blockCode: "REASON_REQUIRED",
    });
    expect(
      evaluateRefundAmountGuardContract(
        baseInput({
          requestedAmountMinor: 1000,
          reasonNote: "",
        }),
      ),
    ).toMatchObject({
      blockCode: "AUDIT_NOTE_REQUIRED",
    });
    expect(
      evaluateRefundAmountGuardContract(
        baseInput({
          reasonCode: "other",
          reasonNote: "",
        }),
      ),
    ).toMatchObject({
      blockCode: "AUDIT_NOTE_REQUIRED",
    });
  });

  it("manual-reviews repeated idempotency keys without issuing provider requests", () => {
    const result = evaluateRefundAmountGuardContract(
      baseInput({
        refundSnapshot: {
          previousRefundedAmountMinor: 0,
          pendingRefundAmountMinor: 0,
          priorIdempotencyKeys: ["refund:order_001:payment_001:128560"],
          priorProviderRefundIds: [],
          lastKnownRefundStatus: "none",
        },
      }),
    );

    expect(result).toMatchObject({
      executable: false,
      decisionType: "manual_review_required",
      blockCode: "IDEMPOTENCY_REPLAY",
    });
    expect(result).not.toHaveProperty("providerRefundRequest");
  });

  it("manual-reviews missing ownership context", () => {
    const result = evaluateRefundAmountGuardContract(
      baseInput({
        ownership: {
          ...baseInput().ownership,
          sellerId: undefined,
        },
      }),
    );

    expect(result).toMatchObject({
      decisionType: "manual_review_required",
      blockCode: "MANUAL_REVIEW_REQUIRED",
    });
  });
});
