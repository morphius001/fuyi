import {
  evaluateRefundStateMutationTerminalConflict,
  mapRuntimeAttemptToRepositoryIntent,
  mapTerminalConflictToRuntimeAttemptIntent,
  RefundStateMutationRuntimeAttemptPersistenceRepositoryInput,
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

const runtimeAttemptDecision = () =>
  mapTerminalConflictToRuntimeAttemptIntent({
    terminalConflictDecision: terminalDecision(),
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
      },
    },
  });

const input = (
  decision = runtimeAttemptDecision(),
  overrides: Partial<RefundStateMutationRuntimeAttemptPersistenceRepositoryInput> = {},
): RefundStateMutationRuntimeAttemptPersistenceRepositoryInput => ({
  runtimeAttemptDecision: decision,
  requestedAt: "2026-05-12T13:08:00.000Z",
  repositoryContext: {
    environment: "staging",
    writerMode: "disabled",
    repositoryReady: true,
    idempotencyReplayReady: true,
    eventAppendOnlyReady: true,
    retryWindowReady: true,
    replayReadModelReady: true,
    metadata: {
      safeRepositoryNote: "kept",
      productionDbUrl: "postgres://prod-db-must-not-leak",
      key: "generic-key-must-not-leak",
      runtimeAttemptDecision: "metadata-override-must-not-win",
      terminalConflictDecision: "metadata-override-must-not-win",
      attemptStatus: "metadata-override-must-not-win",
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
      runtimeAttempt: "runtime-attempt-must-not-leak",
      workflowAttempt: "workflow-attempt-must-not-leak",
    },
  },
  ...overrides,
});

const expectSafe = (
  result: ReturnType<typeof mapRuntimeAttemptToRepositoryIntent>,
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
  expect(serialized).not.toContain("runtime-attempt-must-not-leak");
  expect(serialized).not.toContain("workflow-attempt-must-not-leak");
};

describe("mapRuntimeAttemptToRepositoryIntent", () => {
  it("records disabled runtime attempt repository intents without DB writes", () => {
    const result = mapRuntimeAttemptToRepositoryIntent(input());

    expect(result).toMatchObject({
      decision: "runtime_attempt_persistence_repository_intent_recorded",
      blockCodes: ["runtime_attempt_persistence_repository_disabled"],
      repositoryIntent: {
        intentType:
          "refund_state_mutation_runtime_attempt_persistence_repository_disabled",
        runtimeAttemptDecisionKey:
          "refund_state_mutation_runtime_attempt:refund_state_mutation_terminal_conflict:refund_platform_001:processing:succeeded:wx_refund_001:digest_provider_001:staging:disabled:staging:disabled",
        terminalConflictDecisionKey:
          "refund_state_mutation_terminal_conflict:refund_platform_001:processing:succeeded:wx_refund_001:digest_provider_001:staging:disabled",
        attemptStatus: "planned_disabled",
        platformRefundId: "refund_platform_001",
        incomingTargetState: "succeeded",
        providerEvidenceDigest: "digest_provider_001",
        repositoryWriteAllowed: false,
        dbWriteAllowed: false,
        productionWriteAllowed: false,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        refundSuccessState: false,
      },
      auditEvent: {
        action:
          "refund_state_runtime_attempt_persistence_repository_intent_recorded",
      },
    });
    expectSafe(result);
  });

  it("blocks production writer modes until a future Go decision", () => {
    const result = mapRuntimeAttemptToRepositoryIntent(
      input(runtimeAttemptDecision(), {
        repositoryContext: {
          environment: "production",
          writerMode: "db",
          repositoryReady: true,
          idempotencyReplayReady: true,
          eventAppendOnlyReady: true,
          retryWindowReady: true,
          replayReadModelReady: true,
          metadata: {},
        },
      }),
    );

    expect(result.decision).toBe(
      "runtime_attempt_persistence_repository_blocked",
    );
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "runtime_attempt_persistence_repository_disabled",
        "writer_mode_ignored_until_go",
        "production_write_blocked",
      ]),
    );
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("rejects runtime attempt decisions without intents", () => {
    const blockedAttempt = {
      ...runtimeAttemptDecision(),
      decision: "runtime_attempt_input_rejected" as const,
      runtimeAttemptIntent: undefined,
    };

    const result = mapRuntimeAttemptToRepositoryIntent(input(blockedAttempt));

    expect(result).toMatchObject({
      decision: "runtime_attempt_persistence_repository_input_rejected",
      blockCodes: [
        "runtime_attempt_persistence_repository_disabled",
        "runtime_attempt_intent_missing",
      ],
    });
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe runtime attempt decisions", () => {
    const unsafeAttempt = {
      ...runtimeAttemptDecision(),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof runtimeAttemptDecision>;

    const result = mapRuntimeAttemptToRepositoryIntent(input(unsafeAttempt));

    expect(result.decision).toBe(
      "runtime_attempt_persistence_repository_blocked",
    );
    expect(result.blockCodes).toContain("unsafe_runtime_attempt_decision");
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("records readiness block codes when repository prerequisites are missing", () => {
    const result = mapRuntimeAttemptToRepositoryIntent(
      input(runtimeAttemptDecision(), {
        repositoryContext: {
          environment: "staging",
          writerMode: "disabled",
          repositoryReady: false,
          idempotencyReplayReady: false,
          eventAppendOnlyReady: false,
          retryWindowReady: false,
          replayReadModelReady: false,
          metadata: {},
        },
      }),
    );

    expect(result.decision).toBe(
      "runtime_attempt_persistence_repository_intent_recorded",
    );
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "runtime_attempt_persistence_repository_disabled",
        "repository_missing",
        "idempotency_replay_missing",
        "event_append_only_missing",
        "retry_window_missing",
        "replay_read_model_missing",
      ]),
    );
    expect(result.auditEvent.metadata).toMatchObject({
      repositoryReady: false,
      idempotencyReplayReady: false,
      eventAppendOnlyReady: false,
      retryWindowReady: false,
      replayReadModelReady: false,
    });
    expectSafe(result);
  });
});
