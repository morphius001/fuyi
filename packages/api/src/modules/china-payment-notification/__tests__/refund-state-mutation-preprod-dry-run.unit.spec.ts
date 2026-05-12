import {
  evaluateRefundStateMutationReadiness,
  mapAuditWriteIntentToWorkflowAdapterCommand,
  mapOperatorApprovalToRuntimeAdapterDecision,
  mapRefundReadinessToStateMutationShadowCommand,
  mapRefundShadowCommandToOperatorApproval,
  mapRuntimeAdapterToAuditWriteIntent,
  mapWorkflowAdapterCommandToPreprodDryRun,
  RefundStateMutationReadinessInput,
} from "..";

const readinessInput = (): RefundStateMutationReadinessInput => ({
  provider: "wechat_pay",
  source: "query_reconciliation",
  requestedAt: "2026-05-12T06:15:00.000Z",
  evidence: {
    verifierReady: true,
    payloadRedacted: true,
    inboxStable: true,
    handoffSafe: true,
    reconciliationComplete: true,
    manualReviewPolicyReady: true,
    manualReviewApproved: true,
    rollbackRunbookReady: true,
    sourceInboxId: "rinbox_dryrun_001",
    queryFollowUpId: "rqf_dryrun_001",
    reconciliationId: "rrec_dryrun_001",
  },
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_dryrun_001",
    providerRefundId: "wx_refund_dryrun_001",
    merchantOrderReference: "pay_order_dryrun_001",
    paymentProviderSessionId: "payses_dryrun_001",
    amountMinor: 128560,
    currency: "CNY",
    currentPlatformRefundState: "pending",
  },
  observedRefund: {
    providerRefundId: "wx_refund_dryrun_001",
    merchantOrderReference: "pay_order_dryrun_001",
    paymentProviderSessionId: "payses_dryrun_001",
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

const workflowDecision = () => {
  const readiness = evaluateRefundStateMutationReadiness(readinessInput());
  const shadow = mapRefundReadinessToStateMutationShadowCommand({
    readinessDecision: readiness,
    requestedAt: "2026-05-12T06:16:00.000Z",
    auditContext: {
      actorType: "admin",
      actorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
    },
  });
  const approval = mapRefundShadowCommandToOperatorApproval({
    shadowDecision: shadow,
    requestedAt: "2026-05-12T06:17:00.000Z",
    approvalContext: {
      actorType: "admin",
      actorId: "admin_finance_reviewer_001",
      reviewerRole: "admin_finance_reviewer",
      permissionEvidenceId: "perm_dryrun_001",
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
    requestedAt: "2026-05-12T06:18:00.000Z",
    runtimeContext: {
      environment: "staging",
      featureFlagEnabled: false,
      adapterRegistered: false,
      auditWriteAvailable: true,
      rollbackRunbookReady: true,
    },
  });
  const auditWrite = mapRuntimeAdapterToAuditWriteIntent({
    runtimeDecision: runtime,
    requestedAt: "2026-05-12T06:19:00.000Z",
    auditContext: {
      writerMode: "disabled",
      actorType: "system_job",
      actorId: "refund_audit_writer_shadow",
      auditAllowlistReady: true,
      idempotencyRepositoryReady: true,
    },
  });

  return mapAuditWriteIntentToWorkflowAdapterCommand({
    auditWriteDecision: auditWrite,
    requestedAt: "2026-05-12T06:20:00.000Z",
    workflowContext: {
      environment: "staging",
      adapterMode: "disabled",
      featureFlagEnabled: false,
      adapterRegistered: false,
      dryRunRepositoryReady: true,
      rollbackRunbookReady: true,
      metadata: {
        providerQueryPayload: "provider-query-must-not-leak",
      },
    },
  });
};

const map = (
  workflow = workflowDecision(),
  overrides = {},
) =>
  mapWorkflowAdapterCommandToPreprodDryRun({
    workflowDecision: workflow,
    requestedAt: "2026-05-12T06:21:00.000Z",
    dryRunContext: {
      environment: "preprod",
      mode: "disabled",
      featureFlagEnabled: false,
      sandboxProviderReady: true,
      productionDbBlocked: true,
      productionProviderBlocked: true,
      replayRunbookReady: true,
      metadata: {
        safeDryRunNote: "kept",
        productionDbUrl: "postgres://prod-db-must-not-leak",
        databaseUrl: "postgres://must-not-leak",
        apiKey: "api-key-must-not-leak",
        key: "generic-key-must-not-leak",
        blockCodes: ["metadata-override-must-not-win"],
        mode: "production",
        workflowDecision: "metadata-override-must-not-win",
        workflowAdapterIdempotencyKey: "metadata-override-must-not-win",
        auditWriteIntentIdempotencyKey: "metadata-override-must-not-win",
        runtimeAdapterIdempotencyKey: "metadata-override-must-not-win",
        approvalCandidateIdempotencyKey: "metadata-override-must-not-win",
        preprodDryRunEnabled: true,
        productionExecutionAllowed: true,
        executable: true,
        dryRunRequestPrepared: false,
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
        preprodDryRun: "preprod-dryrun-must-not-leak",
        dryRunRequest: "dryrun-request-must-not-leak",
        providerQueryPayload: "provider-query-must-not-leak",
        financialMutation: "financial-mutation-must-not-leak",
        logisticsMutation: "logistics-mutation-must-not-leak",
      },
      ...overrides,
    },
  });

const expectSafe = (
  result: ReturnType<typeof mapWorkflowAdapterCommandToPreprodDryRun>,
) => {
  expect(result).toMatchObject({
    preprodDryRunEnabled: false,
    productionExecutionAllowed: false,
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

  expect(serialized).not.toContain("postgres://prod-db-must-not-leak");
  expect(serialized).not.toContain("postgres://must-not-leak");
  expect(serialized).not.toContain("api-key-must-not-leak");
  expect(serialized).not.toContain("generic-key-must-not-leak");
  expect(serialized).not.toContain("metadata-override-must-not-win");
  expect(serialized).not.toContain("\"preprodDryRunEnabled\":true");
  expect(serialized).not.toContain("\"productionExecutionAllowed\":true");
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
  expect(serialized).not.toContain("preprod-dryrun-must-not-leak");
  expect(serialized).not.toContain("dryrun-request-must-not-leak");
  expect(serialized).not.toContain("provider-query-must-not-leak");
  expect(serialized).not.toContain("financial-mutation-must-not-leak");
  expect(serialized).not.toContain("logistics-mutation-must-not-leak");
};

describe("mapWorkflowAdapterCommandToPreprodDryRun", () => {
  it("records disabled preprod dry-run requests without execution", () => {
    const result = map();

    expect(result).toMatchObject({
      decision: "preprod_dry_run_request_recorded",
      blockCodes: ["preprod_dry_run_disabled"],
      dryRunRequestPrepared: true,
      dryRunRequest: {
        requestType: "refund_state_mutation_preprod_dry_run_disabled",
        targetState: "succeeded_shadow_reviewed",
        preprodDryRunEnabled: false,
        productionExecutionAllowed: false,
        workflowDryRunOnly: true,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        refundSuccessState: false,
      },
      auditEvent: {
        action: "refund_state_preprod_dry_run_request_recorded",
      },
    });
    expectSafe(result);
  });

  it("blocks production environment even when feature flags are on", () => {
    const result = map(workflowDecision(), {
      environment: "production",
      mode: "production",
      featureFlagEnabled: true,
      productionDbBlocked: false,
      productionProviderBlocked: false,
    });

    expect(result.decision).toBe("preprod_dry_run_blocked");
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "preprod_dry_run_disabled",
        "production_environment_blocked",
        "dry_run_mode_ignored_until_go",
        "feature_flag_ignored_until_go",
        "production_db_not_blocked",
        "production_provider_not_blocked",
      ]),
    );
    expect(result.dryRunRequest).toBeUndefined();
    expectSafe(result);
  });

  it("rejects workflow decisions without command candidates", () => {
    const result = map({
      ...workflowDecision(),
      decision: "workflow_adapter_input_rejected",
      commandCandidate: undefined,
    });

    expect(result).toMatchObject({
      decision: "preprod_dry_run_input_rejected",
      dryRunRequestPrepared: false,
      blockCodes: [
        "preprod_dry_run_disabled",
        "workflow_command_candidate_missing",
      ],
    });
    expect(result.dryRunRequest).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe workflow adapter decisions", () => {
    const result = map({
      ...workflowDecision(),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof workflowDecision>);

    expect(result.decision).toBe("preprod_dry_run_blocked");
    expect(result.blockCodes).toContain("unsafe_workflow_adapter_decision");
    expect(result.dryRunRequest).toBeUndefined();
    expectSafe(result);
  });
});
