import { RefundStateMutationRuntimeAttemptDecision } from "./refund-state-mutation-runtime-attempt";

export type RefundStateMutationRuntimeAttemptPersistenceStatus =
  | "planned_disabled"
  | "duplicate_noop_disabled"
  | "manual_review_disabled"
  | "retryable_failed"
  | "blocked";

export type RefundStateMutationRuntimeAttemptPersistenceEventAction =
  | "attempt_persistence_requested"
  | "attempt_persistence_recorded"
  | "attempt_duplicate_noop_recorded"
  | "attempt_manual_review_recorded"
  | "attempt_retry_scheduled"
  | "attempt_blocked"
  | "manual_review_handoff";

export type RefundStateMutationRuntimeAttemptPersistenceRecord = {
  id: string;
  runtimeAttemptPersistenceIdempotencyKey: string;
  workflowIdempotencyKey: string;
  platformRefundId: string;
  providerName: "mock_china_pay" | "alipay" | "wechat_pay";
  providerRefundReference: string;
  merchantOrderReference: string;
  refundRequestReference: string;
  targetState: string;
  targetStateAuditLabel: string;
  attemptStatus: RefundStateMutationRuntimeAttemptPersistenceStatus;
  attemptNumber: number;
  providerEvidenceDigest: string;
  digestVersion: string;
  approvalPersistenceIdempotencyKey: string;
  auditPersistenceIdempotencyKey: string;
  terminalConflictDecisionKey: string;
  featureFlagSnapshotKey: string;
  environment: "development" | "test" | "staging" | "production";
  failureCode?: string;
  failureReasonRedacted?: string;
  operatorVisibleReason?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  nextRetryAt?: string;
};

export type RefundStateMutationRuntimeAttemptPersistenceEventRecord = {
  id: string;
  runtimeAttemptPersistenceId: string;
  action: RefundStateMutationRuntimeAttemptPersistenceEventAction;
  actorId: string;
  actorType: "admin" | "system_job" | "system" | "operator";
  metadataRedacted: Record<string, unknown>;
  createdAt: string;
};

export type RecordRefundStateMutationRuntimeAttemptPersistenceInput = {
  record: RefundStateMutationRuntimeAttemptPersistenceRecord;
  event: RefundStateMutationRuntimeAttemptPersistenceEventRecord;
};

export interface RefundStateMutationRuntimeAttemptPersistenceRepositoryContract {
  recordRuntimeAttemptPersistence(
    input: RecordRefundStateMutationRuntimeAttemptPersistenceInput,
  ): Promise<RefundStateMutationRuntimeAttemptPersistenceRecord>;
  appendRuntimeAttemptPersistenceEvent(
    event: RefundStateMutationRuntimeAttemptPersistenceEventRecord,
  ): Promise<void>;
  getByRuntimeAttemptPersistenceIdempotencyKey(
    runtimeAttemptPersistenceIdempotencyKey: string,
  ): Promise<RefundStateMutationRuntimeAttemptPersistenceRecord | null>;
  getByWorkflowIdempotencyKey(
    workflowIdempotencyKey: string,
  ): Promise<RefundStateMutationRuntimeAttemptPersistenceRecord[]>;
  getByPlatformRefundId(
    platformRefundId: string,
  ): Promise<RefundStateMutationRuntimeAttemptPersistenceRecord[]>;
}

export type RefundStateMutationRuntimeAttemptPersistenceRepositoryDecisionType =
  | "runtime_attempt_persistence_repository_intent_recorded"
  | "runtime_attempt_persistence_repository_input_rejected"
  | "runtime_attempt_persistence_repository_blocked";

