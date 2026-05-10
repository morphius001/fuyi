import {
  buildRefundManualReviewAuditDecision,
  evaluateRefundAmountGuardContract,
  evaluateRefundInboxStateTransitionContract,
  RefundAmountGuardInput,
  RefundInboxTransitionInput,
  RefundManualReviewAuditInput,
} from "..";
import { ChinaPaymentNotificationEnvelope } from "../types";

const auditMetadata = {
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
  decisionType: "accepted_for_guard_only",
  retryable: false,
  createdAt: "2026-05-10T00:01:00.000Z",
};

const envelope = (
  overrides: Partial<ChinaPaymentNotificationEnvelope> = {},
): ChinaPaymentNotificationEnvelope => ({
  provider: "mock_china_pay",
  eventId: "evt_refund_fake_succeeded_001",
  eventType: "refund.succeeded",
  providerTransactionId: "mock_txn_001",
  providerRefundId: "refund_fake_001",
  merchantOrderRef: "pay_mock_001",
  paymentSessionId: "payses_001",
  amount: {
    value: 128560,
    currency: "CNY",
  },
  occurredAt: "2026-05-10T00:00:58.000Z",
  receivedAt: "2026-05-10T00:01:00.000Z",
  idempotencyKey: "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
  signature: {
    status: "verified",
    algorithm: "MOCK_SHA256",
    keyId: "fake-key-001",
    verifiedAt: "2026-05-10T00:01:00.000Z",
  },
  rawPayloadDigest: "sha256:fake_digest",
  riskFlags: [],
  ...overrides,
});

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

const manualReviewInput = (
  overrides: Partial<RefundManualReviewAuditInput> = {},
): RefundManualReviewAuditInput => ({
  guardDecision:
    overrides.guardDecision ?? evaluateRefundAmountGuardContract(guardInput()),
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
});

const input = (
  overrides: Partial<RefundInboxTransitionInput>,
): RefundInboxTransitionInput => ({
  from: "received",
  event: "signature_verified",
  auditMetadata,
  ...overrides,
});

