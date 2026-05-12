import {
  evaluateRefundStateMutationReadiness,
  mapOperatorApprovalToRuntimeAdapterDecision,
  mapRefundReadinessToStateMutationShadowCommand,
  mapRefundShadowCommandToOperatorApproval,
  RefundStateMutationReadinessInput,
} from "..";

const readinessInput = (): RefundStateMutationReadinessInput => ({
  provider: "wechat_pay",
  source: "query_reconciliation",
  requestedAt: "2026-05-12T03:15:00.000Z",
  evidence: {
    verifierReady: true,
    payloadRedacted: true,
    inboxStable: true,
    handoffSafe: true,
    reconciliationComplete: true,
    manualReviewPolicyReady: true,
    manualReviewApproved: true,
    rollbackRunbookReady: true,
    sourceInboxId: "rinbox_runtime_001",
    queryFollowUpId: "rqf_runtime_001",
    reconciliationId: "rrec_runtime_001",
  },
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_runtime_001",
    providerRefundId: "wx_refund_runtime_001",
    merchantOrderReference: "pay_order_runtime_001",
    paymentProviderSessionId: "payses_runtime_001",
    amountMinor: 128560,
    currency: "CNY",
    currentPlatformRefundState: "pending",
  },
  observedRefund: {
    providerRefundId: "wx_refund_runtime_001",
    merchantOrderReference: "pay_order_runtime_001",
    paymentProviderSessionId: "payses_runtime_001",
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
  },
});

const approvalDecision = () => {
  const readiness = evaluateRefundStateMutationReadiness(readinessInput());
  const shadow = mapRefundReadinessToStateMutationShadowCommand({
    readinessDecision: readiness,
    requestedAt: "2026-05-12T03:16:00.000Z",
    auditContext: {
      actorType: "admin",
      actorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
    },
  });

  return mapRefundShadowCommandToOperatorApproval({
    shadowDecision: shadow,
    requestedAt: "2026-05-12T03:17:00.000Z",
    approvalContext: {
      actorType: "admin",
      actorId: "admin_finance_reviewer_001",
      reviewerRole: "admin_finance_reviewer",
      permissionEvidenceId: "perm_runtime_001",
      initiatedByActorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
      metadata: {
        providerRequestPayload: "provider-request-must-not-leak",
        financialMutation: "financial-mutation-must-not-leak",
      },
    },
    evidence: {
      manualReviewPolicyReady: true,
      reviewerDecision: "approved",
      permissionPassed: true,
      separationOfDutiesPassed: true,
      rollbackRunbookReady: true,
      auditAllowlistReady: true,
      financialSideEffectsIsolated: true,
      fulfillmentSideEffectsIsolated: true,
    },
  });
};

const map = (
  approval = approvalDecision(),
  overrides: Partial<Parameters<typeof mapOperatorApprovalToRuntimeAdapterDecision>[0]["runtimeContext"]> = {},
) =>
  mapOperatorApprovalToRuntimeAdapterDecision({
    approvalDecision: approval,
    requestedAt: "2026-05-12T03:18:00.000Z",
    runtimeContext: {
      environment: "staging",
      featureFlagEnabled: false,
      adapterRegistered: false,
      auditWriteAvailable: true,
      rollbackRunbookReady: true,
      metadata: {
        safeRuntimeNote: "kept",
        databaseUrl: "postgres://must-not-leak",
        enabled: true,
        environmentAllowed: true,
        executable: true,
        workflowExecutionAllowed: true,
        stateMutationAllowed: true,
        runtimeMutationBlocked: false,
        refundSuccessState: true,
        settlementMutationAllowed: true,
        commissionMutationAllowed: true,
        payoutMutationAllowed: true,
        fulfillmentMutationAllowed: true,
        logisticsMutationAllowed: true,
        providerQueryPayload: "provider-query-must-not-leak",
        settlementMutation: "settlement-mutation-must-not-leak",
        logisticsMutation: "logistics-mutation-must-not-leak",
      },
      ...overrides,
    },
  });

const expectSafe = (
  result: ReturnType<typeof mapOperatorApprovalToRuntimeAdapterDecision>,
) => {
  expect(result).toMatchObject({
    enabled: false,
    environmentAllowed: false,
    executable: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    settlementMutationAllowed: false,
    commissionMutationAllowed: false,
    payoutMutationAllowed: false,
    fulfillmentMutationAllowed: false,
    logisticsMutationAllowed: false,
  });

  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("postgres://must-not-leak");
  expect(serialized).not.toContain("\"enabled\":true");
  expect(serialized).not.toContain("\"environmentAllowed\":true");
  expect(serialized).not.toContain("\"executable\":true");
  expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  expect(serialized).not.toContain("\"stateMutationAllowed\":true");
  expect(serialized).not.toContain("\"runtimeMutationBlocked\":false");
  expect(serialized).not.toContain("\"refundSuccessState\":true");
  expect(serialized).not.toContain("\"settlementMutationAllowed\":true");
  expect(serialized).not.toContain("\"commissionMutationAllowed\":true");
  expect(serialized).not.toContain("\"payoutMutationAllowed\":true");
  expect(serialized).not.toContain("\"fulfillmentMutationAllowed\":true");
  expect(serialized).not.toContain("\"logisticsMutationAllowed\":true");
  expect(serialized).not.toContain("provider-request-must-not-leak");
  expect(serialized).not.toContain("provider-query-must-not-leak");
  expect(serialized).not.toContain("financial-mutation-must-not-leak");
  expect(serialized).not.toContain("settlement-mutation-must-not-leak");
  expect(serialized).not.toContain("logistics-mutation-must-not-leak");
};

describe("mapOperatorApprovalToRuntimeAdapterDecision", () => {
  it("records disabled adapter decisions without enabling mutation", () => {
    const result = map();

    expect(result).toMatchObject({
      decision: "runtime_adapter_disabled_recorded",
      blockCodes: ["runtime_adapter_disabled"],
      adapterRecord: {
        recordType: "refund_state_mutation_runtime_adapter_disabled",
        targetState: "succeeded_shadow_reviewed",
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        settlementMutationAllowed: false,
        commissionMutationAllowed: false,
        payoutMutationAllowed: false,
        fulfillmentMutationAllowed: false,
        logisticsMutationAllowed: false,
      },
      auditEvent: {
        action: "refund_state_runtime_adapter_disabled_recorded",
      },
    });
    expectSafe(result);
  });

  it("ignores feature flags and registration until a future Go decision", () => {
    const result = map(approvalDecision(), {
      environment: "production",
      featureFlagEnabled: true,
      adapterRegistered: true,
    });

    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "runtime_adapter_disabled",
        "feature_flag_ignored_until_go",
        "adapter_registration_ignored_until_go",
      ]),
    );
    expectSafe(result);
  });

  it("rejects non-candidate approval decisions", () => {
    const result = map(
      {
        ...approvalDecision(),
        decision: "operator_approval_rejected",
        approvalCandidate: undefined,
      },
    );

    expect(result).toMatchObject({
      decision: "runtime_adapter_input_rejected",
      blockCodes: [
        "runtime_adapter_disabled",
        "operator_approval_candidate_missing",
      ],
    });
    expect(result.adapterRecord).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe approval outputs", () => {
    const unsafeApproval = {
      ...approvalDecision(),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof approvalDecision>;
    const result = map(unsafeApproval);

    expect(result).toMatchObject({
      decision: "runtime_adapter_blocked",
    });
    expect(result.blockCodes).toContain("unsafe_operator_approval");
    expect(result.adapterRecord).toBeUndefined();
    expectSafe(result);
  });
});