export type RefundStateMutationRuntimeAttemptPersistenceRepositoryInput = {
  runtimeAttemptDecision: RefundStateMutationRuntimeAttemptDecision;
  requestedAt: string;
  repositoryContext: {
    environment: "development" | "test" | "staging" | "production";
    writerMode: "disabled" | "local_in_memory" | "db";
    repositoryReady: boolean;
    idempotencyReplayReady: boolean;
    eventAppendOnlyReady: boolean;
    retryWindowReady: boolean;
    replayReadModelReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationRuntimeAttemptPersistenceRepositoryDecision = {
  decision: RefundStateMutationRuntimeAttemptPersistenceRepositoryDecisionType;
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
      "refund_state_mutation_runtime_attempt_persistence_repository_disabled";
    runtimeAttemptDecisionKey: string;
    terminalConflictDecisionKey: string;
    attemptStatus:
      | "planned_disabled"
      | "duplicate_noop_disabled"
      | "manual_review_disabled";
    platformRefundId?: string;
    incomingTargetState?: string;
    providerEvidenceDigest?: string;
    repositoryWriteAllowed: false;
    dbWriteAllowed: false;
    productionWriteAllowed: false;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_runtime_attempt_persistence_repository_intent_recorded"
      | "refund_state_runtime_attempt_persistence_repository_input_rejected"
      | "refund_state_runtime_attempt_persistence_repository_blocked";
    metadata: Record<string, unknown>;
  };
};

const deniedMetadataKeys = new Set([
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
  "attemptWriteAllowed",
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
  "runtimeAttempt",
  "runtimeAttemptDecision",
  "workflowAttempt",
  "terminalConflictDecision",
  "attemptStatus",
  "repositoryIntent",
  "fullPhone",
  "fullAddress",
  "identityNumber",
  "bankCardNumber",
  "blockCodes",
  "writerMode",
].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")));

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

const isRuntimeAttemptSafe = (
  decision: RefundStateMutationRuntimeAttemptDecision,
): boolean =>
  decision.attemptWriteAllowed === false &&
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
  (!decision.runtimeAttemptIntent ||
    (decision.runtimeAttemptIntent.attemptWriteAllowed === false &&
      decision.runtimeAttemptIntent.dbWriteAllowed === false &&
      decision.runtimeAttemptIntent.productionWriteAllowed === false &&
      decision.runtimeAttemptIntent.workflowExecutionAllowed === false &&
      decision.runtimeAttemptIntent.stateMutationAllowed === false &&
      decision.runtimeAttemptIntent.refundSuccessState === false));

const blockCodes = (
  input: RefundStateMutationRuntimeAttemptPersistenceRepositoryInput,
): string[] => {
  const codes = ["runtime_attempt_persistence_repository_disabled"];

  if (!isRuntimeAttemptSafe(input.runtimeAttemptDecision)) {
    codes.push("unsafe_runtime_attempt_decision");
  }

  if (
    input.runtimeAttemptDecision.decision === "runtime_attempt_blocked" ||
    input.runtimeAttemptDecision.decision === "runtime_attempt_input_rejected" ||
    !input.runtimeAttemptDecision.runtimeAttemptIntent
  ) {
    codes.push("runtime_attempt_intent_missing");
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

  if (!input.repositoryContext.idempotencyReplayReady) {
    codes.push("idempotency_replay_missing");
  }

  if (!input.repositoryContext.eventAppendOnlyReady) {
    codes.push("event_append_only_missing");
  }

  if (!input.repositoryContext.retryWindowReady) {
    codes.push("retry_window_missing");
  }

  if (!input.repositoryContext.replayReadModelReady) {
    codes.push("replay_read_model_missing");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationRuntimeAttemptPersistenceRepositoryInput,
): string =>
  [
    "refund_state_mutation_runtime_attempt_persistence_repository",
    input.runtimeAttemptDecision.idempotencyKey,
    input.repositoryContext.environment,
    input.repositoryContext.writerMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const actionFor = (
  decision: RefundStateMutationRuntimeAttemptPersistenceRepositoryDecisionType,
): RefundStateMutationRuntimeAttemptPersistenceRepositoryDecision["auditEvent"]["action"] => {
  if (decision === "runtime_attempt_persistence_repository_intent_recorded") {
    return "refund_state_runtime_attempt_persistence_repository_intent_recorded";
  }
  if (decision === "runtime_attempt_persistence_repository_input_rejected") {
    return "refund_state_runtime_attempt_persistence_repository_input_rejected";
  }
  return "refund_state_runtime_attempt_persistence_repository_blocked";
};

const decisionFor = (
  input: RefundStateMutationRuntimeAttemptPersistenceRepositoryInput,
): RefundStateMutationRuntimeAttemptPersistenceRepositoryDecisionType => {
  if (!isRuntimeAttemptSafe(input.runtimeAttemptDecision)) {
    return "runtime_attempt_persistence_repository_blocked";
  }

  if (input.repositoryContext.environment === "production") {
    return "runtime_attempt_persistence_repository_blocked";
  }

  if (
    input.runtimeAttemptDecision.decision === "runtime_attempt_blocked" ||
    input.runtimeAttemptDecision.decision === "runtime_attempt_input_rejected" ||
    !input.runtimeAttemptDecision.runtimeAttemptIntent
  ) {
    return "runtime_attempt_persistence_repository_input_rejected";
  }

  return "runtime_attempt_persistence_repository_intent_recorded";
};

export const mapRuntimeAttemptToRepositoryIntent = (
  input: RefundStateMutationRuntimeAttemptPersistenceRepositoryInput,
): RefundStateMutationRuntimeAttemptPersistenceRepositoryDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const runtimeAttemptIntent = input.runtimeAttemptDecision.runtimeAttemptIntent;

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
        "runtime_attempt_persistence_repository_intent_recorded" &&
      runtimeAttemptIntent
        ? {
            intentType:
              "refund_state_mutation_runtime_attempt_persistence_repository_disabled",
            runtimeAttemptDecisionKey: input.runtimeAttemptDecision.idempotencyKey,
            terminalConflictDecisionKey:
              runtimeAttemptIntent.terminalConflictDecisionKey,
            attemptStatus: runtimeAttemptIntent.attemptStatus,
            platformRefundId: runtimeAttemptIntent.platformRefundId,
            incomingTargetState: runtimeAttemptIntent.incomingTargetState,
            providerEvidenceDigest: runtimeAttemptIntent.providerEvidenceDigest,
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
        idempotencyReplayReady:
          input.repositoryContext.idempotencyReplayReady,
        eventAppendOnlyReady: input.repositoryContext.eventAppendOnlyReady,
        retryWindowReady: input.repositoryContext.retryWindowReady,
        replayReadModelReady: input.repositoryContext.replayReadModelReady,
        runtimeAttemptDecision: input.runtimeAttemptDecision.decision,
        runtimeAttemptDecisionKey: input.runtimeAttemptDecision.idempotencyKey,
        terminalConflictDecisionKey:
          runtimeAttemptIntent?.terminalConflictDecisionKey,
        attemptStatus: runtimeAttemptIntent?.attemptStatus,
        platformRefundId: runtimeAttemptIntent?.platformRefundId,
        incomingTargetState: runtimeAttemptIntent?.incomingTargetState,
        metadata: input.repositoryContext.metadata ?? {},
      }),
    },
  };
};
