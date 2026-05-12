import {
  evaluateRefundStateMutationTerminalConflict,
  mapTerminalConflictToRuntimeAttemptIntent,
  RefundStateMutationRuntimeAttemptInput,
} from "..";

const terminalDecision = (
  overrides: Parameters<typeof evaluateRefundStateMutationTerminalConflict>[0] = {
    requestedAt: "2026-05-12T13:05:00.000Z",
    runtimeContext: {
      environment: "staging",
      evaluatorMode: "disabled",
      terminalLockRepositoryReady: true,
      operatorReviewQueueReady: true,
      evidenceDigestVersion: "refund-evidence-v1",
      failClosedReady: true,
    },
    currentRefund: {
      platformRefundId: "refund_platform_001",
      currentState: "processing",
    },
    incoming: {
      targetState: "succeeded",
      providerEvidenceDigest: "digest_provider_001",
      providerRefundReference: "wx_refund_001",
      merchantOrderReference: "pay_order_001",
      refundRequestReference: "refund_req_001",
      amountMinor: 128560,
      currency: "CNY",
      approvalPersistenceIdempotencyKey: "approval_persistence_001",
      auditPersistenceIdempotencyKey: "audit_persistence_001",
      workflowIdempotencyKey: "workflow_001",
      permissionEvidenceId: "perm_refund_terminal_001",
    },
  },
) => evaluateRefundStateMutationTerminalConflict(overrides);

const input = (
  terminalConflictDecision = terminalDecision(),
  overrides: Partial<RefundStateMutationRuntimeAttemptInput> = {},
): RefundStateMutationRuntimeAttemptInput => ({
  terminalConflictDecision,
  requestedAt: "2026-05-12T13:06:00.000Z",
  attemptContext: {
    environment: "staging",
    writerMode: "disabled",
    attemptRepositoryReady: true,
    idempotencyRepositoryReady: true,
    replayRepositoryReady: true,
    retryPolicyReady: true,
    failClosedReady: true,
    metadata: {
      safeAttemptNote: "kept",
      rawProviderPayload: "{raw-provider-payload-must-not-leak}",
      productionDbUrl: "postgres://prod-db-must-not-leak",
      key: "generic-key-must-not-leak",
      terminalConflictDecision: "metadata-override-must-not-win",
      workflowAttempt: "metadata-override-must-not-win",
      attemptStatus: "metadata-override-must-not-win",
      attemptWriteAllowed: true,
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
      runtimeAttempt: "runtime-attempt-must-not-leak",
    },
  },
  ...overrides,
});

