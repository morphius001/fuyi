import {
  createRefundStateMutationIsolatedPreprodQuerySurface,
  RefundStateMutationIsolatedPreprodQuerySurfaceInput,
} from "..";

const createInput = (): RefundStateMutationIsolatedPreprodQuerySurfaceInput => ({
  environment: {
    environment: "staging",
    isolatedPreprodVerified: true,
    evidenceKey: "isolated_preprod_evidence_001",
  },
  approvalRecords: [
    {
      id: "approval_record_001",
      approvalIdempotencyKey: "approval_persistence_001",
      platformRefundId: "refund_platform_001",
      providerName: "wechat_pay",
      providerRefundReference: "wx_refund_001",
      merchantOrderReference: "pay_order_001",
      refundRequestReference: "refund_request_001",
      targetState: "succeeded_shadow_reviewed",
      targetStateAuditLabel: "退款成功待复核",
      amountMinor: 128560,
      currency: "CNY",
      requestActorId: "admin_requester_001",
      requestActorType: "admin",
      reviewerActorId: "admin_reviewer_001",
      reviewerRole: "admin_finance_reviewer",
      permissionEvidenceId: "perm_001",
      ownershipEvidenceId: "ownership_001",
      readinessDecisionKey: "readiness_001",
      shadowCommandKey: "shadow_command_001",
      runtimeAdapterDecisionKey: "runtime_adapter_001",
      featureFlagSnapshotKey: "feature_flag_001",
      status: "approved",
      decisionReasonRedacted: "Approval captured for isolated preprod review.",
      createdAt: "2026-05-13T00:00:00.000Z",
      decidedAt: "2026-05-13T00:02:00.000Z",
      expiresAt: "2026-05-14T00:00:00.000Z",
    },
  ],
  approvalEvents: [
    {
      id: "approval_event_001",
      approvalId: "approval_record_001",
      action: "manual_review_handoff",
      actorId: "operator_001",
      actorType: "operator",
      metadataRedacted: {
        safeNote: "kept",
        rawPayload: "must-not-leak",
        nested: {
          privateKey: "must-not-leak",
          safeNested: "kept",
        },
      },
      createdAt: "2026-05-13T00:03:00.000Z",
    },
  ],
  auditRecords: [
    {
      id: "audit_record_001",
      auditPersistenceIdempotencyKey: "audit_persistence_001",
      approvalPersistenceIdempotencyKey: "approval_persistence_001",
      approvalCandidateIdempotencyKey: "approval_candidate_001",
      targetState: "succeeded_shadow_reviewed",
      status: "recorded",
      auditAction: "approval_recorded",
      auditReasonRedacted: "Audit trail recorded without executable runtime.",
      createdAt: "2026-05-13T00:04:00.000Z",
    },
  ],
  auditEvents: [
    {
      id: "audit_event_001",
      auditPersistenceId: "audit_record_001",
      action: "audit_persistence_recorded",
      actorId: "system_001",
      actorType: "system",
      metadataRedacted: {
        safeAuditNote: "kept",
        databaseUrl: "must-not-leak",
      },
      createdAt: "2026-05-13T00:05:00.000Z",
    },
  ],
  runtimeAttemptRecords: [
    {
      id: "runtime_record_001",
      runtimeAttemptPersistenceIdempotencyKey: "runtime_attempt_001",
      workflowIdempotencyKey: "workflow_001",
      platformRefundId: "refund_platform_001",
      providerName: "wechat_pay",
      providerRefundReference: "wx_refund_001",
      merchantOrderReference: "pay_order_001",
      refundRequestReference: "refund_request_001",
      targetState: "succeeded_shadow_reviewed",
      targetStateAuditLabel: "退款成功待复核",
      attemptStatus: "planned_disabled",
      attemptNumber: 1,
      providerEvidenceDigest: "digest_001",
      digestVersion: "refund-evidence-v1",
      approvalPersistenceIdempotencyKey: "approval_persistence_001",
      auditPersistenceIdempotencyKey: "audit_persistence_001",
      terminalConflictDecisionKey: "terminal_decision_001",
      featureFlagSnapshotKey: "feature_flag_001",
      environment: "staging",
      operatorVisibleReason:
        "Pending isolated preprod operator review before any runtime can proceed.",
      createdAt: "2026-05-13T00:06:00.000Z",
      startedAt: "2026-05-13T00:06:10.000Z",
      finishedAt: "2026-05-13T00:06:20.000Z",
    },
  ],
  runtimeAttemptEvents: [
    {
      id: "runtime_event_001",
      runtimeAttemptPersistenceId: "runtime_record_001",
      action: "attempt_persistence_recorded",
      actorId: "system_001",
      actorType: "system",
      metadataRedacted: {
        safeRuntimeNote: "kept",
        providerRequestPayload: "must-not-leak",
      },
      createdAt: "2026-05-13T00:06:30.000Z",
    },
  ],
  terminalConflictSnapshots: [
    {
      id: "terminal_record_001",
      terminalConflictPersistenceIdempotencyKey: "terminal_conflict_001",
      terminalConflictDecisionKey: "terminal_decision_001",
      platformRefundId: "refund_platform_001",
      currentRefundState: "processing",
      incomingTargetState: "succeeded",
      conflictStatus: "shadow_prepared_disabled",
      conflictCode: "no_terminal_conflict",
      terminalMarkerKey: "terminal_marker_001",
      terminalMarkerVersion: "terminal-marker-v1",
      providerEvidenceDigest: "digest_001",
      providerEvidenceDigestVersion: "refund-evidence-v1",
      approvalPersistenceIdempotencyKey: "approval_persistence_001",
      auditPersistenceIdempotencyKey: "audit_persistence_001",
      workflowIdempotencyKey: "workflow_001",
      runtimeAttemptPersistenceIdempotencyKey: "runtime_attempt_001",
      featureFlagSnapshotKey: "feature_flag_001",
      stateOwnerEvidenceKey: "owner_001",
      actorReference: "actor_admin_001",
      reviewerReference: "reviewer_admin_001",
      conflictDetectedAt: "2026-05-13T00:07:00.000Z",
      createdAt: "2026-05-13T00:07:10.000Z",
    },
  ],
  terminalConflictEvents: [
    {
      id: "terminal_event_001",
      terminalConflictPersistenceId: "terminal_record_001",
      action: "terminal_conflict_snapshot_recorded",
      actorId: "system_001",
      actorType: "system",
      metadataRedacted: {
        safeTerminalNote: "kept",
        terminalMarkerKey: "must-not-leak",
      },
      createdAt: "2026-05-13T00:07:20.000Z",
    },
  ],
});

