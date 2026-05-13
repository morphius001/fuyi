import {
  RefundStateMutationApprovalPersistenceEventRecord,
  RefundStateMutationApprovalPersistenceRecord,
} from "./refund-state-mutation-approval-persistence-repository";
import {
  RefundStateMutationAuditPersistenceEventRecord,
  RefundStateMutationAuditPersistenceRecord,
} from "./refund-state-mutation-audit-persistence-repository";
import {
  RefundStateMutationRuntimeAttemptPersistenceEventRecord,
  RefundStateMutationRuntimeAttemptPersistenceRecord,
} from "./refund-state-mutation-runtime-attempt-persistence-repository";
import {
  RefundStateMutationTerminalConflictPersistenceEventRecord,
  RefundStateMutationTerminalConflictPersistenceSnapshotRecord,
} from "./refund-state-mutation-terminal-conflict-persistence-repository";

type QueryKeyKind =
  | "platform_refund_id"
  | "approval_persistence_idempotency_key"
  | "runtime_attempt_persistence_idempotency_key"
  | "terminal_conflict_persistence_idempotency_key"
  | "provider_refund_reference";

export type RefundStateMutationIsolatedPreprodQuerySurfaceInput = {
  environment: {
    environment: "development" | "test" | "staging" | "production";
    isolatedPreprodVerified: boolean;
    evidenceKey?: string;
  };
  approvalRecords: RefundStateMutationApprovalPersistenceRecord[];
  approvalEvents?: RefundStateMutationApprovalPersistenceEventRecord[];
  auditRecords: RefundStateMutationAuditPersistenceRecord[];
  auditEvents?: RefundStateMutationAuditPersistenceEventRecord[];
  runtimeAttemptRecords: RefundStateMutationRuntimeAttemptPersistenceRecord[];
  runtimeAttemptEvents?: RefundStateMutationRuntimeAttemptPersistenceEventRecord[];
  terminalConflictSnapshots: RefundStateMutationTerminalConflictPersistenceSnapshotRecord[];
  terminalConflictEvents?: RefundStateMutationTerminalConflictPersistenceEventRecord[];
};

