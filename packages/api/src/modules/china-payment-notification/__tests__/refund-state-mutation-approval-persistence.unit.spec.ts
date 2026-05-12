import {
  evaluateRefundStateMutationReadiness,
  mapOperatorApprovalToPersistenceIntent,
  mapRefundReadinessToStateMutationShadowCommand,
  mapRefundShadowCommandToOperatorApproval,
  RefundStateMutationReadinessInput,
} from "..";

const readinessInput = (): RefundStateMutationReadinessInput => ({
  provider: "wechat_pay",
  source: "query_reconciliation",
  requestedAt: "2026-05-12T07:15:00.000Z",
  evidence: {
    verifierReady: true,
    payloadRedacted: true,
    inboxStable: true,
    handoffSafe: true,
    reconciliationComplete: true,
    manualReviewPolicyReady: true,
    manualReviewApproved: true,
    rollbackRunbookReady: true,
    sourceInboxId: "rinbox_approval_persist_001",
    queryFollowUpId: "rqf_approval_persist_001",
    reconciliationId: "rrec_approval_persist_001",
  },
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_approval_persist_001",
    providerRefundId: "wx_refund_approval_persist_001",
    merchantOrderReference: "pay_order_approval_persist_001",
    paymentProviderSessionId: "payses_approval_persist_001",
    amountMinor: 128560,
    currency: "CNY",
    currentPlatformRefundState: "pending",
  },
  observedRefund: {
    providerRefundId: "wx_refund_approval_persist_001",
    merchantOrderReference: "pay_order_approval_persist_001",
    paymentProviderSessionId: "payses_approval_persist_001",
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
    requestedAt: "2026-05-12T07:16:00.000Z",
    auditContext: {
      actorType: "admin",
      actorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
    },
  });

  return mapRefundShadowCommandToOperatorApproval({
    shadowDecision: shadow,
    requestedAt: "2026-05-12T07:17:00.000Z",
    approvalContext: {
      actorType: "admin",
      actorId: "admin_finance_reviewer_001",
      reviewerRole: "admin_finance_reviewer",
      permissionEvidenceId: "perm_approval_persist_001",
      initiatedByActorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
      metadata: {
        providerQueryPayload: "provider-query-must-not-leak",
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
  overrides = {},
) =>
  mapOperatorApprovalToPersistenceIntent({
    approvalDecision: approval,
    requestedAt: "2026-05-12T07:18:00.000Z",
    persistenceContext: {
      environment: "staging",
      writerMode: "disabled",
      approvalRepositoryReady: true,
      idempotencyRepositoryReady: true,
      appendOnlyAuditReady: true,
      metadata: {
        safePersistenceNote: "kept",
        productionDbUrl: "postgres://prod-db-must-not-leak",
        databaseUrl: "postgres://must-not-leak",
        apiKey: "api-key-must-not-leak",
        key: "generic-key-must-not-leak",
        blockCodes: ["metadata-override-must-not-win"],
        writerMode: "db",
        approvalDecision: "metadata-override-must-not-win",
        approvalCandidateIdempotencyKey: "metadata-override-must-not-win",
        approvalWriteAllowed: true,
        dbWriteAllowed: true,
        productionWriteAllowed: true,
        executable: true,
        workflowExecutionAllowed: true,
        stateMutationAllowed: true,
        runtimeMutationBlocked: false,
        refundSuccessState: true,
        settlementMutationAllowed: true,
        commissionMutationAllowed: true,
        payoutMutationAllowed: true,
        permissionMutationAllowed: true,
        fulfillmentMutationAllowed: true,
        logisticsMutationAllowed: true,
        executeWorkflow: "execute-workflow-must-not-leak",
        approvalPersistence: "approval-persistence-must-not-leak",
        persistenceIntent: "persistence-intent-must-not-leak",
        providerQueryPayload: "provider-query-must-not-leak",
        financialMutation: "financial-mutation-must-not-leak",
        logisticsMutation: "logistics-mutation-must-not-leak",
      },
      ...overrides,
    },
  });

const expectSafe = (
  result: ReturnType<typeof mapOperatorApprovalToPersistenceIntent>,
) => {
  expect(result).toMatchObject({
    approvalWriteAllowed: false,
    dbWriteAllowed: false,
    productionWriteAllowed: false,
    executable: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    settlementMutationAllowed: false,
    commissionMutationAllowed: false,
    payoutMutationAllowed: false,
    permissionMutationAllowed: false,
    fulfillmentMutationAllowed: false,
    logisticsMutationAllowed: false,
  });

  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("postgres://prod-db-must-not-leak");
  expect(serialized).not.toContain("postgres://must-not-leak");
  expect(serialized).not.toContain("api-key-must-not-leak");
  expect(serialized).not.toContain("generic-key-must-not-leak");
  expect(serialized).not.toContain("metadata-override-must-not-win");
  expect(serialized).not.toContain("\"approvalWriteAllowed\":true");
  expect(serialized).not.toContain("\"dbWriteAllowed\":true");
  expect(serialized).not.toContain("\"productionWriteAllowed\":true");
  expect(serialized).not.toContain("\"executable\":true");
  expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  expect(serialized).not.toContain("\"stateMutationAllowed\":true");
  expect(serialized).not.toContain("\"runtimeMutationBlocked\":false");
  expect(serialized).not.toContain("\"refundSuccessState\":true");
  expect(serialized).not.toContain("\"settlementMutationAllowed\":true");
  expect(serialized).not.toContain("\"commissionMutationAllowed\":true");
  expect(serialized).not.toContain("\"payoutMutationAllowed\":true");
  expect(serialized).not.toContain("\"permissionMutationAllowed\":true");
  expect(serialized).not.toContain("\"fulfillmentMutationAllowed\":true");
  expect(serialized).not.toContain("\"logisticsMutationAllowed\":true");
  expect(serialized).not.toContain("execute-workflow-must-not-leak");
  expect(serialized).not.toContain("approval-persistence-must-not-leak");
  expect(serialized).not.toContain("persistence-intent-must-not-leak");
  expect(serialized).not.toContain("provider-query-must-not-leak");
  expect(serialized).not.toContain("financial-mutation-must-not-leak");
  expect(serialized).not.toContain("logistics-mutation-must-not-leak");
};

describe("mapOperatorApprovalToPersistenceIntent", () => {
  it("records disabled approval persistence intents without DB writes", () => {
    const result = map();

    expect(result).toMatchObject({
      decision: "approval_persistence_intent_recorded",
      blockCodes: ["approval_persistence_disabled"],
      persistenceIntent: {
        intentType: "refund_state_mutation_approval_persistence_disabled",
        targetState: "succeeded_shadow_reviewed",
        reviewerActorId: "admin_finance_reviewer_001",
        reviewerRole: "admin_finance_reviewer",
        permissionEvidenceId: "perm_approval_persist_001",
        approvalWriteAllowed: false,
        dbWriteAllowed: false,
        productionWriteAllowed: false,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        refundSuccessState: false,
      },
      auditEvent: {
        action: "refund_state_approval_persistence_intent_recorded",
      },
    });
    expectSafe(result);
  });

  it("blocks production writer modes until a future Go decision", () => {
    const result = map(approvalDecision(), {
      environment: "production",
      writerMode: "db",
    });

    expect(result.decision).toBe("approval_persistence_blocked");
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "approval_persistence_disabled",
        "writer_mode_ignored_until_go",
        "production_write_blocked",
      ]),
    );
    expect(result.persistenceIntent).toBeUndefined();
    expectSafe(result);
  });

  it("rejects approval decisions without candidates", () => {
    const result = map({
      ...approvalDecision(),
      decision: "operator_approval_rejected",
      approvalCandidate: undefined,
    });

    expect(result).toMatchObject({
      decision: "approval_persistence_input_rejected",
      blockCodes: [
        "approval_persistence_disabled",
        "operator_approval_candidate_missing",
      ],
    });
    expect(result.persistenceIntent).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe approval decisions", () => {
    const result = map({
      ...approvalDecision(),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof approvalDecision>);

    expect(result.decision).toBe("approval_persistence_blocked");
    expect(result.blockCodes).toContain("unsafe_operator_approval_decision");
    expect(result.persistenceIntent).toBeUndefined();
    expectSafe(result);
  });
});
