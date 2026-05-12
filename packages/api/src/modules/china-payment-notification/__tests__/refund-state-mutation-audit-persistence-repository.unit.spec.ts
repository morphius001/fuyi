import {
  mapAuditPersistenceToRepositoryIntent,
  RefundStateMutationAuditPersistenceDecision,
} from "..";

const auditPersistenceDecision =
  (): RefundStateMutationAuditPersistenceDecision => ({
    decision: "audit_persistence_intent_recorded",
    auditWriteAllowed: false,
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
    blockCodes: ["audit_persistence_disabled"],
    idempotencyKey:
      "refund_state_mutation_audit_persistence:approval_001:staging:disabled",
    auditPersistenceIntent: {
      intentType: "refund_state_mutation_audit_persistence_disabled",
      approvalPersistenceIdempotencyKey:
        "refund_state_mutation_approval_persistence:approval_001:staging:disabled",
      approvalCandidateIdempotencyKey: "approval_candidate_001",
      targetState: "succeeded_shadow_reviewed",
      auditWriteAllowed: false,
      dbWriteAllowed: false,
      productionWriteAllowed: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    },
    auditEvent: {
      action: "refund_state_audit_persistence_intent_recorded",
      metadata: {
        safeAuditNote: "kept",
        providerQueryPayload: "provider-query-must-not-leak",
      },
    },
  });

const map = (
  auditPersistence = auditPersistenceDecision(),
  overrides = {},
) =>
  mapAuditPersistenceToRepositoryIntent({
    auditPersistenceDecision: auditPersistence,
    requestedAt: "2026-05-12T08:38:00.000Z",
    repositoryContext: {
      environment: "staging",
      writerMode: "disabled",
      repositoryReady: true,
      idempotencyReplayReady: true,
      eventAppendOnlyReady: true,
      replayReadModelReady: true,
      metadata: {
        safeRepositoryNote: "kept",
        productionDbUrl: "postgres://prod-db-must-not-leak",
        databaseUrl: "postgres://must-not-leak",
        apiKey: "api-key-must-not-leak",
        key: "generic-key-must-not-leak",
        blockCodes: ["metadata-override-must-not-win"],
        writerMode: "db",
        auditPersistenceDecision: "metadata-override-must-not-win",
        auditPersistenceIdempotencyKey: "metadata-override-must-not-win",
        approvalPersistenceIdempotencyKey: "metadata-override-must-not-win",
        approvalCandidateIdempotencyKey: "metadata-override-must-not-win",
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
        repositoryIntent: "repository-intent-must-not-leak",
        providerQueryPayload: "provider-query-must-not-leak",
        financialMutation: "financial-mutation-must-not-leak",
        logisticsMutation: "logistics-mutation-must-not-leak",
      },
      ...overrides,
    },
  });

const expectSafe = (
  result: ReturnType<typeof mapAuditPersistenceToRepositoryIntent>,
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
  expect(serialized).not.toContain("postgres://must-not-leak");
  expect(serialized).not.toContain("api-key-must-not-leak");
  expect(serialized).not.toContain("generic-key-must-not-leak");
  expect(serialized).not.toContain("metadata-override-must-not-win");
  expect(serialized).not.toContain("\"repositoryWriteAllowed\":true");
  expect(serialized).not.toContain("\"dbWriteAllowed\":true");
  expect(serialized).not.toContain("\"productionWriteAllowed\":true");
  expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  expect(serialized).not.toContain("\"stateMutationAllowed\":true");
  expect(serialized).not.toContain("\"refundSuccessState\":true");
  expect(serialized).not.toContain("execute-workflow-must-not-leak");
  expect(serialized).not.toContain("repository-intent-must-not-leak");
  expect(serialized).not.toContain("provider-query-must-not-leak");
  expect(serialized).not.toContain("financial-mutation-must-not-leak");
  expect(serialized).not.toContain("logistics-mutation-must-not-leak");
};

describe("mapAuditPersistenceToRepositoryIntent", () => {
  it("records disabled repository intents without DB writes", () => {
    const result = map();

    expect(result).toMatchObject({
      decision: "audit_persistence_repository_intent_recorded",
      blockCodes: ["audit_persistence_repository_disabled"],
      repositoryIntent: {
        intentType:
          "refund_state_mutation_audit_persistence_repository_disabled",
        auditPersistenceIdempotencyKey:
          "refund_state_mutation_audit_persistence:approval_001:staging:disabled",
        approvalPersistenceIdempotencyKey:
          "refund_state_mutation_approval_persistence:approval_001:staging:disabled",
        approvalCandidateIdempotencyKey: "approval_candidate_001",
        targetState: "succeeded_shadow_reviewed",
        repositoryWriteAllowed: false,
        dbWriteAllowed: false,
        productionWriteAllowed: false,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        refundSuccessState: false,
      },
      auditEvent: {
        action: "refund_state_audit_persistence_repository_intent_recorded",
      },
    });
    expectSafe(result);
  });

  it("blocks production writer modes until a future Go decision", () => {
    const result = map(auditPersistenceDecision(), {
      environment: "production",
      writerMode: "db",
    });

    expect(result.decision).toBe("audit_persistence_repository_blocked");
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "audit_persistence_repository_disabled",
        "writer_mode_ignored_until_go",
        "production_write_blocked",
      ]),
    );
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("rejects audit persistence decisions without intents", () => {
    const result = map({
      ...auditPersistenceDecision(),
      decision: "audit_persistence_input_rejected",
      auditPersistenceIntent: undefined,
    });

    expect(result).toMatchObject({
      decision: "audit_persistence_repository_input_rejected",
      blockCodes: [
        "audit_persistence_repository_disabled",
        "audit_persistence_intent_missing",
      ],
    });
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe audit persistence decisions", () => {
    const result = map({
      ...auditPersistenceDecision(),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof auditPersistenceDecision>);

    expect(result.decision).toBe("audit_persistence_repository_blocked");
    expect(result.blockCodes).toContain("unsafe_audit_persistence_decision");
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("records readiness block codes when repository prerequisites are missing", () => {
    const result = map(auditPersistenceDecision(), {
      repositoryReady: false,
      idempotencyReplayReady: false,
      eventAppendOnlyReady: false,
      replayReadModelReady: false,
    });

    expect(result.decision).toBe("audit_persistence_repository_intent_recorded");
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "audit_persistence_repository_disabled",
        "repository_missing",
        "idempotency_replay_missing",
        "event_append_only_missing",
        "replay_read_model_missing",
      ]),
    );
    expect(result.auditEvent.metadata).toMatchObject({
      repositoryReady: false,
      idempotencyReplayReady: false,
      eventAppendOnlyReady: false,
      replayReadModelReady: false,
    });
    expectSafe(result);
  });
});