export type RefundStateMutationReviewCaseEventSummary = {
  action: string;
  actorType: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type RefundStateMutationApprovalReviewSummary = {
  approvalPersistenceIdempotencyKey: string;
  status: RefundStateMutationApprovalPersistenceRecord["status"];
  providerName: RefundStateMutationApprovalPersistenceRecord["providerName"];
  providerRefundReference: string;
  targetStateAuditLabel: string;
  amountMinor: number;
  currency: "CNY";
  reviewerRole: RefundStateMutationApprovalPersistenceRecord["reviewerRole"];
  decisionReasonRedacted: string;
  createdAt: string;
  decidedAt?: string;
  expiresAt?: string;
  latestEvent?: RefundStateMutationReviewCaseEventSummary;
};

export type RefundStateMutationAuditReviewSummary = {
  auditPersistenceIdempotencyKey: string;
  status: RefundStateMutationAuditPersistenceRecord["status"];
  auditAction: string;
  auditReasonRedacted: string;
  createdAt: string;
  latestEvent?: RefundStateMutationReviewCaseEventSummary;
};

export type RefundStateMutationRuntimeAttemptReviewSummary = {
  runtimeAttemptPersistenceIdempotencyKey: string;
  workflowIdempotencyKey: string;
  attemptStatus: RefundStateMutationRuntimeAttemptPersistenceRecord["attemptStatus"];
  attemptNumber: number;
  targetStateAuditLabel: string;
  failureCode?: string;
  operatorVisibleReason?: string;
  createdAt: string;
  finishedAt?: string;
  nextRetryAt?: string;
  latestEvent?: RefundStateMutationReviewCaseEventSummary;
};

export type RefundStateMutationTerminalConflictReviewSummary = {
  terminalConflictPersistenceIdempotencyKey: string;
  terminalConflictDecisionKey: string;
  conflictStatus: RefundStateMutationTerminalConflictPersistenceSnapshotRecord["conflictStatus"];
  conflictCode: RefundStateMutationTerminalConflictPersistenceSnapshotRecord["conflictCode"];
  currentRefundState: string;
  incomingTargetState: string;
  conflictDetectedAt: string;
  createdAt: string;
  latestEvent?: RefundStateMutationReviewCaseEventSummary;
};

export type RefundStateMutationReviewCaseStatusLabel =
  | "operator_review_ready"
  | "approval_pending_review"
  | "approval_rejected"
  | "duplicate_noop_recorded"
  | "manual_review_required"
  | "retryable_failure_recorded"
  | "incomplete"
  | "blocked";

export type RefundStateMutationReviewCase = {
  resultType: "review_case";
  queryKey: {
    kind: QueryKeyKind;
    value: string;
  };
  platformRefundId: string;
  providerName: RefundStateMutationApprovalPersistenceRecord["providerName"];
  providerRefundReference: string;
  currentReviewStatusLabel: Exclude<
    RefundStateMutationReviewCaseStatusLabel,
    "incomplete" | "blocked"
  >;
  blockCode?: string;
  operatorVisibleReason: string;
  duplicateOutcome: boolean;
  replayOutcome: boolean;
  manualReviewRequired: boolean;
  featureFlagSnapshotKey?: string;
  crossReferences: {
    approvalPersistenceIdempotencyKey: string;
    auditPersistenceIdempotencyKey: string;
    runtimeAttemptPersistenceIdempotencyKey: string;
    terminalConflictPersistenceIdempotencyKey: string;
    platformRefundId: string;
    providerRefundReference: string;
    workflowIdempotencyKey: string;
    terminalMarkerKey: string;
  };
  approval: RefundStateMutationApprovalReviewSummary;
  audit: RefundStateMutationAuditReviewSummary;
  runtimeAttempt: RefundStateMutationRuntimeAttemptReviewSummary;
  terminalConflict: RefundStateMutationTerminalConflictReviewSummary;
};

export type RefundStateMutationReviewCaseFailure = {
  resultType: "incomplete" | "blocked";
  queryKey: {
    kind: QueryKeyKind;
    value: string;
  };
  currentReviewStatusLabel: "incomplete" | "blocked";
  blockCode: string;
  operatorVisibleReason: string;
  missingEvidence: string[];
  crossReferences: Partial<RefundStateMutationReviewCase["crossReferences"]>;
};

export type RefundStateMutationReviewCaseResult =
  | RefundStateMutationReviewCase
  | RefundStateMutationReviewCaseFailure;

const deniedMetadataKeys = new Set(
  [
    "rawProviderPayload",
    "rawPayload",
    "signature",
    "secret",
    "key",
    "apiKey",
    "privateKey",
    "certificate",
    "apiV3Key",
    "webhookSecret",
    "dbUrl",
    "databaseUrl",
    "productionDbUrl",
    "providerRequest",
    "providerQuery",
    "providerRequestPayload",
    "providerQueryPayload",
    "providerRefundRequest",
    "providerRefundQuery",
    "providerRefundRequestPayload",
    "providerRefundQueryPayload",
    "refundQuery",
    "executeWorkflow",
    "workflowExecution",
    "refundStateMutation",
    "terminalMarkerKey",
    "providerEvidenceDigest",
    "stateOwnerEvidenceKey",
    "identityNumber",
    "bankCardNumber",
    "fullPhone",
    "fullAddress",
  ].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")),
);

const normalizeMetadataKey = (key: string): string =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

const sanitizeMetadataValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeMetadataValue);
  }

  if (value && typeof value === "object") {
    return sanitizeMetadata(value as Record<string, unknown>);
  }

  return value;
};

