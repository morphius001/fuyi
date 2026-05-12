import {
  evaluateRefundStateMutationReadiness,
  mapRefundReadinessToStateMutationShadowCommand,
  mapRefundShadowCommandToOperatorApproval,
  RefundStateMutationOperatorApprovalInput,
  RefundStateMutationReadinessInput,
} from "..";

const readinessInput = (
  overrides: Partial<RefundStateMutationReadinessInput> = {},
): RefundStateMutationReadinessInput => ({
  provider: "wechat_pay",
  source: "query_reconciliation",
  requestedAt: "2026-05-12T02:15:00.000Z",
  evidence: {
    verifierReady: true,
    payloadRedacted: true,
    inboxStable: true,
    handoffSafe: true,
    reconciliationComplete: true,
    manualReviewPolicyReady: true,
    manualReviewApproved: true,
    rollbackRunbookReady: true,
    sourceInboxId: "rinbox_approval_001",
    queryFollowUpId: "rqf_approval_001",
    reconciliationId: "rrec_approval_001",
  },
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_approval_001",
    providerRefundId: "wx_refund_approval_001",
    merchantOrderReference: "pay_order_approval_001",
    paymentProviderSessionId: "payses_approval_001",
    amountMinor: 128560,
    currency: "CNY",
    currentPlatformRefundState: "pending",
  },
  observedRefund: {
    providerRefundId: "wx_refund_approval_001",
    merchantOrderReference: "pay_order_approval_001",
    paymentProviderSessionId: "payses_approval_001",
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
      workflowExecution: "must-not-leak",
      refundStateMutation: "must-not-leak",
    },
  },
  ...overrides,
});

const shadowDecision = () =>
  mapRefundReadinessToStateMutationShadowCommand({
    readinessDecision: evaluateRefundStateMutationReadiness(readinessInput()),
    requestedAt: "2026-05-12T02:16:00.000Z",
    auditContext: {
      actorType: "admin",
      actorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
      metadata: {
      shadowSafeNote: "kept",
      providerQuery: "generic-query-must-not-leak",
      providerQueryPayload: "generic-query-payload-must-not-leak",
      providerRefundQuery: "must-not-leak",
      refundSuccessState: true,
      },
    },
  });