describe("evaluateRefundInboxStateTransitionContract", () => {
  it("moves received notifications to signature_verified without enabling runtime mutation", () => {
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "received",
        event: "signature_verified",
        signatureStatus: "verified",
      }),
    );

    expect(result).toMatchObject({
      accepted: true,
      from: "received",
      to: "signature_verified",
      auditAction: "refund_notification_verified",
      blockRuntimeMutation: true,
      stateMutationAllowed: false,
      fixtureOnly: true,
      executable: false,
    });
  });

  it("rejects signature transitions unless the signature is verified", () => {
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "received",
        event: "signature_verified",
        signatureStatus: "invalid",
      }),
    );

    expect(result).toMatchObject({
      accepted: false,
      failureCode: "REFUND_INBOX_SIGNATURE_NOT_VERIFIED",
      blockRuntimeMutation: true,
      executable: false,
    });
  });

  it("normalizes only verified refund envelopes and does not treat refund.succeeded as final state", () => {
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "signature_verified",
        event: "normalized",
        envelope: envelope(),
      }),
    );

    expect(result).toMatchObject({
      accepted: true,
      to: "normalized",
      auditAction: "refund_notification_normalized",
      stateMutationAllowed: false,
      executable: false,
    });
    expect(JSON.stringify(result)).not.toContain("refund_state_mutated");
    expect(JSON.stringify(result)).not.toContain("refund_workflow_executed");
  });

  it("blocks payment envelopes from the refund inbox transition contract", () => {
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "signature_verified",
        event: "normalized",
        envelope: envelope({ eventType: "payment.succeeded" }),
      }),
    );

    expect(result).toMatchObject({
      accepted: false,
      failureCode: "REFUND_INBOX_ENVELOPE_UNSUPPORTED",
    });
  });

  it("marks duplicate notifications with the same digest as duplicate_seen no-op", () => {
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "normalized",
        event: "duplicate_replay_checked",
        existingIdempotencyKey:
          "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
        incomingIdempotencyKey:
          "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
        existingRawPayloadDigest: "sha256:fake_digest",
        incomingRawPayloadDigest: "sha256:fake_digest",
      }),
    );

    expect(result).toMatchObject({
      accepted: true,
      to: "duplicate_seen",
      auditAction: "refund_notification_duplicate_seen",
      stateMutationAllowed: false,
      executable: false,
    });
  });

  it("routes duplicate digest conflicts to manual review and keeps runtime mutation blocked", () => {
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "normalized",
        event: "duplicate_replay_checked",
        existingIdempotencyKey:
          "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
        incomingIdempotencyKey:
          "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
        existingRawPayloadDigest: "sha256:fake_digest",
        incomingRawPayloadDigest: "sha256:different_digest",
      }),
    );

    expect(result).toMatchObject({
      accepted: true,
      to: "digest_conflict_manual_review",
      auditAction: "refund_notification_digest_conflict",
      blockRuntimeMutation: true,
      executable: false,
    });
  });

  it("hands accepted guard decisions only to a future state owner", () => {
    const guardDecision = evaluateRefundAmountGuardContract(guardInput());
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "guard_checked",
        event: "guard_resolved",
        guardDecision,
      }),
    );

    expect(result).toMatchObject({
      accepted: true,
      to: "state_owner_pending",
      auditAction: "refund_runtime_mutation_blocked",
      stateMutationAllowed: false,
      executable: false,
    });
  });

  it("routes manual review guard decisions to manual_review_required", () => {
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
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "guard_checked",
        event: "guard_resolved",
        guardDecision,
      }),
    );

    expect(result).toMatchObject({
      accepted: true,
      to: "manual_review_required",
      auditAction: "refund_guard_manual_review_required",
      executable: false,
    });
  });

  it("keeps manual review required decisions blocked instead of mutating refund state", () => {
    const manualReviewDecision = buildRefundManualReviewAuditDecision(
      manualReviewInput({
        signals: [
          {
            reasonCode: "settlement_or_payout_locked",
            severity: "critical",
          },
        ],
      }),
    );
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "manual_review_required",
        event: "manual_review_resolved",
        manualReviewDecision,
      }),
    );

    expect(result).toMatchObject({
      accepted: true,
      to: "runtime_mutation_blocked",
      auditAction: "refund_runtime_mutation_blocked",
      blockRuntimeMutation: true,
      executable: false,
    });
  });

  it("rejects unsupported transitions", () => {
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "received",
        event: "processed_for_audit_only",
      }),
    );

    expect(result).toMatchObject({
      accepted: false,
      failureCode: "REFUND_INBOX_TRANSITION_UNSUPPORTED",
      blockRuntimeMutation: true,
      executable: false,
    });
  });

  it("does not expose provider requests, workflow commands, or refund state mutation payloads", () => {
    const result = evaluateRefundInboxStateTransitionContract(
      input({
        from: "runtime_mutation_blocked",
        event: "processed_for_audit_only",
        auditMetadata: {
          ...auditMetadata,
          providerRefundRequest: {
            url: "https://provider.example/refund",
          },
          workflowCommand: {
            type: "refund_payment",
          },
          refundStateMutation: {
            status: "refunded",
          },
          providerSdkRequest: {
            method: "createRefund",
          },
          rawProviderPayload: "{raw-provider-payload}",
          privateKey: "BEGIN PRIVATE KEY",
          fullPhone: "13800000000",
          nested: {
            providerRefundRequest: {
              url: "https://provider.example/refund-nested",
            },
            workflowCommand: {
              type: "refund_payment_nested",
            },
            refundStateMutation: {
              status: "refunded_nested",
            },
            rawProviderPayload: "{nested-raw-provider-payload}",
            privateKey: "BEGIN NESTED PRIVATE KEY",
            fullPhone: "13900000000",
            safeNote: "kept-for-audit",
          },
        },
      }),
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      accepted: true,
      to: "processed_for_audit_only",
      stateMutationAllowed: false,
      executable: false,
    });
    expect(serialized).not.toContain("providerRefundRequest");
    expect(serialized).not.toContain("workflowCommand");
    expect(serialized).not.toContain("refundStateMutation");
    expect(serialized).not.toContain("wechat_refund");
    expect(serialized).not.toContain("alipay_refund");
    expect(serialized).not.toContain("createRefund");
    expect(serialized).not.toContain("raw-provider-payload");
    expect(serialized).not.toContain("nested-raw-provider-payload");
    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN NESTED PRIVATE KEY");
    expect(serialized).not.toContain("13800000000");
    expect(serialized).not.toContain("13900000000");
    expect(serialized).toContain("kept-for-audit");
  });
});