const sanitizeMetadata = (
  metadata: Record<string, unknown> = {},
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !deniedMetadataKeys.has(normalizeMetadataKey(key)))
      .map(([key, value]) => [key, sanitizeMetadataValue(value)]),
  );

const pickLatest = <T extends { createdAt: string }>(records: T[]): T | null =>
  [...records].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )[0] ?? null;

const summarizeLatestEvent = <
  T extends {
    action: string;
    actorType: string;
    metadataRedacted: Record<string, unknown>;
    createdAt: string;
  },
>(
  events: T[],
): RefundStateMutationReviewCaseEventSummary | undefined => {
  const latest = pickLatest(events);

  if (!latest) {
    return undefined;
  }

  return {
    action: latest.action,
    actorType: latest.actorType,
    createdAt: latest.createdAt,
    metadata: sanitizeMetadata(latest.metadataRedacted),
  };
};

const blockedResult = (
  queryKey: RefundStateMutationReviewCaseFailure["queryKey"],
  blockCode: string,
  operatorVisibleReason: string,
  missingEvidence: string[] = [],
  crossReferences: RefundStateMutationReviewCaseFailure["crossReferences"] = {},
): RefundStateMutationReviewCaseFailure => ({
  resultType: missingEvidence.length > 0 ? "incomplete" : "blocked",
  queryKey,
  currentReviewStatusLabel: missingEvidence.length > 0 ? "incomplete" : "blocked",
  blockCode,
  operatorVisibleReason,
  missingEvidence,
  crossReferences,
});

type ResolvedEvidence = {
  terminalConflict: RefundStateMutationTerminalConflictPersistenceSnapshotRecord;
  approval: RefundStateMutationApprovalPersistenceRecord;
  audit: RefundStateMutationAuditPersistenceRecord;
  runtimeAttempt: RefundStateMutationRuntimeAttemptPersistenceRecord;
};

type ReviewCaseQuery = RefundStateMutationReviewCase["queryKey"];

