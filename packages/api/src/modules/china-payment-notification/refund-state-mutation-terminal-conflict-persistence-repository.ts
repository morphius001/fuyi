import { RefundStateMutationTerminalConflictDecision } from "./refund-state-mutation-terminal-conflict";

export type RefundStateMutationTerminalConflictPersistenceStatus =
  | "shadow_prepared_disabled"
  | "duplicate_noop_disabled"
  | "manual_review_disabled"
  | "blocked";

export type RefundStateMutationTerminalConflictPersistenceEventAction =
  | "terminal_conflict_snapshot_requested"
  | "terminal_conflict_snapshot_recorded"
  | "terminal_conflict_duplicate_noop_recorded"
  | "terminal_conflict_manual_review_recorded"
  | "terminal_conflict_blocked"
  | "manual_review_handoff";

export type RefundStateMutationTerminalConflictPersistenceSnapshotRecord = {
  id: string;
  terminalConflictPersistenceIdempotencyKey: string;
  terminalConflictDecisionKey: string;
  platformRefundId: string;
  currentRefundState: string;
  incomingTargetState: string;
  conflictStatus: RefundStateMutationTerminalConflictPersistenceStatus;
  conflictCode: "no_terminal_conflict" | "duplicate_noop" | "manual_review";
  terminalMarkerKey?: string;
  terminalMarkerVersion?: string;
  providerEvidenceDigest: string;
  providerEvidenceDigestVersion?: string;
  approvalPersistenceIdempotencyKey?: string;
  auditPersistenceIdempotencyKey?: string;
  workflowIdempotencyKey?: string;
  runtimeAttemptPersistenceIdempotencyKey?: string;
  featureFlagSnapshotKey?: string;
  stateOwnerEvidenceKey?: string;
  actorReference?: string;
  reviewerReference?: string;
  conflictDetectedAt: string;
  createdAt: string;
};

export type RefundStateMutationTerminalConflictPersistenceEventRecord = {
  id: string;
  terminalConflictPersistenceId: string;
  action: RefundStateMutationTerminalConflictPersistenceEventAction;
  actorId: string;
  actorType: "admin" | "system_job" | "system" | "operator";
  metadataRedacted: Record<string, unknown>;
  createdAt: string;
};

export type RecordRefundStateMutationTerminalConflictPersistenceInput = {
  snapshot: RefundStateMutationTerminalConflictPersistenceSnapshotRecord;
  event: RefundStateMutationTerminalConflictPersistenceEventRecord;
};

export interface RefundStateMutationTerminalConflictPersistenceRepositoryContract {
  recordTerminalConflictPersistence(
    input: RecordRefundStateMutationTerminalConflictPersistenceInput,
  ): Promise<RefundStateMutationTerminalConflictPersistenceSnapshotRecord>;
  appendTerminalConflictPersistenceEvent(
    event: RefundStateMutationTerminalConflictPersistenceEventRecord,
  ): Promise<void>;
  getByTerminalConflictPersistenceIdempotencyKey(
    terminalConflictPersistenceIdempotencyKey: string,
  ): Promise<RefundStateMutationTerminalConflictPersistenceSnapshotRecord | null>;
  getByPlatformRefundId(
    platformRefundId: string,
  ): Promise<RefundStateMutationTerminalConflictPersistenceSnapshotRecord[]>;
  getByTerminalMarkerKey(
    terminalMarkerKey: string,
  ): Promise<RefundStateMutationTerminalConflictPersistenceSnapshotRecord[]>;
  getByApprovalPersistenceIdempotencyKey(
    approvalPersistenceIdempotencyKey: string,
  ): Promise<RefundStateMutationTerminalConflictPersistenceSnapshotRecord[]>;
}

export type RefundStateMutationTerminalConflictPersistenceRepositoryDecisionType =
  | "terminal_conflict_persistence_repository_intent_recorded"
  | "terminal_conflict_persistence_repository_input_rejected"
  | "terminal_conflict_persistence_repository_blocked";

