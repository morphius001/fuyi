import {
  evaluateRefundStateOwnerHandoffContract,
  RefundStateOwnerHandoffInput,
} from "..";
import { ChinaPaymentNotificationEnvelope } from "../types";

const envelope = (
  overrides: Partial<ChinaPaymentNotificationEnvelope> = {},
): ChinaPaymentNotificationEnvelope => ({
  provider: "wechat_pay",
  eventId: "evt_refund_provider_001",
  eventType: "refund.succeeded",
  providerTransactionId: "wx_txn_001",
  providerRefundId: "wx_refund_001",
  merchantOrderRef: "pay_order_001",
  paymentSessionId: "payses_001",
  amount: {
    value: 128560,
    currency: "CNY",
  },
  occurredAt: "2026-05-12T00:00:00.000Z",
  receivedAt: "2026-05-12T00:00:05.000Z",
  idempotencyKey: "refund_notify:wechat_pay:evt_refund_provider_001",
  signature: {
    status: "verified",
    algorithm: "WECHAT_PAY_RSA",
    keyId: "fixture-platform-serial",
    verifiedAt: "2026-05-12T00:00:05.000Z",
  },
  rawPayloadDigest: "sha256:provider-refund-digest",
  riskFlags: [],
  ...overrides,
});

const input = (
  overrides: Partial<RefundStateOwnerHandoffInput> = {},
): RefundStateOwnerHandoffInput => ({
  inboxRecordId: "rinbox_001",
  inboxProcessingStatus: "runtime_mutation_blocked",
  provider: "wechat_pay",
  envelope: envelope(),
  expectedRefundSnapshot: {
    localRefundCommandKey: "refund_cmd_wechat_001",
    requestedAmountMinor: 128560,
    currency: "CNY",
    providerRefundId: "wx_refund_001",
    paymentSessionId: "payses_001",
    currentPlatformRefundState: "pending",
  },
  ownershipCheck: {
    sellerId: "seller_001",
    marketId: "market_001",
    passed: true,
  },
  permissionCheck: {
    actorType: "system_job",
    actorId: "refund-state-handoff",
    passed: true,
  },
  auditMetadata: {
    safeNote: "kept",
    rawProviderPayload: "{raw}",
    providerRefundRequest: "must-not-leak",
    providerRefundQuery: "must-not-leak",
    workflowCommand: "must-not-leak",
    refundStateMutation: "must-not-leak",
    settlementAdjustment: "must-not-leak",
    commissionAdjustment: "must-not-leak",
    payoutAdjustment: "must-not-leak",
    fulfillmentMutation: "must-not-leak",
    logisticsMutation: "must-not-leak",
  },
  ...overrides,
});

const expectNonExecutable = (result: ReturnType<typeof evaluateRefundStateOwnerHandoffContract>) => {
  expect(result).toMatchObject({
    executable: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
  });
  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("must-not-leak");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundRequest");
  expect(serialized).not.toContain("providerRefundQuery");
  expect(serialized).not.toContain("workflowCommand");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("settlementAdjustment");
  expect(serialized).not.toContain("commissionAdjustment");
  expect(serialized).not.toContain("payoutAdjustment");
  expect(serialized).not.toContain("fulfillmentMutation");
  expect(serialized).not.toContain("logisticsMutation");
};