export const buildRefundStateMutationReviewCase = (
  input: RefundStateMutationIsolatedPreprodQuerySurfaceInput,
  queryKey: ReviewCaseQuery,
  evidence: Partial<ResolvedEvidence> & {
    terminalConflict?: RefundStateMutationTerminalConflictPersistenceSnapshotRecord;
  },
): RefundStateMutationReviewCaseResult => {
  if (
    !input.environment.isolatedPreprodVerified ||
    input.environment.environment === "production"
  ) {
    return blockedResult(
      queryKey,
      "isolated_preprod_environment_unverified",
      "Isolated preprod evidence cannot be proven for this query surface.",
    );
  }

  if (!evidence.terminalConflict) {
    return blockedResult(
      queryKey,
      "review_case_not_found",
      "No terminal conflict snapshot was found for the requested review case.",
    );
  }

  const terminalConflict = evidence.terminalConflict;
  const crossReferences: RefundStateMutationReviewCaseFailure["crossReferences"] =
    {
      terminalConflictPersistenceIdempotencyKey:
        terminalConflict.terminalConflictPersistenceIdempotencyKey,
      approvalPersistenceIdempotencyKey:
        terminalConflict.approvalPersistenceIdempotencyKey,
      auditPersistenceIdempotencyKey:
        terminalConflict.auditPersistenceIdempotencyKey,
      runtimeAttemptPersistenceIdempotencyKey:
        terminalConflict.runtimeAttemptPersistenceIdempotencyKey,
      platformRefundId: terminalConflict.platformRefundId,
      workflowIdempotencyKey: terminalConflict.workflowIdempotencyKey,
      terminalMarkerKey: terminalConflict.terminalMarkerKey,
    };

  const missingEvidence: string[] = [];

  if (!terminalConflict.approvalPersistenceIdempotencyKey) {
    missingEvidence.push("approval_persistence_idempotency_key");
  }

  if (!terminalConflict.auditPersistenceIdempotencyKey) {
    missingEvidence.push("audit_persistence_idempotency_key");
  }

  if (!terminalConflict.runtimeAttemptPersistenceIdempotencyKey) {
    missingEvidence.push("runtime_attempt_persistence_idempotency_key");
  }

  if (!terminalConflict.workflowIdempotencyKey) {
    missingEvidence.push("workflow_idempotency_key");
  }

  if (!terminalConflict.terminalMarkerKey) {
    missingEvidence.push("terminal_marker_key");
  }

  if (!evidence.approval) {
    missingEvidence.push("approval_record");
  }

  if (!evidence.audit) {
    missingEvidence.push("audit_record");
  }

  if (!evidence.runtimeAttempt) {
    missingEvidence.push("runtime_attempt_record");
  }

  if (missingEvidence.length > 0) {
    return blockedResult(
      queryKey,
      "missing_cross_reference",
      "Review case evidence is incomplete and has been blocked fail-closed.",
      missingEvidence,
      crossReferences,
    );
  }

  const approval = evidence.approval;
  const audit = evidence.audit;
  const runtimeAttempt = evidence.runtimeAttempt;
  const providerRefundReference = approval.providerRefundReference;

  crossReferences.providerRefundReference = providerRefundReference;

  const mismatches: string[] = [];

  if (approval.platformRefundId !== terminalConflict.platformRefundId) {
    mismatches.push("platform_refund_id");
  }

  if (runtimeAttempt.platformRefundId !== terminalConflict.platformRefundId) {
    mismatches.push("runtime_attempt_platform_refund_id");
  }

  if (
    audit.approvalPersistenceIdempotencyKey !==
    approval.approvalIdempotencyKey
  ) {
    mismatches.push("audit_to_approval_reference");
  }

  if (
    runtimeAttempt.approvalPersistenceIdempotencyKey !==
    approval.approvalIdempotencyKey
  ) {
    mismatches.push("runtime_to_approval_reference");
  }

  if (
    runtimeAttempt.auditPersistenceIdempotencyKey !==
    audit.auditPersistenceIdempotencyKey
  ) {
    mismatches.push("runtime_to_audit_reference");
  }

  if (
    terminalConflict.workflowIdempotencyKey !== runtimeAttempt.workflowIdempotencyKey
  ) {
    mismatches.push("workflow_idempotency_key");
  }

  if (runtimeAttempt.providerRefundReference !== providerRefundReference) {
    mismatches.push("provider_refund_reference");
  }

  if (runtimeAttempt.providerName !== approval.providerName) {
    mismatches.push("provider_name");
  }

  if (mismatches.length > 0) {
    return blockedResult(
      queryKey,
      "cross_reference_mismatch",
      "Review case evidence contains inconsistent cross references and has been blocked.",
      mismatches,
      crossReferences,
    );
  }

  const approvalLatestEvent = summarizeLatestEvent(
    (input.approvalEvents ?? []).filter(
      (event) => event.approvalId === approval.id,
    ),
  );
  const auditLatestEvent = summarizeLatestEvent(
    (input.auditEvents ?? []).filter(
      (event) => event.auditPersistenceId === audit.id,
    ),
  );
  const runtimeLatestEvent = summarizeLatestEvent(
    (input.runtimeAttemptEvents ?? []).filter(
      (event) => event.runtimeAttemptPersistenceId === runtimeAttempt.id,
    ),
  );
  const terminalLatestEvent = summarizeLatestEvent(
    (input.terminalConflictEvents ?? []).filter(
      (event) => event.terminalConflictPersistenceId === terminalConflict.id,
    ),
  );

  const duplicateOutcome =
    terminalConflict.conflictCode === "duplicate_noop" ||
    runtimeAttempt.attemptStatus === "duplicate_noop_disabled";
  const manualReviewRequired =
    terminalConflict.conflictCode === "manual_review" ||
    runtimeAttempt.attemptStatus === "manual_review_disabled";
  const replayOutcome =
    approval.status === "replayed" || audit.status === "replayed";

  let currentReviewStatusLabel: RefundStateMutationReviewCase["currentReviewStatusLabel"] =
    "operator_review_ready";
  let blockCode: string | undefined;

  if (runtimeAttempt.attemptStatus === "retryable_failed") {
    currentReviewStatusLabel = "retryable_failure_recorded";
    blockCode = runtimeAttempt.failureCode ?? "retryable_failed";
  } else if (duplicateOutcome) {
    currentReviewStatusLabel = "duplicate_noop_recorded";
    blockCode = "duplicate_noop";
  } else if (manualReviewRequired) {
    currentReviewStatusLabel = "manual_review_required";
    blockCode = "manual_review_required";
  } else if (approval.status === "pending_review") {
    currentReviewStatusLabel = "approval_pending_review";
    blockCode = "approval_pending_review";
  } else if (approval.status === "rejected") {
    currentReviewStatusLabel = "approval_rejected";
    blockCode = "approval_rejected";
  }

  const operatorVisibleReason =
    runtimeAttempt.operatorVisibleReason ||
    runtimeAttempt.failureReasonRedacted ||
    approval.decisionReasonRedacted ||
    audit.auditReasonRedacted ||
    "Refund state mutation review case is ready for operator inspection.";

  return {
    resultType: "review_case",
    queryKey,
    platformRefundId: terminalConflict.platformRefundId,
    providerName: approval.providerName,
    providerRefundReference,
    currentReviewStatusLabel,
    blockCode,
    operatorVisibleReason,
    duplicateOutcome,
    replayOutcome,
    manualReviewRequired,
    featureFlagSnapshotKey:
      runtimeAttempt.featureFlagSnapshotKey ||
      terminalConflict.featureFlagSnapshotKey ||
      approval.featureFlagSnapshotKey,
    crossReferences: {
      approvalPersistenceIdempotencyKey: approval.approvalIdempotencyKey,
      auditPersistenceIdempotencyKey: audit.auditPersistenceIdempotencyKey,
      runtimeAttemptPersistenceIdempotencyKey:
        runtimeAttempt.runtimeAttemptPersistenceIdempotencyKey,
      terminalConflictPersistenceIdempotencyKey:
        terminalConflict.terminalConflictPersistenceIdempotencyKey,
      platformRefundId: terminalConflict.platformRefundId,
      providerRefundReference,
      workflowIdempotencyKey: runtimeAttempt.workflowIdempotencyKey,
      terminalMarkerKey: terminalConflict.terminalMarkerKey as string,
    },
    approval: {
      approvalPersistenceIdempotencyKey: approval.approvalIdempotencyKey,
      status: approval.status,
      providerName: approval.providerName,
      providerRefundReference,
      targetStateAuditLabel: approval.targetStateAuditLabel,
      amountMinor: approval.amountMinor,
      currency: approval.currency,
      reviewerRole: approval.reviewerRole,
      decisionReasonRedacted: approval.decisionReasonRedacted,
      createdAt: approval.createdAt,
      decidedAt: approval.decidedAt,
      expiresAt: approval.expiresAt,
      latestEvent: approvalLatestEvent,
    },
    audit: {
      auditPersistenceIdempotencyKey: audit.auditPersistenceIdempotencyKey,
      status: audit.status,
      auditAction: audit.auditAction,
      auditReasonRedacted: audit.auditReasonRedacted,
      createdAt: audit.createdAt,
      latestEvent: auditLatestEvent,
    },
    runtimeAttempt: {
      runtimeAttemptPersistenceIdempotencyKey:
        runtimeAttempt.runtimeAttemptPersistenceIdempotencyKey,
      workflowIdempotencyKey: runtimeAttempt.workflowIdempotencyKey,
      attemptStatus: runtimeAttempt.attemptStatus,
      attemptNumber: runtimeAttempt.attemptNumber,
      targetStateAuditLabel: runtimeAttempt.targetStateAuditLabel,
      failureCode: runtimeAttempt.failureCode,
      operatorVisibleReason: runtimeAttempt.operatorVisibleReason,
      createdAt: runtimeAttempt.createdAt,
      finishedAt: runtimeAttempt.finishedAt,
      nextRetryAt: runtimeAttempt.nextRetryAt,
      latestEvent: runtimeLatestEvent,
    },
    terminalConflict: {
      terminalConflictPersistenceIdempotencyKey:
        terminalConflict.terminalConflictPersistenceIdempotencyKey,
      terminalConflictDecisionKey: terminalConflict.terminalConflictDecisionKey,
      conflictStatus: terminalConflict.conflictStatus,
      conflictCode: terminalConflict.conflictCode,
      currentRefundState: terminalConflict.currentRefundState,
      incomingTargetState: terminalConflict.incomingTargetState,
      conflictDetectedAt: terminalConflict.conflictDetectedAt,
      createdAt: terminalConflict.createdAt,
      latestEvent: terminalLatestEvent,
    },
  };
};