const approvalInput = (
  overrides: Partial<RefundStateMutationOperatorApprovalInput> = {},
): RefundStateMutationOperatorApprovalInput => ({
  shadowDecision: shadowDecision(),
  requestedAt: "2026-05-12T02:17:00.000Z",
  approvalContext: {
    actorType: "admin",
    actorId: "admin_finance_reviewer_001",
    reviewerRole: "admin_finance_reviewer",
    permissionEvidenceId: "perm_refund_state_approval_001",
    initiatedByActorId: "admin_refund_reviewer_001",
    targetState: "succeeded_shadow_reviewed",
    metadata: {
      safeApprovalNote: "kept",
      databaseUrl: "postgres://must-not-leak",
      executable: true,
      workflowExecutionAllowed: true,
      stateMutationAllowed: true,
      runtimeMutationBlocked: false,
      refundSuccessState: true,
      operatorApprovalRecorded: true,
      financialMutationAllowed: true,
      permissionMutationAllowed: true,
      fulfillmentMutationAllowed: true,
      logisticsMutationAllowed: true,
      providerQueryAllowed: true,
      networkRequestAllowed: true,
      providerRequest: "generic-request-must-not-leak",
      providerQuery: "generic-query-must-not-leak",
      providerRequestPayload: "generic-request-payload-must-not-leak",
      providerQueryPayload: "generic-query-payload-must-not-leak",
      providerRefundRequestPayload: "refund-request-payload-must-not-leak",
      providerRefundQueryPayload: "refund-query-payload-must-not-leak",
      financialMutation: "must-not-leak",
      settlementMutation: "must-not-leak",
      commissionMutation: "must-not-leak",
      payoutMutation: "must-not-leak",
      settlementAdjustment: "must-not-leak",
      commissionAdjustment: "must-not-leak",
      payoutAdjustment: "must-not-leak",
      fulfillmentMutation: "must-not-leak",
      logisticsMutation: "must-not-leak",
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
  ...overrides,
});

const expectSafe = (
  result: ReturnType<typeof mapRefundShadowCommandToOperatorApproval>,
) => {
  expect(result).toMatchObject({
    executable: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
  });

  const serialized = JSON.stringify(result);
  const serializedMetadata = JSON.stringify(result.auditEvent.metadata);

  expect(serialized).not.toContain("signature_should_not_leak");
  expect(serialized).not.toContain("secret_should_not_leak");
  expect(serialized).not.toContain("postgres://must-not-leak");
  expect(serialized).not.toContain("\"executable\":true");
  expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  expect(serialized).not.toContain("\"stateMutationAllowed\":true");
  expect(serialized).not.toContain("\"runtimeMutationBlocked\":false");
  expect(serialized).not.toContain("\"refundSuccessState\":true");
  expect(serialized).not.toContain("\"financialMutationAllowed\":true");
  expect(serialized).not.toContain("\"permissionMutationAllowed\":true");
  expect(serialized).not.toContain("\"fulfillmentMutationAllowed\":true");
  expect(serialized).not.toContain("\"logisticsMutationAllowed\":true");
  expect(serialized).not.toContain("\"providerQueryAllowed\":true");
  expect(serialized).not.toContain("\"networkRequestAllowed\":true");
  expect(serializedMetadata).not.toContain("\"operatorApprovalRecorded\":true");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("generic-request-must-not-leak");
  expect(serialized).not.toContain("generic-query-must-not-leak");
  expect(serialized).not.toContain("generic-request-payload-must-not-leak");
  expect(serialized).not.toContain("generic-query-payload-must-not-leak");
  expect(serialized).not.toContain("refund-request-payload-must-not-leak");
  expect(serialized).not.toContain("refund-query-payload-must-not-leak");
  expect(serialized).not.toContain("providerRefundQuery");
  expect(serialized).not.toContain("workflowExecution\":\"must-not-leak");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("financialMutation\":\"must-not-leak");
  expect(serialized).not.toContain("settlementMutation");
  expect(serialized).not.toContain("commissionMutation");
  expect(serialized).not.toContain("payoutMutation");
  expect(serialized).not.toContain("settlementAdjustment");
  expect(serialized).not.toContain("commissionAdjustment");
  expect(serialized).not.toContain("payoutAdjustment");
  expect(serialized).not.toContain("fulfillmentMutation\":\"must-not-leak");
  expect(serialized).not.toContain("logisticsMutation\":\"must-not-leak");
};

describe("mapRefundShadowCommandToOperatorApproval", () => {
  it("records non-executable operator approval candidates", () => {
    const result = mapRefundShadowCommandToOperatorApproval(approvalInput());

    expect(result).toMatchObject({
      decision: "operator_approval_candidate_recorded",
      operatorApprovalRecorded: true,
      blockCodes: [],
      approvalCandidate: {
        candidateType: "refund_state_mutation_operator_approval",
        shadowOnly: true,
        targetState: "succeeded_shadow_reviewed",
        localRefundCommandKey: "refund_cmd_approval_001",
        providerRefundId: "wx_refund_approval_001",
        amountMinor: 128560,
        currency: "CNY",
        reviewerActorId: "admin_finance_reviewer_001",
        reviewerRole: "admin_finance_reviewer",
        permissionEvidenceId: "perm_refund_state_approval_001",
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        financialMutationAllowed: false,
        fulfillmentMutationAllowed: false,
        logisticsMutationAllowed: false,
      },
      auditEvent: {
        action: "refund_state_operator_approval_candidate_recorded",
      },
    });
    expectSafe(result);
  });

  it("blocks system jobs and vendors from approving state mutation", () => {
    const systemJobResult = mapRefundShadowCommandToOperatorApproval(
      approvalInput({
        approvalContext: {
          ...approvalInput().approvalContext,
          actorType: "system_job",
        },
      }),
    );
    const vendorResult = mapRefundShadowCommandToOperatorApproval(
      approvalInput({
        approvalContext: {
          ...approvalInput().approvalContext,
          actorType: "vendor",
        },
      }),
    );

    expect(systemJobResult).toMatchObject({
      decision: "operator_approval_blocked",
      operatorApprovalRecorded: false,
      blockCodes: ["operator_actor_not_admin"],
    });
    expect(vendorResult.blockCodes).toContain("operator_actor_not_admin");
    expect(systemJobResult.approvalCandidate).toBeUndefined();
    expect(vendorResult.approvalCandidate).toBeUndefined();
    expectSafe(systemJobResult);
    expectSafe(vendorResult);
  });

  it("blocks same actor approval and missing permission evidence", () => {
    const result = mapRefundShadowCommandToOperatorApproval(
      approvalInput({
        approvalContext: {
          ...approvalInput().approvalContext,
          actorId: "admin_refund_reviewer_001",
          initiatedByActorId: "admin_refund_reviewer_001",
          permissionEvidenceId: undefined,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "operator_approval_blocked",
      operatorApprovalRecorded: false,
    });
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "permission_evidence_missing",
        "same_actor_initiated_and_approved",
      ]),
    );
    expect(result.approvalCandidate).toBeUndefined();
    expectSafe(result);
  });

  it("records reviewer rejection without approval candidates", () => {
    const result = mapRefundShadowCommandToOperatorApproval(
      approvalInput({
        evidence: {
          ...approvalInput().evidence,
          reviewerDecision: "needs_more_evidence",
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "operator_approval_rejected",
      operatorApprovalRecorded: false,
      blockCodes: ["reviewer_needs_more_evidence"],
    });
    expect(result.approvalCandidate).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe shadow decisions before approval", () => {
    const unsafeShadow = {
      ...shadowDecision(),
      stateMutationAllowed: true,
    } as unknown as ReturnType<typeof shadowDecision>;
    const result = mapRefundShadowCommandToOperatorApproval(
      approvalInput({
        shadowDecision: unsafeShadow,
      }),
    );

    expect(result).toMatchObject({
      decision: "operator_approval_blocked",
      operatorApprovalRecorded: false,
      blockCodes: ["unsafe_shadow_decision"],
    });
    expect(result.approvalCandidate).toBeUndefined();
    expectSafe(result);
  });

  it("blocks runtime and side-effect mutation requests", () => {
    const result = mapRefundShadowCommandToOperatorApproval(
      approvalInput({
        evidence: {
          ...approvalInput().evidence,
          runtimeMutationRequested: true,
          financialMutationRequested: true,
          fulfillmentMutationRequested: true,
          logisticsMutationRequested: true,
        },
      }),
    );

    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "runtime_mutation_requested",
        "financial_mutation_requested",
        "fulfillment_mutation_requested",
        "logistics_mutation_requested",
      ]),
    );
    expect(result.approvalCandidate).toBeUndefined();
    expectSafe(result);
  });
});
