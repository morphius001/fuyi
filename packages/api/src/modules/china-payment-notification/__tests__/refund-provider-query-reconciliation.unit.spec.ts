import {
  planRefundProviderQueryReconciliation,
  RefundProviderQueryReconciliationInput,
} from "..";

const input = (
  overrides: Partial<RefundProviderQueryReconciliationInput> = {},
): RefundProviderQueryReconciliationInput => ({
  snapshot: {
    source: "provider_query_snapshot",
    provider: "wechat_pay",
    queryFollowUpId: "rqf_001",
    providerRefundId: "wx_refund_001",
    localRefundCommandKey: "refund_cmd_wechat_001",
    merchantOrderReference: "pay_order_001",
    paymentProviderSessionId: "payses_001",
    providerRefundState: "succeeded",
    amount: {
      value: 128560,
      currency: "CNY",
    },
    queriedAt: "2026-05-12T00:30:00.000Z",
    rawPayloadDigest: "sha256:redacted-provider-query-snapshot",
    redactionApplied: true,
    providerQueryAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    metadata: {
      safeNote: "kept",
      rawProviderPayload: "{raw}",
      signature: "signature_should_not_leak",
      secret: "secret_should_not_leak",
      privateKey: "private_key_should_not_leak",
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
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_wechat_001",
    providerRefundId: "wx_refund_001",
    merchantOrderReference: "pay_order_001",
    paymentProviderSessionId: "payses_001",
    amountMinor: 128560,
    currency: "CNY",
    currentPlatformRefundState: "pending",
  },
  safetyChecks: {
    ownershipPassed: true,
    permissionPassed: true,
  },
  auditContext: {
    sourceInboxId: "rinbox_001",
    sourceAuditEventId: "raud_001",
    actorType: "system_job",
    actorId: "refund-reconciliation-shadow",
    metadata: {
      safeAuditNote: "kept",
      databaseUrl: "postgres://must-not-leak",
    },
  },
  ...overrides,
});

const expectSafe = (
  result: ReturnType<typeof planRefundProviderQueryReconciliation>,
) => {
  expect(result).toMatchObject({
    executable: false,
    workflowExecutionAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
  });

  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("signature_should_not_leak");
  expect(serialized).not.toContain("secret_should_not_leak");
  expect(serialized).not.toContain("private_key_should_not_leak");
  expect(serialized).not.toContain("postgres://must-not-leak");
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

describe("planRefundProviderQueryReconciliation", () => {
  it("maps a consistent provider success snapshot to manual review without state mutation", () => {
    const result = planRefundProviderQueryReconciliation(input());

    expect(result).toMatchObject({
      decision: "ready_for_manual_review",
      idempotencyKey:
        "provider_query_reconciliation:wechat_pay:rqf_001:refund_cmd_wechat_001:wx_refund_001:succeeded",
      manualReviewHandoff: {
        handoffType: "provider_query_reconciliation_review",
        manualReviewReason: "provider_query_snapshot_consistent",
        recommendedNextStep: "review_platform_refund_state",
        stateMutationAllowed: false,
        financialMutationAllowed: false,
        fulfillmentMutationAllowed: false,
      },
      auditEvent: {
        action: "provider_query_reconciliation_manual_review_ready",
      },
    });
    expectSafe(result);
  });

  it("requires mismatch review when provider amount differs from the expected refund", () => {
    const result = planRefundProviderQueryReconciliation(
      input({
        snapshot: {
          ...input().snapshot,
          amount: {
            value: 128500,
            currency: "CNY",
          },
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "mismatch_requires_review",
      blockCodes: ["AMOUNT_MISMATCH"],
      manualReviewHandoff: {
        manualReviewReason: "provider_query_mismatch",
        recommendedNextStep: "investigate_provider_mismatch",
      },
    });
    expectSafe(result);
  });

  it("keeps processing snapshots in requery/manual-review flow", () => {
    const result = planRefundProviderQueryReconciliation(
      input({
        snapshot: {
          ...input().snapshot,
          providerRefundState: "processing",
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "provider_still_processing",
      manualReviewHandoff: {
        manualReviewReason: "provider_processing",
        recommendedNextStep: "schedule_requery",
      },
    });
    expectSafe(result);
  });

  it("blocks unredacted snapshots", () => {
    const result = planRefundProviderQueryReconciliation(
      input({
        snapshot: {
          ...input().snapshot,
          redactionApplied: false,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      blockCodes: ["SNAPSHOT_NOT_REDACTED"],
    });
    expect(result.manualReviewHandoff).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe query snapshots that claim provider query or refund success is allowed", () => {
    const result = planRefundProviderQueryReconciliation(
      input({
        snapshot: {
          ...input().snapshot,
          providerQueryAllowed: true,
          refundSuccessState: true,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      blockCodes: ["UNSAFE_PROVIDER_QUERY_SNAPSHOT"],
    });
    expect(result.manualReviewHandoff).toBeUndefined();
    expectSafe(result);
  });

  it("blocks workflow or finance mutation requests before reconciliation handoff", () => {
    const result = planRefundProviderQueryReconciliation(
      input({
        safetyChecks: {
          ...input().safetyChecks,
          workflowExecutionRequested: true,
          financialMutationRequested: true,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      blockCodes: ["RUNTIME_MUTATION_REQUESTED"],
    });
    expect(result.manualReviewHandoff).toBeUndefined();
    expectSafe(result);
  });
});