describe("createRefundStateMutationIsolatedPreprodQuerySurface", () => {
  it("builds a redacted operator review case from platform refund id", () => {
    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(
      createInput(),
    );

    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "review_case",
      currentReviewStatusLabel: "operator_review_ready",
      platformRefundId: "refund_platform_001",
      providerName: "wechat_pay",
      providerRefundReference: "wx_refund_001",
      featureFlagSnapshotKey: "feature_flag_001",
      duplicateOutcome: false,
      replayOutcome: false,
      manualReviewRequired: false,
      crossReferences: {
        approvalPersistenceIdempotencyKey: "approval_persistence_001",
        auditPersistenceIdempotencyKey: "audit_persistence_001",
        runtimeAttemptPersistenceIdempotencyKey: "runtime_attempt_001",
        terminalConflictPersistenceIdempotencyKey: "terminal_conflict_001",
        workflowIdempotencyKey: "workflow_001",
        terminalMarkerKey: "terminal_marker_001",
      },
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("must-not-leak");
  });

  it("returns the same review case across all supported query entrypoints", () => {
    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(
      createInput(),
    );

    const byPlatform = surface.reviewCaseByPlatformRefundId("refund_platform_001");
    const byApproval =
      surface.reviewCaseByApprovalPersistenceIdempotencyKey(
        "approval_persistence_001",
      );
    const byRuntime =
      surface.reviewCaseByRuntimeAttemptPersistenceIdempotencyKey(
        "runtime_attempt_001",
      );
    const byTerminal =
      surface.reviewCaseByTerminalConflictPersistenceIdempotencyKey(
        "terminal_conflict_001",
      );
    const byProvider = surface.reviewCaseByProviderRefundReference(
      "wechat_pay",
      "wx_refund_001",
    );

    expect(byApproval).toMatchObject({
      resultType: "review_case",
      crossReferences: byPlatform.resultType === "review_case"
        ? byPlatform.crossReferences
        : {},
    });
    expect(byRuntime).toMatchObject({
      resultType: "review_case",
      crossReferences: byPlatform.resultType === "review_case"
        ? byPlatform.crossReferences
        : {},
    });
    expect(byTerminal).toMatchObject({
      resultType: "review_case",
      crossReferences: byPlatform.resultType === "review_case"
        ? byPlatform.crossReferences
        : {},
    });
    expect(byProvider).toMatchObject({
      resultType: "review_case",
      crossReferences: byPlatform.resultType === "review_case"
        ? byPlatform.crossReferences
        : {},
    });
  });

  it("fails closed when required cross references are missing", () => {
    const input = createInput();
    input.terminalConflictSnapshots = [
      {
        ...input.terminalConflictSnapshots[0],
        runtimeAttemptPersistenceIdempotencyKey: undefined,
        terminalMarkerKey: undefined,
      },
    ];

    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(input);
    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "incomplete",
      blockCode: "missing_cross_reference",
      missingEvidence: expect.arrayContaining([
        "runtime_attempt_persistence_idempotency_key",
        "terminal_marker_key",
        "runtime_attempt_record",
      ]),
    });
  });

  it("blocks cross reference mismatches instead of composing an unsafe case", () => {
    const input = createInput();
    input.runtimeAttemptRecords = [
      {
        ...input.runtimeAttemptRecords[0],
        providerRefundReference: "wx_refund_other",
      },
    ];

    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(input);
    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "incomplete",
      blockCode: "cross_reference_mismatch",
      missingEvidence: expect.arrayContaining(["provider_refund_reference"]),
    });
  });

  it("maps retryable failed runtime attempts to a stable review status label", () => {
    const input = createInput();
    input.runtimeAttemptRecords = [
      {
        ...input.runtimeAttemptRecords[0],
        attemptStatus: "retryable_failed",
        failureCode: "provider_timeout",
        failureReasonRedacted: "Provider callback evidence needs replay.",
        operatorVisibleReason: "Provider timeout captured for isolated preprod replay.",
      },
    ];

    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(input);
    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "review_case",
      currentReviewStatusLabel: "retryable_failure_recorded",
      blockCode: "provider_timeout",
      operatorVisibleReason:
        "Provider timeout captured for isolated preprod replay.",
    });
  });

  it("blocks queries when isolated preprod proof is missing", () => {
    const input = createInput();
    input.environment = {
      environment: "staging",
      isolatedPreprodVerified: false,
    };

    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(input);
    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "blocked",
      blockCode: "isolated_preprod_environment_unverified",
    });
  });
});
