import {
  evaluateRefundAmountGuardContract,
  mapRefundAmountGuardDecisionToAuditHook,
  RefundAmountGuardInput,
} from "..";

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

describe("mapRefundAmountGuardDecisionToAuditHook", () => {
  it("maps accepted guard decisions to accepted_for_review audit hooks", () => {
    const input = baseInput();
    const decision = evaluateRefundAmountGuardContract(input);
    const auditHook = mapRefundAmountGuardDecisionToAuditHook(input, decision);

    expect(auditHook).toMatchObject({
      action: "refund_guard_accepted_for_review",
      actorType: "admin",
      metadata: {
        orderId: "order_001",
        paymentId: "pay_001",
        decisionType: "accepted_for_guard_only",
      },
    });
  });

  it("maps blocked RBAC decisions to blocked audit hooks", () => {
    const input = baseInput({
      actor: {
        ...baseInput().actor,
        roleKeys: [],
      },
    });
    const decision = evaluateRefundAmountGuardContract(input);
    const auditHook = mapRefundAmountGuardDecisionToAuditHook(input, decision);

    expect(auditHook).toMatchObject({
      action: "refund_guard_blocked",
      metadata: {
        blockCode: "RBAC_REQUIRED",
        actorRoleKeys: [],
      },
    });
  });

  it("maps manual-review decisions without leaking sensitive metadata", () => {
    const input = baseInput({
      refundSnapshot: {
        ...baseInput().refundSnapshot,
        pendingRefundAmountMinor: 1000,
      },
    });
    const decision = evaluateRefundAmountGuardContract(input);
    const auditHook = mapRefundAmountGuardDecisionToAuditHook(input, {
      ...decision,
      auditMetadata: {
        ...decision.auditMetadata,
        workflowExecution: "must-not-leak",
        providerRefundRequest: "must-not-leak",
      },
    });

    expect(auditHook).toMatchObject({
      action: "refund_guard_manual_review_required",
      metadata: {
        blockCode: "REFUND_PENDING_CONFLICT",
      },
    });

    const serialized = JSON.stringify(auditHook);
    expect(serialized).not.toContain("must-not-leak");
  });
});