export type RefundStateMutationTerminalConflictPersistenceRepositoryInput = {
  terminalConflictDecision: RefundStateMutationTerminalConflictDecision;
  requestedAt: string;
  repositoryContext: {
    environment: "development" | "test" | "staging" | "production";
    writerMode: "disabled" | "local_in_memory" | "db";
    repositoryReady: boolean;
    uniquenessReplayReady: boolean;
    eventAppendOnlyReady: boolean;
    terminalMarkerSnapshotReady: boolean;
    operatorReviewReadModelReady: boolean;
    references?: {
      terminalMarkerKey?: string;
      terminalMarkerVersion?: string;
      providerEvidenceDigestVersion?: string;
      approvalPersistenceIdempotencyKey?: string;
      auditPersistenceIdempotencyKey?: string;
      workflowIdempotencyKey?: string;
      runtimeAttemptPersistenceIdempotencyKey?: string;
      featureFlagSnapshotKey?: string;
      stateOwnerEvidenceKey?: string;
      actorReference?: string;
      reviewerReference?: string;
    };
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationTerminalConflictPersistenceRepositoryDecision = {
  decision: RefundStateMutationTerminalConflictPersistenceRepositoryDecisionType;
  repositoryWriteAllowed: false;
  dbWriteAllowed: false;
  productionWriteAllowed: false;
  executable: false;
  workflowExecutionAllowed: false;
  stateMutationAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  settlementMutationAllowed: false;
  commissionMutationAllowed: false;
  payoutMutationAllowed: false;
  permissionMutationAllowed: false;
  fulfillmentMutationAllowed: false;
  logisticsMutationAllowed: false;
  blockCodes: string[];
  idempotencyKey: string;
  repositoryIntent?: {
    intentType:
      "refund_state_mutation_terminal_conflict_persistence_repository_disabled";
    terminalConflictDecisionKey: string;
    conflictStatus:
      | "shadow_prepared_disabled"
      | "duplicate_noop_disabled"
      | "manual_review_disabled";
    conflictCode: "no_terminal_conflict" | "duplicate_noop" | "manual_review";
    platformRefundId: string;
    currentRefundState: string;
    incomingTargetState: string;
    providerEvidenceDigest: string;
    terminalMarkerKey?: string;
    providerEvidenceDigestVersion?: string;
    repositoryWriteAllowed: false;
    dbWriteAllowed: false;
    productionWriteAllowed: false;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_terminal_conflict_persistence_repository_intent_recorded"
      | "refund_state_terminal_conflict_persistence_repository_input_rejected"
      | "refund_state_terminal_conflict_persistence_repository_blocked";
    metadata: Record<string, unknown>;
  };
};

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
    "providerRefundRequest",
    "providerRefundQuery",
    "repositoryWriteAllowed",
    "dbWriteAllowed",
    "productionWriteAllowed",
    "executable",
    "workflowExecutionAllowed",
    "stateMutationAllowed",
    "runtimeMutationBlocked",
    "refundSuccessState",
    "settlementMutationAllowed",
    "commissionMutationAllowed",
    "payoutMutationAllowed",
    "permissionMutationAllowed",
    "fulfillmentMutationAllowed",
    "logisticsMutationAllowed",
    "workflowExecution",
    "executeWorkflow",
    "refundStateMutation",
    "terminalConflict",
    "terminalConflictDecision",
    "terminalMarkerKey",
    "terminalMarkerVersion",
    "providerEvidenceDigest",
    "stateOwnerEvidenceKey",
    "repositoryIntent",
    "blockCodes",
    "writerMode",
    "fullPhone",
    "fullAddress",
    "identityNumber",
    "bankCardNumber",
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

const isTerminalConflictSafe = (
  decision: RefundStateMutationTerminalConflictDecision,
): boolean =>
  decision.lockWriteAllowed === false &&
  decision.dbWriteAllowed === false &&
  decision.productionWriteAllowed === false &&
  decision.executable === false &&
  decision.workflowExecutionAllowed === false &&
  decision.stateMutationAllowed === false &&
  decision.runtimeMutationBlocked === true &&
  decision.refundSuccessState === false &&
  decision.settlementMutationAllowed === false &&
  decision.commissionMutationAllowed === false &&
  decision.payoutMutationAllowed === false &&
  decision.permissionMutationAllowed === false &&
  decision.fulfillmentMutationAllowed === false &&
  decision.logisticsMutationAllowed === false &&
  (!decision.terminalConflictIntent ||
    (decision.terminalConflictIntent.lockWriteAllowed === false &&
      decision.terminalConflictIntent.dbWriteAllowed === false &&
      decision.terminalConflictIntent.productionWriteAllowed === false &&
      decision.terminalConflictIntent.workflowExecutionAllowed === false &&
      decision.terminalConflictIntent.stateMutationAllowed === false &&
      decision.terminalConflictIntent.refundSuccessState === false));

const blockCodes = (
  input: RefundStateMutationTerminalConflictPersistenceRepositoryInput,
): string[] => {
  const codes = ["terminal_conflict_persistence_repository_disabled"];

  if (!isTerminalConflictSafe(input.terminalConflictDecision)) {
    codes.push("unsafe_terminal_conflict_decision");
  }

  if (
    input.terminalConflictDecision.decision === "terminal_conflict_blocked" ||
    !input.terminalConflictDecision.terminalConflictIntent
  ) {
    codes.push("terminal_conflict_intent_missing");
  }

  if (input.repositoryContext.writerMode !== "disabled") {
    codes.push("writer_mode_ignored_until_go");
  }

  if (input.repositoryContext.environment === "production") {
    codes.push("production_write_blocked");
  }

  if (!input.repositoryContext.repositoryReady) {
    codes.push("repository_missing");
  }

  if (!input.repositoryContext.uniquenessReplayReady) {
    codes.push("uniqueness_replay_missing");
  }

  if (!input.repositoryContext.eventAppendOnlyReady) {
    codes.push("event_append_only_missing");
  }

  if (!input.repositoryContext.terminalMarkerSnapshotReady) {
    codes.push("terminal_marker_snapshot_missing");
  }

  if (!input.repositoryContext.operatorReviewReadModelReady) {
    codes.push("operator_review_read_model_missing");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationTerminalConflictPersistenceRepositoryInput,
): string =>
  [
    "refund_state_mutation_terminal_conflict_persistence_repository",
    input.terminalConflictDecision.idempotencyKey,
    input.repositoryContext.environment,
    input.repositoryContext.writerMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const statusFor = (
  conflictCode: NonNullable<
    RefundStateMutationTerminalConflictDecision["terminalConflictIntent"]
  >["conflictCode"],
): "shadow_prepared_disabled" | "duplicate_noop_disabled" | "manual_review_disabled" => {
  if (conflictCode === "duplicate_noop") {
    return "duplicate_noop_disabled";
  }
  if (conflictCode === "manual_review") {
    return "manual_review_disabled";
  }
  return "shadow_prepared_disabled";
};

const actionFor = (
  decision: RefundStateMutationTerminalConflictPersistenceRepositoryDecisionType,
): RefundStateMutationTerminalConflictPersistenceRepositoryDecision["auditEvent"]["action"] => {
  if (
    decision === "terminal_conflict_persistence_repository_intent_recorded"
  ) {
    return "refund_state_terminal_conflict_persistence_repository_intent_recorded";
  }
  if (
    decision === "terminal_conflict_persistence_repository_input_rejected"
  ) {
    return "refund_state_terminal_conflict_persistence_repository_input_rejected";
  }
  return "refund_state_terminal_conflict_persistence_repository_blocked";
};

const decisionFor = (
  input: RefundStateMutationTerminalConflictPersistenceRepositoryInput,
): RefundStateMutationTerminalConflictPersistenceRepositoryDecisionType => {
  if (!isTerminalConflictSafe(input.terminalConflictDecision)) {
    return "terminal_conflict_persistence_repository_blocked";
  }

  if (input.repositoryContext.environment === "production") {
    return "terminal_conflict_persistence_repository_blocked";
  }

  if (
    input.terminalConflictDecision.decision === "terminal_conflict_blocked" ||
    !input.terminalConflictDecision.terminalConflictIntent
  ) {
    return "terminal_conflict_persistence_repository_input_rejected";
  }

  return "terminal_conflict_persistence_repository_intent_recorded";
};

export const mapTerminalConflictToRepositoryIntent = (
  input: RefundStateMutationTerminalConflictPersistenceRepositoryInput,
): RefundStateMutationTerminalConflictPersistenceRepositoryDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const terminalConflictIntent =
    input.terminalConflictDecision.terminalConflictIntent;
  const references = input.repositoryContext.references ?? {};

  return {
    decision,
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
    blockCodes: codes,
    idempotencyKey: idempotencyKey(input),
    repositoryIntent:
      decision ===
        "terminal_conflict_persistence_repository_intent_recorded" &&
      terminalConflictIntent
        ? {
            intentType:
              "refund_state_mutation_terminal_conflict_persistence_repository_disabled",
            terminalConflictDecisionKey:
              input.terminalConflictDecision.idempotencyKey,
            conflictStatus: statusFor(terminalConflictIntent.conflictCode),
            conflictCode: terminalConflictIntent.conflictCode,
            platformRefundId: terminalConflictIntent.platformRefundId,
            currentRefundState: terminalConflictIntent.currentState,
            incomingTargetState: terminalConflictIntent.incomingTargetState,
            providerEvidenceDigest:
              terminalConflictIntent.providerEvidenceDigest,
            terminalMarkerKey: references.terminalMarkerKey,
            providerEvidenceDigestVersion:
              references.providerEvidenceDigestVersion,
            repositoryWriteAllowed: false,
            dbWriteAllowed: false,
            productionWriteAllowed: false,
            workflowExecutionAllowed: false,
            stateMutationAllowed: false,
            refundSuccessState: false,
          }
        : undefined,
    auditEvent: {
      action: actionFor(decision),
      metadata: sanitizeMetadata({
        requestedAt: input.requestedAt,
        blockCodes: codes,
        repositoryReady: input.repositoryContext.repositoryReady,
        uniquenessReplayReady:
          input.repositoryContext.uniquenessReplayReady,
        eventAppendOnlyReady: input.repositoryContext.eventAppendOnlyReady,
        terminalMarkerSnapshotReady:
          input.repositoryContext.terminalMarkerSnapshotReady,
        operatorReviewReadModelReady:
          input.repositoryContext.operatorReviewReadModelReady,
        terminalConflictDecision: input.terminalConflictDecision.decision,
        terminalConflictDecisionKey:
          input.terminalConflictDecision.idempotencyKey,
        conflictCode: terminalConflictIntent?.conflictCode,
        platformRefundId: terminalConflictIntent?.platformRefundId,
        currentRefundState: terminalConflictIntent?.currentState,
        incomingTargetState: terminalConflictIntent?.incomingTargetState,
        references,
        metadata: input.repositoryContext.metadata ?? {},
      }),
    },
  };
};
