import {
  mapApprovalPersistenceToRepositoryIntent,
  RefundStateMutationApprovalPersistenceDecision,
} from "..";

const approvalPersistenceDecision =
  (): RefundStateMutationApprovalPersistenceDecision => ({
    decision: "approval_persistence_intent_recorded",
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
    blockCodes: ["approval_persistence_disabled"],
    idempotencyKey:
      "refund_state_mutation_approval_persistence:approval_001:staging:disabled",
    persistenceIntent: {
      intentType: "refund_state_mutation_approval_persistence_disabled",
      approvalCandidateIdempotencyKey: "approval_candidate_001",
      targetState: "succeeded_shadow_reviewed",
      reviewerActorId: "admin_finance_reviewer_001",
      reviewerRole: "admin_finance_reviewer",
      permissionEvidenceId: "perm_repo_contract_001",
      approvalWriteAllowed: false,
      dbWriteAllowed: false,
      productionWriteAllowed: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    },
    auditEvent: {
      action: "refund_state_approval_persistence_intent_recorded",
      metadata: {
        safeApprovalNote: "kept",
        providerQueryPayload: "provider-query-must-not-leak",
      },
    },
  });

const map = (
  approvalPersistence = approvalPersistenceDecision(),
  overrides = {},
) =>
  mapApprovalPersistenceToRepositoryIntent({
    approvalPersistenceDecision: approvalPersistence,
    requestedAt: "2026-05-12T08:28:00.000Z",
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
        approvalPersistenceDecision: "metadata-override-must-not-win",
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
  result: ReturnType<typeof mapApprovalPersistenceToRepositoryIntent>,
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

describe("mapApprovalPersistenceToRepositoryIntent", () => {
  it("records disabled repository intents without DB writes", () => {
    const result = map();

    expect(result).toMatchObject({
      decision: "approval_persistence_repository_intent_recorded",
      blockCodes: ["approval_persistence_repository_disabled"],
      repositoryIntent: {
        intentType:
          "refund_state_mutation_approval_persistence_repository_disabled",
        approvalPersistenceIdempotencyKey:
          "refund_state_mutation_approval_persistence:approval_001:staging:disabled",
        approvalCandidateIdempotencyKey: "approval_candidate_001",
        targetState: "succeeded_shadow_reviewed",
        reviewerActorId: "admin_finance_reviewer_001",
        reviewerRole: "admin_finance_reviewer",
        permissionEvidenceId: "perm_repo_contract_001",
        repositoryWriteAllowed: false,
        dbWriteAllowed: false,
        productionWriteAllowed: false,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        refundSuccessState: false,
      },
      auditEvent: {
        action: "refund_state_approval_persistence_repository_intent_recorded",
      },
    });
    expectSafe(result);
  });

  it("blocks production writer modes until a future Go decision", () => {
    const result = map(approvalPersistenceDecision(), {
      environment: "production",
      writerMode: "db",
    });

    expect(result.decision).toBe("approval_persistence_repository_blocked");
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "approval_persistence_repository_disabled",
        "writer_mode_ignored_until_go",
        "production_write_blocked",
      ]),
    );
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("rejects approval persistence decisions without intents", () => {
    const result = map({
      ...approvalPersistenceDecision(),
      decision: "approval_persistence_input_rejected",
      persistenceIntent: undefined,
    });

    expect(result).toMatchObject({
      decision: "approval_persistence_repository_input_rejected",
      blockCodes: [
        "approval_persistence_repository_disabled",
        "approval_persistence_intent_missing",
      ],
    });
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe approval persistence decisions", () => {
    const result = map({
      ...approvalPersistenceDecision(),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof approvalPersistenceDecision>);

    expect(result.decision).toBe("approval_persistence_repository_blocked");
    expect(result.blockCodes).toContain(
      "unsafe_approval_persistence_decision",
    );
    expect(result.repositoryIntent).toBeUndefined();
    expectSafe(result);
  });

  it("records readiness block codes when repository prerequisites are missing", () => {
    const result = map(approvalPersistenceDecision(), {
      repositoryReady: false,
      idempotencyReplayReady: false,
      eventAppendOnlyReady: false,
      replayReadModelReady: false,
    });

    expect(result.decision).toBe(
      "approval_persistence_repository_intent_recorded",
    );
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "approval_persistence_repository_disabled",
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
