import {
  evaluateRefundStateMutationReadiness,
  mapAuditWriteIntentToWorkflowAdapterCommand,
  mapOperatorApprovalToRuntimeAdapterDecision,
  mapRefundReadinessToStateMutationShadowCommand,
  mapRefundShadowCommandToOperatorApproval,
  mapRuntimeAdapterToAuditWriteIntent,
  RefundStateMutationReadinessInput,
} from "..";

const readinessInput = (): RefundStateMutationReadinessInput => ({
  provider: "wechat_pay",
  source: "query_reconciliation",
  requestedAt: "2026-05-12T05:15:00.000Z",
  evidence: {
    verifierReady: true,
    payloadRedacted: true,
    inboxStable: true,
    handoffSafe: true,
    reconciliationComplete: true,
    manualReviewPolicyReady: true,
    manualReviewApproved: true,
    rollbackRunbookReady: true,
    sourceInboxId: "rinbox_workflow_001",
    queryFollowUpId: "rqf_workflow_001",
    reconciliationId: "rrec_workflow_001",
  },
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_workflow_001",
    providerRefundId: "wx_refund_workflow_001",
    merchantOrderReference: "pay_order_workflow_001",
    paymentProviderSessionId: "payses_workflow_001",
    amountMinor: 128560,
    currency: "CNY",
    currentPlatformRefundState: "pending",
  },
  observedRefund: {
    providerRefundId: "wx_refund_workflow_001",
    merchantOrderReference: "pay_order_workflow_001",
    paymentProviderSessionId: "payses_workflow_001",
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

const auditWriteDecision = () => {
  const readiness = evaluateRefundStateMutationReadiness(readinessInput());
  const shadow = mapRefundReadinessToStateMutationShadowCommand({
    readinessDecision: readiness,
    requestedAt: "2026-05-12T05:16:00.000Z",
    auditContext: {
      actorType: "admin",
      actorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
    },
  });
  const approval = mapRefundShadowCommandToOperatorApproval({
    shadowDecision: shadow,
    requestedAt: "2026-05-12T05:17:00.000Z",
    approvalContext: {
      actorType: "admin",
      actorId: "admin_finance_reviewer_001",
      reviewerRole: "admin_finance_reviewer",
      permissionEvidenceId: "perm_workflow_001",
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
  const runtime = mapOperatorApprovalToRuntimeAdapterDecision({
    approvalDecision: approval,
    requestedAt: "2026-05-12T05:18:00.000Z",
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

  return mapRuntimeAdapterToAuditWriteIntent({
    runtimeDecision: runtime,
    requestedAt: "2026-05-12T05:19:00.000Z",
    auditContext: {
      writerMode: "disabled",
      actorType: "system_job",
      actorId: "refund_audit_writer_shadow",
      auditAllowlistReady: true,
      idempotencyRepositoryReady: true,
      metadata: {
        safeAuditNote: "kept",
        providerRequestPayload: "provider-request-must-not-leak",
      },
    },
  });
};

const map = (
  auditWrite = auditWriteDecision(),
  overrides = {},
) =>
  mapAuditWriteIntentToWorkflowAdapterCommand({
    auditWriteDecision: auditWrite,
    requestedAt: "2026-05-12T05:20:00.000Z",
    workflowContext: {
      environment: "staging",
      adapterMode: "disabled",
      featureFlagEnabled: false,
      adapterRegistered: false,
      dryRunRepositoryReady: true,
      rollbackRunbookReady: true,
      metadata: {
        safeWorkflowNote: "kept",
        databaseUrl: "postgres://must-not-leak",
        dbUrl: "postgres://db-url-must-not-leak",
        apiKey: "api-key-must-not-leak",
        key: "generic-key-must-not-leak",
        blockCodes: ["metadata-override-must-not-win"],
        adapterMode: "registered",
        auditWriteDecision: "metadata-override-must-not-win",
        auditWriteIntentIdempotencyKey: "metadata-override-must-not-win",
        runtimeAdapterIdempotencyKey: "metadata-override-must-not-win",
        approvalCandidateIdempotencyKey: "metadata-override-must-not-win",
        auditWriteAllowed: true,
        dbWriteAllowed: true,
        adapterEnabled: true,
        environmentAllowed: true,
        executable: true,
        workflowCommandPrepared: false,
        workflowDryRunOnly: false,
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
        workflowAdapter: "workflow-adapter-must-not-leak",
        workflowCommand: "workflow-command-must-not-leak",
        providerQueryPayload: "provider-query-must-not-leak",
        financialMutation: "financial-mutation-must-not-leak",
        logisticsMutation: "logistics-mutation-must-not-leak",
      },
      ...overrides,
    },
  });

const expectSafe = (
  result: ReturnType<typeof mapAuditWriteIntentToWorkflowAdapterCommand>,
) => {
  expect(result).toMatchObject({
    adapterEnabled: false,
    environmentAllowed: false,
    executable: false,
    workflowDryRunOnly: true,
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

  expect(serialized).not.toContain("postgres://must-not-leak");
  expect(serialized).not.toContain("postgres://db-url-must-not-leak");
  expect(serialized).not.toContain("api-key-must-not-leak");
  expect(serialized).not.toContain("generic-key-must-not-leak");
  expect(serialized).not.toContain("metadata-override-must-not-win");
  expect(serialized).not.toContain("\"auditWriteAllowed\":true");
  expect(serialized).not.toContain("\"dbWriteAllowed\":true");
  expect(serialized).not.toContain("\"adapterEnabled\":true");
  expect(serialized).not.toContain("\"environmentAllowed\":true");
  expect(serialized).not.toContain("\"executable\":true");
  expect(serialized).not.toContain("\"workflowDryRunOnly\":false");
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
  expect(serialized).not.toContain("workflow-adapter-must-not-leak");
  expect(serialized).not.toContain("workflow-command-must-not-leak");
  expect(serialized).not.toContain("provider-request-must-not-leak");
  expect(serialized).not.toContain("provider-query-must-not-leak");
  expect(serialized).not.toContain("financial-mutation-must-not-leak");
  expect(serialized).not.toContain("settlement-mutation-must-not-leak");
  expect(serialized).not.toContain("logistics-mutation-must-not-leak");
};

describe("mapAuditWriteIntentToWorkflowAdapterCommand", () => {
  it("records disabled workflow command candidates without executing workflows", () => {
    const result = map();

    expect(result).toMatchObject({
      decision: "workflow_adapter_command_candidate_recorded",
      blockCodes: ["workflow_adapter_disabled"],
      workflowCommandPrepared: true,
      commandCandidate: {
        commandType: "refund_state_mutation_workflow_adapter_disabled",
        targetState: "succeeded_shadow_reviewed",
        workflowCommandPrepared: true,
        workflowDryRunOnly: true,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        refundSuccessState: false,
      },
      auditEvent: {
        action: "refund_state_workflow_adapter_command_candidate_recorded",
      },
    });
    expectSafe(result);
  });

  it("ignores feature flags and registered adapters until a future Go decision", () => {
    const result = map(auditWriteDecision(), {
      adapterMode: "registered",
      featureFlagEnabled: true,
      adapterRegistered: true,
    });

    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "workflow_adapter_disabled",
        "adapter_mode_ignored_until_go",
        "feature_flag_ignored_until_go",
        "adapter_registration_ignored_until_go",
      ]),
    );
    expect(result.auditEvent.metadata).toMatchObject({
      adapterMode: "registered",
      featureFlagEnabled: true,
      adapterRegistered: true,
      auditWriteDecision: "audit_write_intent_recorded",
      blockCodes: expect.arrayContaining([
        "adapter_mode_ignored_until_go",
      ]),
    });
    expectSafe(result);
  });

  it("rejects audit write decisions without audit write intents", () => {
    const result = map({
      ...auditWriteDecision(),
      decision: "audit_write_input_rejected",
      auditWriteIntent: undefined,
    });

    expect(result).toMatchObject({
      decision: "workflow_adapter_input_rejected",
      workflowCommandPrepared: false,
      blockCodes: [
        "workflow_adapter_disabled",
        "audit_write_intent_missing",
      ],
    });
    expect(result.commandCandidate).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe audit write decisions", () => {
    const result = map({
      ...auditWriteDecision(),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof auditWriteDecision>);

    expect(result.decision).toBe("workflow_adapter_blocked");
    expect(result.blockCodes).toContain("unsafe_audit_write_decision");
    expect(result.commandCandidate).toBeUndefined();
    expectSafe(result);
  });
});
