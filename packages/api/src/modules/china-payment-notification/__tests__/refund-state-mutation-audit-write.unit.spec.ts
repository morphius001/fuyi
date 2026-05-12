import {
  evaluateRefundStateMutationReadiness,
  mapOperatorApprovalToRuntimeAdapterDecision,
  mapRefundReadinessToStateMutationShadowCommand,
  mapRefundShadowCommandToOperatorApproval,
  mapRuntimeAdapterToAuditWriteIntent,
  RefundStateMutationReadinessInput,
} from "..";

const readinessInput = (): RefundStateMutationReadinessInput => ({
  provider: "wechat_pay",
  source: "query_reconciliation",
  requestedAt: "2026-05-12T04:15:00.000Z",
  evidence: {
    verifierReady: true,
    payloadRedacted: true,
    inboxStable: true,
    handoffSafe: true,
    reconciliationComplete: true,
    manualReviewPolicyReady: true,
    manualReviewApproved: true,
    rollbackRunbookReady: true,
    sourceInboxId: "rinbox_audit_001",
    queryFollowUpId: "rqf_audit_001",
    reconciliationId: "rrec_audit_001",
  },
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_audit_001",
    providerRefundId: "wx_refund_audit_001",
    merchantOrderReference: "pay_order_audit_001",
    paymentProviderSessionId: "payses_audit_001",
    amountMinor: 128560,
    currency: "CNY",
    currentPlatformRefundState: "pending",
  },
  observedRefund: {
    providerRefundId: "wx_refund_audit_001",
    merchantOrderReference: "pay_order_audit_001",
    paymentProviderSessionId: "payses_audit_001",
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

const runtimeDecision = () => {
  const readiness = evaluateRefundStateMutationReadiness(readinessInput());
  const shadow = mapRefundReadinessToStateMutationShadowCommand({
    readinessDecision: readiness,
    requestedAt: "2026-05-12T04:16:00.000Z",
    auditContext: {
      actorType: "admin",
      actorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
    },
  });
  const approval = mapRefundShadowCommandToOperatorApproval({
    shadowDecision: shadow,
    requestedAt: "2026-05-12T04:17:00.000Z",
    approvalContext: {
      actorType: "admin",
      actorId: "admin_finance_reviewer_001",
      reviewerRole: "admin_finance_reviewer",
      permissionEvidenceId: "perm_audit_001",
      initiatedByActorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
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

  return mapOperatorApprovalToRuntimeAdapterDecision({
    approvalDecision: approval,
    requestedAt: "2026-05-12T04:18:00.000Z",
    runtimeContext: {
      environment: "staging",
      featureFlagEnabled: false,
      adapterRegistered: false,
      auditWriteAvailable: true,
      rollbackRunbookReady: true,
      metadata: {
        providerQueryPayload: "provider-query-must-not-leak",
        settlementMutation: "settlement-mutation-must-not-leak",
      },
    },
  });
};

const map = (
  runtime = runtimeDecision(),
  overrides = {},
) =>
  mapRuntimeAdapterToAuditWriteIntent({
    runtimeDecision: runtime,
    requestedAt: "2026-05-12T04:19:00.000Z",
    auditContext: {
      writerMode: "disabled",
      actorType: "system_job",
      actorId: "refund_audit_writer_shadow",
      auditAllowlistReady: true,
      idempotencyRepositoryReady: true,
      metadata: {
        safeAuditNote: "kept",
        databaseUrl: "postgres://must-not-leak",
        dbUrl: "postgres://db-url-must-not-leak",
        apiKey: "api-key-must-not-leak",
        key: "generic-key-must-not-leak",
        blockCodes: ["metadata-override-must-not-win"],
        writerMode: "db",
        runtimeDecision: "metadata-override-must-not-win",
        runtimeAdapterIdempotencyKey: "metadata-override-must-not-win",
        auditWriteAllowed: true,
        dbWriteAllowed: true,
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
        auditWrite: "audit-write-must-not-leak",
        dbWrite: "db-write-must-not-leak",
        providerRequestPayload: "provider-request-must-not-leak",
        financialMutation: "financial-mutation-must-not-leak",
        logisticsMutation: "logistics-mutation-must-not-leak",
      },
      ...overrides,
    },
  });

const expectSafe = (
  result: ReturnType<typeof mapRuntimeAdapterToAuditWriteIntent>,
) => {
  expect(result).toMatchObject({
    auditWriteAllowed: false,
    dbWriteAllowed: false,
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
  expect(serialized).not.toContain("postgres://db-url-must-not-leak");
  expect(serialized).not.toContain("api-key-must-not-leak");
  expect(serialized).not.toContain("generic-key-must-not-leak");
  expect(serialized).not.toContain("metadata-override-must-not-win");
  expect(serialized).not.toContain("\"auditWriteAllowed\":true");
  expect(serialized).not.toContain("\"dbWriteAllowed\":true");
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
  expect(serialized).not.toContain("audit-write-must-not-leak");
  expect(serialized).not.toContain("db-write-must-not-leak");
  expect(serialized).not.toContain("provider-request-must-not-leak");
  expect(serialized).not.toContain("provider-query-must-not-leak");
  expect(serialized).not.toContain("financial-mutation-must-not-leak");
  expect(serialized).not.toContain("settlement-mutation-must-not-leak");
  expect(serialized).not.toContain("logistics-mutation-must-not-leak");
};

describe("mapRuntimeAdapterToAuditWriteIntent", () => {
  it("records disabled audit write intents without DB writes", () => {
    const result = map();

    expect(result).toMatchObject({
      decision: "audit_write_intent_recorded",
      blockCodes: ["audit_write_disabled"],
      auditWriteIntent: {
        intentType: "refund_state_mutation_audit_write_disabled",
        targetState: "succeeded_shadow_reviewed",
        auditWriteAllowed: false,
        dbWriteAllowed: false,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
      },
      auditEvent: {
        action: "refund_state_audit_write_intent_recorded",
      },
    });
    expectSafe(result);
  });

  it("ignores non-disabled writer modes until a future Go decision", () => {
    const result = map(runtimeDecision(), {
      writerMode: "db",
    });

    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "audit_write_disabled",
        "writer_mode_ignored_until_go",
      ]),
    );
    expect(result.auditEvent.metadata).toMatchObject({
      writerMode: "db",
      runtimeDecision: "runtime_adapter_disabled_recorded",
      blockCodes: expect.arrayContaining(["writer_mode_ignored_until_go"]),
    });
    expectSafe(result);
  });

  it("rejects runtime adapter decisions without adapter records", () => {
    const result = map({
      ...runtimeDecision(),
      decision: "runtime_adapter_input_rejected",
      adapterRecord: undefined,
    });

    expect(result).toMatchObject({
      decision: "audit_write_input_rejected",
      blockCodes: [
        "audit_write_disabled",
        "runtime_adapter_record_missing",
      ],
    });
    expect(result.auditWriteIntent).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe runtime adapter decisions", () => {
    const result = map({
      ...runtimeDecision(),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof runtimeDecision>);

    expect(result.decision).toBe("audit_write_blocked");
    expect(result.blockCodes).toContain("unsafe_runtime_adapter_decision");
    expect(result.auditWriteIntent).toBeUndefined();
    expectSafe(result);
  });
});
