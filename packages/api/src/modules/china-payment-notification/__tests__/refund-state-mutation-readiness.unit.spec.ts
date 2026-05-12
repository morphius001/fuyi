import {
  evaluateRefundStateMutationReadiness,
  RefundStateMutationReadinessInput,
} from "..";

const input = (
  overrides: Partial<RefundStateMutationReadinessInput> = {},
): RefundStateMutationReadinessInput => ({
  provider: "wechat_pay",
  source: "query_reconciliation",
  requestedAt: "2026-05-12T01:00:00.000Z",
  evidence: {
    verifierReady: true,
    payloadRedacted: true,
    inboxStable: true,
    handoffSafe: true,
    reconciliationComplete: true,
    manualReviewPolicyReady: true,
    manualReviewApproved: true,
    rollbackRunbookReady: true,
    sourceInboxId: "rinbox_001",
    queryFollowUpId: "rqf_001",
    reconciliationId: "rrec_001",
  },
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_wechat_001",
    providerRefundId: "wx_refund_001",
    merchantOrderReference: "pay_order_001",
    paymentProviderSessionId: "payses_001",
    amountMinor: 128560,
    currency: "CNY",
    currentPlatformRefundState: "pending",
  },
  observedRefund: {
    providerRefundId: "wx_refund_001",
    merchantOrderReference: "pay_order_001",
    paymentProviderSessionId: "payses_001",
    amountMinor: 128560,
    currency: "CNY",
  },
  safetyChecks: {
    ownershipPassed: true,
    permissionPassed: true,
    financialSideEffectsIsolated: true,
    fulfillmentSideEffectsIsolated: true,
  },
  auditContext: {
    actorType: "admin",
    actorId: "admin_refund_reviewer_001",
    metadata: {
      safeNote: "kept",
      rawProviderPayload: "{raw}",
      signature: "signature_should_not_leak",
      secret: "secret_should_not_leak",
      providerRefundQuery: "must-not-leak",
      workflowExecution: "must-not-leak",
      refundStateMutation: "must-not-leak",
      settlementAdjustment: "must-not-leak",
      commissionAdjustment: "must-not-leak",
      payoutAdjustment: "must-not-leak",
      fulfillmentMutation: "must-not-leak",
      logisticsMutation: "must-not-leak",
    },
  },
  ...overrides,
});

const expectSafe = (
  result: ReturnType<typeof evaluateRefundStateMutationReadiness>,
) => {
  expect(result).toMatchObject({
    executable: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
  });

  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("signature_should_not_leak");
  expect(serialized).not.toContain("secret_should_not_leak");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundQuery");
  expect(serialized).not.toContain("workflowExecution\":\"must-not-leak");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("settlementAdjustment");
  expect(serialized).not.toContain("commissionAdjustment");
  expect(serialized).not.toContain("payoutAdjustment");
  expect(serialized).not.toContain("fulfillmentMutation\":\"must-not-leak");
  expect(serialized).not.toContain("logisticsMutation");
};

describe("evaluateRefundStateMutationReadiness", () => {
  it("prepares only a non-executable shadow readiness command when every gate passes", () => {
    const result = evaluateRefundStateMutationReadiness(input());

    expect(result).toMatchObject({
      decision: "ready_for_shadow_state_command",
      idempotencyKey:
        "refund_state_mutation_readiness:wechat_pay:query_reconciliation:refund_cmd_wechat_001:wx_refund_001",
      shadowCommand: {
        commandType: "refund_state_mutation_readiness_shadow",
        shadowOnly: true,
        stateMutationAllowed: false,
        workflowExecutionAllowed: false,
        financialMutationAllowed: false,
        fulfillmentMutationAllowed: false,
      },
      auditEvent: {
        action: "refund_state_mutation_readiness_shadow_prepared",
      },
    });
    expectSafe(result);
  });

  it("blocks direct runtime or workflow mutation requests", () => {
    const result = evaluateRefundStateMutationReadiness(
      input({
        safetyChecks: {
          ...input().safetyChecks,
          runtimeMutationRequested: true,
          workflowExecutionRequested: true,
          stateMutationRequested: true,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      blockCodes: ["RUNTIME_MUTATION_REQUESTED"],
    });
    expect(result.shadowCommand).toBeUndefined();
    expectSafe(result);
  });

  it("requires manual review when approval is missing", () => {
    const result = evaluateRefundStateMutationReadiness(
      input({
        evidence: {
          ...input().evidence,
          manualReviewApproved: false,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "manual_review_required",
      blockCodes: ["MANUAL_REVIEW_NOT_APPROVED"],
    });
    expect(result.shadowCommand).toBeUndefined();
    expectSafe(result);
  });

  it("requires reconciliation for mismatched refund evidence", () => {
    const result = evaluateRefundStateMutationReadiness(
      input({
        observedRefund: {
          ...input().observedRefund,
          amountMinor: 128500,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "reconciliation_required",
      blockCodes: ["AMOUNT_MISMATCH"],
    });
    expect(result.shadowCommand).toBeUndefined();
    expectSafe(result);
  });

  it("blocks terminal platform state conflicts", () => {
    const result = evaluateRefundStateMutationReadiness(
      input({
        expectedRefund: {
          ...input().expectedRefund,
          currentPlatformRefundState: "succeeded",
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      blockCodes: ["TERMINAL_STATE_CONFLICT"],
    });
    expect(result.shadowCommand).toBeUndefined();
    expectSafe(result);
  });

  it("blocks missing rollback runbook and side-effect isolation", () => {
    const result = evaluateRefundStateMutationReadiness(
      input({
        evidence: {
          ...input().evidence,
          rollbackRunbookReady: false,
        },
        safetyChecks: {
          ...input().safetyChecks,
          financialSideEffectsIsolated: false,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      blockCodes: ["FINANCIAL_SIDE_EFFECT_NOT_ISOLATED"],
    });
    expect(result.shadowCommand).toBeUndefined();
    expectSafe(result);
  });
});
