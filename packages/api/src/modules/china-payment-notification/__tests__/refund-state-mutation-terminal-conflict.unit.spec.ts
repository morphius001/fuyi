import {
  evaluateRefundStateMutationTerminalConflict,
  RefundStateMutationTerminalConflictInput,
} from "..";

const input = (
  overrides: Partial<RefundStateMutationTerminalConflictInput> = {},
): RefundStateMutationTerminalConflictInput => ({
  requestedAt: "2026-05-12T12:40:00.000Z",
  runtimeContext: {
    environment: "staging",
    evaluatorMode: "disabled",
    terminalLockRepositoryReady: true,
    operatorReviewQueueReady: true,
    evidenceDigestVersion: "refund-evidence-v1",
    failClosedReady: true,
    metadata: {
      safeTerminalNote: "kept",
      rawProviderPayload: "{raw-provider-payload-must-not-leak}",
      databaseUrl: "postgres://prod-db-must-not-leak",
      key: "generic-key-must-not-leak",
      currentState: "metadata-override-must-not-win",
      targetState: "metadata-override-must-not-win",
      providerEvidenceDigest: "metadata-override-must-not-win",
      stateOwnerEvidenceId: "metadata-override-must-not-win",
      lockWriteAllowed: true,
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
      terminalLock: "terminal-lock-must-not-leak",
    },
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
    actorId: "system_refund_owner",
    reviewerId: "admin_refund_reviewer_001",
    permissionEvidenceId: "perm_refund_terminal_001",
  },
  ...overrides,
});

const expectSafe = (
  result: ReturnType<typeof evaluateRefundStateMutationTerminalConflict>,
) => {
  expect(result).toMatchObject({
    lockWriteAllowed: false,
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
  expect(serialized).not.toContain("\"lockWriteAllowed\":true");
  expect(serialized).not.toContain("\"dbWriteAllowed\":true");
  expect(serialized).not.toContain("\"productionWriteAllowed\":true");
  expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  expect(serialized).not.toContain("\"stateMutationAllowed\":true");
  expect(serialized).not.toContain("\"refundSuccessState\":true");
  expect(serialized).not.toContain("execute-workflow-must-not-leak");
  expect(serialized).not.toContain("terminal-lock-must-not-leak");
};

describe("evaluateRefundStateMutationTerminalConflict", () => {
  it("prepares only a disabled terminal conflict intent for non-terminal states", () => {
    const result = evaluateRefundStateMutationTerminalConflict(input());

    expect(result).toMatchObject({
      decision: "terminal_conflict_shadow_prepared",
      blockCodes: ["terminal_conflict_lock_disabled"],
      terminalConflictIntent: {
        intentType: "refund_state_mutation_terminal_conflict_disabled",
        platformRefundId: "refund_platform_001",
        currentState: "processing",
        incomingTargetState: "succeeded",
        conflictCode: "no_terminal_conflict",
        lockWriteAllowed: false,
        dbWriteAllowed: false,
        productionWriteAllowed: false,
        workflowExecutionAllowed: false,
        stateMutationAllowed: false,
        refundSuccessState: false,
      },
      auditEvent: {
        action: "refund_state_terminal_conflict_shadow_prepared",
      },
    });
    expectSafe(result);
  });

  it("returns duplicate no-op for matching terminal state and digest", () => {
    const result = evaluateRefundStateMutationTerminalConflict(
      input({
        currentRefund: {
          platformRefundId: "refund_platform_001",
          currentState: "succeeded",
          terminalMarker: {
            state: "succeeded",
            enteredAt: "2026-05-12T12:30:00.000Z",
            evidenceDigest: "digest_provider_001",
            stateOwnerEvidenceId: "owner_evidence_001",
          },
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "terminal_conflict_duplicate_noop",
      terminalConflictIntent: {
        conflictCode: "duplicate_noop",
        currentEvidenceDigest: "digest_provider_001",
      },
      auditEvent: {
        action: "refund_state_terminal_conflict_duplicate_noop",
      },
    });
    expectSafe(result);
  });

  it("requires manual review for terminal target or digest conflicts", () => {
    const result = evaluateRefundStateMutationTerminalConflict(
      input({
        currentRefund: {
          platformRefundId: "refund_platform_001",
          currentState: "succeeded",
          terminalMarker: {
            state: "succeeded",
            enteredAt: "2026-05-12T12:30:00.000Z",
            evidenceDigest: "digest_original",
            stateOwnerEvidenceId: "owner_evidence_001",
          },
        },
        incoming: {
          ...input().incoming,
          targetState: "failed_final",
          providerEvidenceDigest: "digest_conflicting",
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "terminal_conflict_manual_review",
      terminalConflictIntent: {
        conflictCode: "manual_review",
        currentEvidenceDigest: "digest_original",
        incomingTargetState: "failed_final",
      },
      auditEvent: {
        action: "refund_state_terminal_conflict_manual_review",
      },
    });
    expectSafe(result);
  });

  it("blocks missing terminal marker evidence and missing permission evidence", () => {
    const result = evaluateRefundStateMutationTerminalConflict(
      input({
        currentRefund: {
          platformRefundId: "refund_platform_001",
          currentState: "manual_closed",
        },
        incoming: {
          ...input().incoming,
          permissionEvidenceId: undefined,
        },
      }),
    );

    expect(result.decision).toBe("terminal_conflict_blocked");
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "terminal_marker_missing",
        "state_owner_evidence_missing",
        "current_evidence_digest_missing",
        "permission_evidence_missing",
      ]),
    );
    expect(result.terminalConflictIntent).toBeUndefined();
    expectSafe(result);
  });

  it("blocks production and non-disabled evaluator modes", () => {
    const result = evaluateRefundStateMutationTerminalConflict(
      input({
        runtimeContext: {
          ...input().runtimeContext,
          environment: "production",
          evaluatorMode: "db",
        },
      }),
    );

    expect(result.decision).toBe("terminal_conflict_blocked");
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "evaluator_mode_ignored_until_go",
        "production_write_blocked",
      ]),
    );
    expect(result.terminalConflictIntent).toBeUndefined();
    expectSafe(result);
  });
});