const expectSafe = (
  result: ReturnType<typeof mapTerminalConflictToRuntimeAttemptIntent>,
) => {
  expect(result).toMatchObject({
    attemptWriteAllowed: false,
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

  expect(serialized).not.toContain("{raw-provider-payload-must-not-leak}");
  expect(serialized).not.toContain("postgres://prod-db-must-not-leak");
  expect(serialized).not.toContain("generic-key-must-not-leak");
  expect(serialized).not.toContain("metadata-override-must-not-win");
  expect(serialized).not.toContain("\"attemptWriteAllowed\":true");
  expect(serialized).not.toContain("\"dbWriteAllowed\":true");
  expect(serialized).not.toContain("\"productionWriteAllowed\":true");
  expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  expect(serialized).not.toContain("\"stateMutationAllowed\":true");
  expect(serialized).not.toContain("\"refundSuccessState\":true");
  expect(serialized).not.toContain("execute-workflow-must-not-leak");
  expect(serialized).not.toContain("runtime-attempt-must-not-leak");
};

describe("mapTerminalConflictToRuntimeAttemptIntent", () => {
  it("records only a disabled runtime attempt intent", () => {
    const result = mapTerminalConflictToRuntimeAttemptIntent(input());

    expect(result).toMatchObject({
      decision: "runtime_attempt_intent_recorded",
      blockCodes: ["runtime_attempt_disabled"],
      runtimeAttemptIntent: {
        intentType: "refund_state_mutation_runtime_attempt_disabled",
        attemptStatus: "planned_disabled",
        platformRefundId: "refund_platform_001",
        incomingTargetState: "succeeded",
        providerEvidenceDigest: "digest_provider_001",
        attemptWriteAllowed: false,
        dbWriteAllowed: false,
        productionWriteAllowed: false,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        refundSuccessState: false,
      },
      auditEvent: {
        action: "refund_state_runtime_attempt_intent_recorded",
      },
    });
    expectSafe(result);
  });

  it("records duplicate no-op intent without workflow execution", () => {
    const duplicateDecision = terminalDecision({
      requestedAt: "2026-05-12T13:05:00.000Z",
      runtimeContext: {
        environment: "staging",
        evaluatorMode: "disabled",
        terminalLockRepositoryReady: true,
        operatorReviewQueueReady: true,
        evidenceDigestVersion: "refund-evidence-v1",
        failClosedReady: true,
      },
      currentRefund: {
        platformRefundId: "refund_platform_001",
        currentState: "succeeded",
        terminalMarker: {
          state: "succeeded",
          enteredAt: "2026-05-12T13:00:00.000Z",
          evidenceDigest: "digest_provider_001",
          stateOwnerEvidenceId: "owner_evidence_001",
        },
      },
      incoming: {
        targetState: "succeeded",
        providerEvidenceDigest: "digest_provider_001",
        providerRefundReference: "wx_refund_001",
        merchantOrderReference: "pay_order_001",
        refundRequestReference: "refund_req_001",
        amountMinor: 128560,
        currency: "CNY",
        approvalPersistenceIdempotencyKey: "approval_persistence_001",
        auditPersistenceIdempotencyKey: "audit_persistence_001",
        workflowIdempotencyKey: "workflow_001",
        permissionEvidenceId: "perm_refund_terminal_001",
      },
    });

    const result = mapTerminalConflictToRuntimeAttemptIntent(
      input(duplicateDecision),
    );

    expect(result).toMatchObject({
      decision: "runtime_attempt_duplicate_noop_recorded",
      runtimeAttemptIntent: {
        attemptStatus: "duplicate_noop_disabled",
      },
      auditEvent: {
        action: "refund_state_runtime_attempt_duplicate_noop_recorded",
      },
    });
    expectSafe(result);
  });

  it("records manual review intent without workflow execution", () => {
    const manualReviewDecision = terminalDecision({
      requestedAt: "2026-05-12T13:05:00.000Z",
      runtimeContext: {
        environment: "staging",
        evaluatorMode: "disabled",
        terminalLockRepositoryReady: true,
        operatorReviewQueueReady: true,
        evidenceDigestVersion: "refund-evidence-v1",
        failClosedReady: true,
      },
      currentRefund: {
        platformRefundId: "refund_platform_001",
        currentState: "succeeded",
        terminalMarker: {
          state: "succeeded",
          enteredAt: "2026-05-12T13:00:00.000Z",
          evidenceDigest: "digest_original",
          stateOwnerEvidenceId: "owner_evidence_001",
        },
      },
      incoming: {
        targetState: "failed_final",
        providerEvidenceDigest: "digest_conflicting",
        providerRefundReference: "wx_refund_001",
        merchantOrderReference: "pay_order_001",
        refundRequestReference: "refund_req_001",
        amountMinor: 128560,
        currency: "CNY",
        approvalPersistenceIdempotencyKey: "approval_persistence_001",
        auditPersistenceIdempotencyKey: "audit_persistence_001",
        workflowIdempotencyKey: "workflow_001",
        permissionEvidenceId: "perm_refund_terminal_001",
      },
    });

    const result = mapTerminalConflictToRuntimeAttemptIntent(
      input(manualReviewDecision),
    );

    expect(result).toMatchObject({
      decision: "runtime_attempt_manual_review_recorded",
      runtimeAttemptIntent: {
        attemptStatus: "manual_review_disabled",
      },
      auditEvent: {
        action: "refund_state_runtime_attempt_manual_review_recorded",
      },
    });
    expectSafe(result);
  });

  it("rejects blocked terminal conflict decisions", () => {
    const blockedDecision = terminalDecision({
      requestedAt: "2026-05-12T13:05:00.000Z",
      runtimeContext: {
        environment: "staging",
        evaluatorMode: "disabled",
        terminalLockRepositoryReady: false,
        operatorReviewQueueReady: true,
        evidenceDigestVersion: "refund-evidence-v1",
        failClosedReady: true,
      },
      currentRefund: {
        platformRefundId: "refund_platform_001",
        currentState: "processing",
      },
      incoming: {
        targetState: "succeeded",
        providerEvidenceDigest: "digest_provider_001",
        providerRefundReference: "wx_refund_001",
        merchantOrderReference: "pay_order_001",
        refundRequestReference: "refund_req_001",
        amountMinor: 128560,
        currency: "CNY",
        approvalPersistenceIdempotencyKey: "approval_persistence_001",
        auditPersistenceIdempotencyKey: "audit_persistence_001",
        workflowIdempotencyKey: "workflow_001",
        permissionEvidenceId: "perm_refund_terminal_001",
      },
    });

    const result = mapTerminalConflictToRuntimeAttemptIntent(
      input(blockedDecision),
    );

    expect(result).toMatchObject({
      decision: "runtime_attempt_input_rejected",
      blockCodes: [
        "runtime_attempt_disabled",
        "terminal_conflict_intent_missing",
      ],
    });
    expect(result.runtimeAttemptIntent).toBeUndefined();
    expectSafe(result);
  });

  it("blocks production writer modes", () => {
    const result = mapTerminalConflictToRuntimeAttemptIntent(
      input(terminalDecision(), {
        attemptContext: {
          ...input().attemptContext,
          environment: "production",
          writerMode: "db",
        },
      }),
    );

    expect(result.decision).toBe("runtime_attempt_blocked");
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "runtime_attempt_disabled",
        "writer_mode_ignored_until_go",
        "production_write_blocked",
      ]),
    );
    expect(result.runtimeAttemptIntent).toBeUndefined();
    expectSafe(result);
  });
});
