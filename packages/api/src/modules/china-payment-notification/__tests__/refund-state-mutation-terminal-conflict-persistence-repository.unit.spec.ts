import {
  evaluateRefundStateMutationTerminalConflict,
  mapTerminalConflictToRepositoryIntent,
  RefundStateMutationTerminalConflictPersistenceRepositoryInput,
} from "..";

const terminalDecision = (
  overrides: Parameters<typeof evaluateRefundStateMutationTerminalConflict>[0] = {
    requestedAt: "2026-05-13T00:10:00.000Z",
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
  decision = terminalDecision(),
  overrides: Partial<RefundStateMutationTerminalConflictPersistenceRepositoryInput> = {},
): RefundStateMutationTerminalConflictPersistenceRepositoryInput => ({
  terminalConflictDecision: decision,
  requestedAt: "2026-05-13T00:12:00.000Z",
  repositoryContext: {
    environment: "staging",
    writerMode: "disabled",
    repositoryReady: true,
    uniquenessReplayReady: true,
    eventAppendOnlyReady: true,
    terminalMarkerSnapshotReady: true,
    operatorReviewReadModelReady: true,
    references: {
      terminalMarkerKey: "terminal_marker_001",
      terminalMarkerVersion: "terminal-marker-v1",
      providerEvidenceDigestVersion: "refund-evidence-v1",
      approvalPersistenceIdempotencyKey: "approval_persistence_001",
      auditPersistenceIdempotencyKey: "audit_persistence_001",
      workflowIdempotencyKey: "workflow_001",
      runtimeAttemptPersistenceIdempotencyKey: "runtime_attempt_001",
      featureFlagSnapshotKey: "feature_flag_001",
      stateOwnerEvidenceKey: "state_owner_001",
      actorReference: "actor_admin_001",
      reviewerReference: "reviewer_admin_002",
    },
    metadata: {
      safeRepositoryNote: "kept",
      productionDbUrl: "postgres://prod-db-must-not-leak",
      key: "generic-key-must-not-leak",
      terminalConflictDecision: "metadata-override-must-not-win",
      terminalMarkerKey: "metadata-override-must-not-win",
      providerEvidenceDigest: "metadata-override-must-not-win",
      repositoryWriteAllowed: true,
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
      terminalConflict: "terminal-conflict-must-not-leak",
    },
  },
  ...overrides,
});

const expectSafe = (
  result: ReturnType<typeof mapTerminalConflictToRepositoryIntent>,
) => {
  expect(result).toMatchObject({
    repositoryWriteAllowed: false,
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
  expect(serialized).not.toContain("generic-key-must-not-leak");
  expect(serialized).not.toContain("metadata-override-must-not-win");
  expect(serialized).not.toContain("\"repositoryWriteAllowed\":true");
  expect(serialized).not.toContain("\"dbWriteAllowed\":true");
  expect(serialized).not.toContain("\"productionWriteAllowed\":true");
  expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  expect(serialized).not.toContain("\"stateMutationAllowed\":true");
  expect(serialized).not.toContain("\"refundSuccessState\":true");
  expect(serialized).not.toContain("execute-workflow-must-not-leak");
  expect(serialized).not.toContain("terminal-conflict-must-not-leak");
};

describe("mapTerminalConflictToRepositoryIntent", () => {
  it("records disabled terminal conflict repository intents without DB writes", () => {
    const result = mapTerminalConflictToRepositoryIntent(input());

    expect(result).toMatchObject({
      decision: "terminal_conflict_persistence_repository_intent_recorded",
      blockCodes: ["terminal_conflict_persistence_repository_disabled"],
      repositoryIntent: {
        intentType:
          "refund_state_mutation_terminal_conflict_persistence_repository_disabled",
        terminalConflictDecisionKey:
          "refund_state_mutation_terminal_conflict:refund_platform_001:processing:succeeded:wx_refund_001:digest_provider_001:staging:disabled",
        conflictStatus: "shadow_prepared_disabled",
        conflictCode: "no_terminal_conflict",
        platformRefundId: "refund_platform_001",
        currentRefundState: "processing",
        incomingTargetState: "succeeded",
        providerEvidenceDigest: "digest_provider_001",
        terminalMarkerKey: "terminal_marker_001",
        providerEvidenceDigestVersion: "refund-evidence-v1",
        repositoryWriteAllowed: false,
        dbWriteAllowed: false,
        productionWriteAllowed: false,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        refundSuccessState: false,
      },
      auditEvent: {
        action:
          "refund_state_terminal_conflict_persistence_repository_intent_recorded",
      },
    });
    expectSafe(result);
  });

  it("blocks production writer modes until a future Go decision", () => {
    const result = mapTerminalConflictToRepositoryIntent(
      input(terminalDecision(), {
        repositoryContext: {
          environment: "production",
          writerMode: "db",
          repositoryReady: true,
          uniquenessReplayReady: true,
          eventAppendOnlyReady: true,
          terminalMarkerSnapshotReady: true,
          operatorReviewReadModelReady: true,
          references: {},
          metadata: {},
        },
      }),
    );

    expect(result.decision).toBe(
      "terminal_conflict_persistence_repository_blocked",
    );
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "terminal_conflict_persistence_repository_disabled",
        "writer_mode_ignored_until_go",
        "production_write_blocked",
      ]),
    );
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("rejects blocked terminal conflict decisions without intents", () => {
    const blockedDecision = terminalDecision({
      requestedAt: "2026-05-13T00:10:00.000Z",
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

    const result = mapTerminalConflictToRepositoryIntent(input(blockedDecision));

    expect(result).toMatchObject({
      decision: "terminal_conflict_persistence_repository_input_rejected",
      blockCodes: [
        "terminal_conflict_persistence_repository_disabled",
        "terminal_conflict_intent_missing",
      ],
    });
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe terminal conflict decisions", () => {
    const unsafeDecision = {
      ...terminalDecision(),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof terminalDecision>;

    const result = mapTerminalConflictToRepositoryIntent(input(unsafeDecision));

    expect(result.decision).toBe(
      "terminal_conflict_persistence_repository_blocked",
    );
    expect(result.blockCodes).toContain("unsafe_terminal_conflict_decision");
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("records readiness block codes when repository prerequisites are missing", () => {
    const result = mapTerminalConflictToRepositoryIntent(
      input(terminalDecision(), {
        repositoryContext: {
          environment: "staging",
          writerMode: "disabled",
          repositoryReady: false,
          uniquenessReplayReady: false,
          eventAppendOnlyReady: false,
          terminalMarkerSnapshotReady: false,
          operatorReviewReadModelReady: false,
          references: {},
          metadata: {},
        },
      }),
    );

    expect(result.decision).toBe(
      "terminal_conflict_persistence_repository_intent_recorded",
    );
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "terminal_conflict_persistence_repository_disabled",
        "repository_missing",
        "uniqueness_replay_missing",
        "event_append_only_missing",
        "terminal_marker_snapshot_missing",
        "operator_review_read_model_missing",
      ]),
    );
    expectSafe(result);
  });
});