describe("evaluateRefundStateOwnerHandoffContract", () => {
  it("prepares a non-executable shadow command when all handoff guards pass", () => {
    const result = evaluateRefundStateOwnerHandoffContract(input());

    expect(result).toMatchObject({
      decision: "shadow_command_prepared",
      blockCodes: [],
      shadowCommand: {
        commandType: "refund_state_shadow",
        provider: "wechat_pay",
        inboxRecordId: "rinbox_001",
        providerRefundId: "wx_refund_001",
        localRefundCommandKey: "refund_cmd_wechat_001",
        amountMinor: 128560,
        currency: "CNY",
      },
    });
    expectNonExecutable(result);
  });

  it("blocks unverified signatures before state handoff", () => {
    const result = evaluateRefundStateOwnerHandoffContract(
      input({
        envelope: envelope({
          signature: {
            status: "invalid",
            algorithm: "WECHAT_PAY_RSA",
            keyId: "fixture-platform-serial",
          },
        }),
      }),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      blockCodes: ["SIGNATURE_NOT_VERIFIED"],
    });
    expect(result.shadowCommand).toBeUndefined();
    expectNonExecutable(result);
  });

  it("routes digest conflicts to manual review without a command", () => {
    const result = evaluateRefundStateOwnerHandoffContract(
      input({
        inboxProcessingStatus: "digest_conflict_manual_review",
      }),
    );

    expect(result).toMatchObject({
      decision: "manual_review_required",
      blockCodes: ["DIGEST_CONFLICT"],
    });
    expect(result.shadowCommand).toBeUndefined();
    expectNonExecutable(result);
  });

  it("requires query when provider refund id is missing or mismatched", () => {
    const missing = evaluateRefundStateOwnerHandoffContract(
      input({
        envelope: envelope({
          providerRefundId: undefined,
        }),
      }),
    );
    const mismatch = evaluateRefundStateOwnerHandoffContract(
      input({
        expectedRefundSnapshot: {
          ...input().expectedRefundSnapshot,
          providerRefundId: "different_refund_id",
        },
      }),
    );

    expect(missing).toMatchObject({
      decision: "query_required",
      blockCodes: ["PROVIDER_REFUND_ID_MISSING"],
    });
    expect(mismatch).toMatchObject({
      decision: "query_required",
      blockCodes: ["PROVIDER_REFUND_ID_MISMATCH"],
    });
    expectNonExecutable(missing);
    expectNonExecutable(mismatch);
  });

  it("routes amount, currency, and payment session mismatches to manual review", () => {
    const amount = evaluateRefundStateOwnerHandoffContract(
      input({
        expectedRefundSnapshot: {
          ...input().expectedRefundSnapshot,
          requestedAmountMinor: 100,
        },
      }),
    );
    const currency = evaluateRefundStateOwnerHandoffContract(
      input({
        envelope: envelope({
          amount: {
            value: 128560,
            currency: "USD" as "CNY",
          },
        }),
      }),
    );
    const paymentSession = evaluateRefundStateOwnerHandoffContract(
      input({
        expectedRefundSnapshot: {
          ...input().expectedRefundSnapshot,
          paymentSessionId: "different_session",
        },
      }),
    );

    expect(amount).toMatchObject({ blockCodes: ["AMOUNT_MISMATCH"] });
    expect(currency).toMatchObject({ blockCodes: ["CURRENCY_MISMATCH"] });
    expect(paymentSession).toMatchObject({
      blockCodes: ["PAYMENT_SESSION_MISMATCH"],
    });
    expectNonExecutable(amount);
    expectNonExecutable(currency);
    expectNonExecutable(paymentSession);
  });

  it("requires reconciliation for terminal platform state conflicts", () => {
    const result = evaluateRefundStateOwnerHandoffContract(
      input({
        expectedRefundSnapshot: {
          ...input().expectedRefundSnapshot,
          currentPlatformRefundState: "succeeded",
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "reconciliation_required",
      blockCodes: ["TERMINAL_STATE_CONFLICT"],
    });
    expect(result.shadowCommand).toBeUndefined();
    expectNonExecutable(result);
  });

  it("blocks failed ownership or permission checks", () => {
    const ownership = evaluateRefundStateOwnerHandoffContract(
      input({
        ownershipCheck: {
          sellerId: "seller_001",
          marketId: "market_001",
          passed: false,
        },
      }),
    );
    const permission = evaluateRefundStateOwnerHandoffContract(
      input({
        permissionCheck: {
          actorType: "vendor",
          actorId: "seller_user_001",
          passed: false,
        },
      }),
    );

    expect(ownership).toMatchObject({
      decision: "blocked",
      blockCodes: ["OWNERSHIP_CHECK_FAILED"],
    });
    expect(permission).toMatchObject({
      decision: "blocked",
      blockCodes: ["PERMISSION_CHECK_FAILED"],
    });
    expectNonExecutable(ownership);
    expectNonExecutable(permission);
  });

  it("honors manual review decisions without enabling execution", () => {
    const approved = evaluateRefundStateOwnerHandoffContract(
      input({
        manualReview: {
          required: true,
          decision: "approved_for_shadow",
          reasonCodes: ["operator_verified"],
        },
      }),
    );
    const rejected = evaluateRefundStateOwnerHandoffContract(
      input({
        manualReview: {
          required: true,
          decision: "rejected",
          reasonCodes: ["amount_disputed"],
        },
      }),
    );
    const query = evaluateRefundStateOwnerHandoffContract(
      input({
        manualReview: {
          required: true,
          decision: "needs_query",
          reasonCodes: ["provider_status_unclear"],
        },
      }),
    );

    expect(approved).toMatchObject({
      decision: "shadow_command_prepared",
    });
    expect(rejected).toMatchObject({
      decision: "blocked",
      blockCodes: ["MANUAL_REVIEW_REJECTED"],
    });
    expect(query).toMatchObject({
      decision: "query_required",
      blockCodes: ["QUERY_REQUIRED"],
    });
    expectNonExecutable(approved);
    expectNonExecutable(rejected);
    expectNonExecutable(query);
  });
});