export const createRefundStateMutationIsolatedPreprodQuerySurface = (
  input: RefundStateMutationIsolatedPreprodQuerySurfaceInput,
) => {
  const byPlatformRefundId = (platformRefundId: string) =>
    pickLatest(
      input.terminalConflictSnapshots.filter(
        (record) => record.platformRefundId === platformRefundId,
      ),
    );

  const byApprovalIdempotencyKey = (
    approvalPersistenceIdempotencyKey: string,
  ) =>
    pickLatest(
      input.terminalConflictSnapshots.filter(
        (record) =>
          record.approvalPersistenceIdempotencyKey ===
          approvalPersistenceIdempotencyKey,
      ),
    ) ??
    (() => {
      const approval = input.approvalRecords.find(
        (record) =>
          record.approvalIdempotencyKey === approvalPersistenceIdempotencyKey,
      );

      return approval ? byPlatformRefundId(approval.platformRefundId) : null;
    })();

  const byRuntimeAttemptIdempotencyKey = (
    runtimeAttemptPersistenceIdempotencyKey: string,
  ) =>
    pickLatest(
      input.terminalConflictSnapshots.filter(
        (record) =>
          record.runtimeAttemptPersistenceIdempotencyKey ===
          runtimeAttemptPersistenceIdempotencyKey,
      ),
    ) ??
    (() => {
      const runtimeAttempt = input.runtimeAttemptRecords.find(
        (record) =>
          record.runtimeAttemptPersistenceIdempotencyKey ===
          runtimeAttemptPersistenceIdempotencyKey,
      );

      return runtimeAttempt
        ? byPlatformRefundId(runtimeAttempt.platformRefundId)
        : null;
    })();

  const byTerminalConflictIdempotencyKey = (
    terminalConflictPersistenceIdempotencyKey: string,
  ) =>
    input.terminalConflictSnapshots.find(
      (record) =>
        record.terminalConflictPersistenceIdempotencyKey ===
        terminalConflictPersistenceIdempotencyKey,
    ) ?? null;

  const byProviderRefundReference = (
    providerName: RefundStateMutationApprovalPersistenceRecord["providerName"],
    providerRefundReference: string,
  ) => {
    const approvalMatch = pickLatest(
      input.approvalRecords.filter(
        (record) =>
          record.providerName === providerName &&
          record.providerRefundReference === providerRefundReference,
      ),
    );

    if (approvalMatch) {
      return byPlatformRefundId(approvalMatch.platformRefundId);
    }

    const runtimeAttemptMatch = pickLatest(
      input.runtimeAttemptRecords.filter(
        (record) =>
          record.providerName === providerName &&
          record.providerRefundReference === providerRefundReference,
      ),
    );

    return runtimeAttemptMatch
      ? byPlatformRefundId(runtimeAttemptMatch.platformRefundId)
      : null;
  };

  const resolveEvidence = (
    terminalConflict: RefundStateMutationTerminalConflictPersistenceSnapshotRecord | null,
  ): Partial<ResolvedEvidence> & {
    terminalConflict?: RefundStateMutationTerminalConflictPersistenceSnapshotRecord;
  } => {
    if (!terminalConflict) {
      return {};
    }

    return {
      terminalConflict,
      approval: terminalConflict.approvalPersistenceIdempotencyKey
        ? input.approvalRecords.find(
            (record) =>
              record.approvalIdempotencyKey ===
              terminalConflict.approvalPersistenceIdempotencyKey,
          )
        : undefined,
      audit: terminalConflict.auditPersistenceIdempotencyKey
        ? input.auditRecords.find(
            (record) =>
              record.auditPersistenceIdempotencyKey ===
              terminalConflict.auditPersistenceIdempotencyKey,
          )
        : undefined,
      runtimeAttempt: terminalConflict.runtimeAttemptPersistenceIdempotencyKey
        ? input.runtimeAttemptRecords.find(
            (record) =>
              record.runtimeAttemptPersistenceIdempotencyKey ===
              terminalConflict.runtimeAttemptPersistenceIdempotencyKey,
          )
        : undefined,
    };
  };

  return {
    reviewCaseByPlatformRefundId: (
      platformRefundId: string,
    ): RefundStateMutationReviewCaseResult =>
      buildRefundStateMutationReviewCase(
        input,
        {
          kind: "platform_refund_id",
          value: platformRefundId,
        },
        resolveEvidence(byPlatformRefundId(platformRefundId)),
      ),
    reviewCaseByApprovalPersistenceIdempotencyKey: (
      approvalPersistenceIdempotencyKey: string,
    ): RefundStateMutationReviewCaseResult =>
      buildRefundStateMutationReviewCase(
        input,
        {
          kind: "approval_persistence_idempotency_key",
          value: approvalPersistenceIdempotencyKey,
        },
        resolveEvidence(byApprovalIdempotencyKey(approvalPersistenceIdempotencyKey)),
      ),
    reviewCaseByRuntimeAttemptPersistenceIdempotencyKey: (
      runtimeAttemptPersistenceIdempotencyKey: string,
    ): RefundStateMutationReviewCaseResult =>
      buildRefundStateMutationReviewCase(
        input,
        {
          kind: "runtime_attempt_persistence_idempotency_key",
          value: runtimeAttemptPersistenceIdempotencyKey,
        },
        resolveEvidence(
          byRuntimeAttemptIdempotencyKey(runtimeAttemptPersistenceIdempotencyKey),
        ),
      ),
    reviewCaseByTerminalConflictPersistenceIdempotencyKey: (
      terminalConflictPersistenceIdempotencyKey: string,
    ): RefundStateMutationReviewCaseResult =>
      buildRefundStateMutationReviewCase(
        input,
        {
          kind: "terminal_conflict_persistence_idempotency_key",
          value: terminalConflictPersistenceIdempotencyKey,
        },
        resolveEvidence(
          byTerminalConflictIdempotencyKey(
            terminalConflictPersistenceIdempotencyKey,
          ),
        ),
      ),
    reviewCaseByProviderRefundReference: (
      providerName: RefundStateMutationApprovalPersistenceRecord["providerName"],
      providerRefundReference: string,
    ): RefundStateMutationReviewCaseResult =>
      buildRefundStateMutationReviewCase(
        input,
        {
          kind: "provider_refund_reference",
          value: `${providerName}:${providerRefundReference}`,
        },
        resolveEvidence(
          byProviderRefundReference(providerName, providerRefundReference),
        ),
      ),
  };
};
