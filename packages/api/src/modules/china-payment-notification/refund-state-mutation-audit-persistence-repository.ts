import { RefundStateMutationAuditPersistenceDecision } from "./refund-state-mutation-audit-persistence";

export type RefundStateMutationAuditPersistenceStatus =
  | "recorded"
  | "replayed"
  | "blocked"
  | "rejected";

export type RefundStateMutationAuditPersistenceEventAction =
  | "audit_persistence_requested"
  | "audit_persistence_recorded"
  | "audit_persistence_replayed"
  | "audit_persistence_blocked"
  | "manual_review_handoff";

export type RefundStateMutationAuditPersistenceRecord = {
  id: string;
  auditPersistenceIdempotencyKey: string;
  approvalPersistenceIdempotencyKey: string;
  approvalCandidateIdempotencyKey?: string;
  targetState?: string;
  status: RefundStateMutationAuditPersistenceStatus;
  auditAction: string;
  auditReasonRedacted: string;
  createdAt: string;
};

export type RefundStateMutationAuditPersistenceEventRecord = {
  id: string;
  auditPersistenceId: string;
  action: RefundStateMutationAuditPersistenceEventAction;
  actorId: string;
  actorType: "admin" | "system_job" | "system" | "operator";
  metadataRedacted: Record<string, unknown>;
  createdAt: string;
};

export type RecordRefundStateMutationAuditPersistenceInput = {
  record: RefundStateMutationAuditPersistenceRecord;
  event: RefundStateMutationAuditPersistenceEventRecord;
};

export interface RefundStateMutationAuditPersistenceRepositoryContract {
  recordAuditPersistence(
    input: RecordRefundStateMutationAuditPersistenceInput,
  ): Promise<RefundStateMutationAuditPersistenceRecord>;
  appendAuditPersistenceEvent(
    event: RefundStateMutationAuditPersistenceEventRecord,
  ): Promise<void>;
  getByAuditPersistenceIdempotencyKey(
    auditPersistenceIdempotencyKey: string,
  ): Promise<RefundStateMutationAuditPersistenceRecord | null>;
  getByApprovalPersistenceIdempotencyKey(
    approvalPersistenceIdempotencyKey: string,
  ): Promise<RefundStateMutationAuditPersistenceRecord[]>;
}

export type RefundStateMutationAuditPersistenceRepositoryDecisionType =
  | "audit_persistence_repository_intent_recorded"
  | "audit_persistence_repository_input_rejected"
  | "audit_persistence_repository_blocked";

export type RefundStateMutationAuditPersistenceRepositoryInput = {
  auditPersistenceDecision: RefundStateMutationAuditPersistenceDecision;
  requestedAt: string;
  repositoryContext: {
    environment: "development" | "test" | "staging" | "production";
    writerMode: "disabled" | "local_in_memory" | "db";
    repositoryReady: boolean;
    idempotencyReplayReady: boolean;
    eventAppendOnlyReady: boolean;
    replayReadModelReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationAuditPersistenceRepositoryDecision = {
  decision: RefundStateMutationAuditPersistenceRepositoryDecisionType;
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
    intentType: "refund_state_mutation_audit_persistence_repository_disabled";
    auditPersistenceIdempotencyKey: string;
    approvalPersistenceIdempotencyKey: string;
    approvalCandidateIdempotencyKey?: string;
    targetState?: string;
    repositoryWriteAllowed: false;
    dbWriteAllowed: false;
    productionWriteAllowed: false;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_audit_persistence_repository_intent_recorded"
      | "refund_state_audit_persistence_repository_input_rejected"
      | "refund_state_audit_persistence_repository_blocked";
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
  "providerRequestPayload",
  "providerQueryPayload",
  "providerRefundRequest",
  "providerRefundQuery",
  "providerRefundRequestPayload",
  "providerRefundQueryPayload",
  "refundQuery",
  "repositoryWriteAllowed",
  "dbWriteAllowed",
  "productionWriteAllowed",
  "auditWriteAllowed",
  "approvalWriteAllowed",
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
  "providerQueryAllowed",
  "networkRequestAllowed",
  "workflowExecution",
  "executeWorkflow",
  "refundStateMutation",
  "auditPersistence",
  "repositoryIntent",
  "auditWrite",
  "dbWrite",
  "financialMutation",
  "settlementMutation",
  "commissionMutation",
  "payoutMutation",
  "settlementAdjustment",
  "commissionAdjustment",
  "payoutAdjustment",
  "fulfillmentMutation",
  "logisticsMutation",
  "fullPhone",
  "fullAddress",
  "identityNumber",
  "bankCardNumber",
  "blockCodes",
  "writerMode",
  "auditPersistenceDecision",
  "auditPersistenceIdempotencyKey",
  "approvalPersistenceIdempotencyKey",
  "approvalCandidateIdempotencyKey",
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

const isAuditPersistenceSafe = (
  decision: RefundStateMutationAuditPersistenceDecision,
): boolean =>
  decision.auditWriteAllowed === false &&
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
  (!decision.auditPersistenceIntent ||
    (decision.auditPersistenceIntent.auditWriteAllowed === false &&
      decision.auditPersistenceIntent.dbWriteAllowed === false &&
      decision.auditPersistenceIntent.productionWriteAllowed === false &&
      decision.auditPersistenceIntent.workflowExecutionAllowed === false &&
      decision.auditPersistenceIntent.stateMutationAllowed === false &&
      decision.auditPersistenceIntent.refundSuccessState === false));

const blockCodes = (
  input: RefundStateMutationAuditPersistenceRepositoryInput,
): string[] => {
  const codes = ["audit_persistence_repository_disabled"];

  if (!isAuditPersistenceSafe(input.auditPersistenceDecision)) {
    codes.push("unsafe_audit_persistence_decision");
  }

  if (
    input.auditPersistenceDecision.decision !==
      "audit_persistence_intent_recorded" ||
    !input.auditPersistenceDecision.auditPersistenceIntent
  ) {
    codes.push("audit_persistence_intent_missing");
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

  if (!input.repositoryContext.replayReadModelReady) {
    codes.push("replay_read_model_missing");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationAuditPersistenceRepositoryInput,
): string =>
  [
    "refund_state_mutation_audit_persistence_repository",
    input.auditPersistenceDecision.idempotencyKey,
    input.repositoryContext.environment,
    input.repositoryContext.writerMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const actionFor = (
  decision: RefundStateMutationAuditPersistenceRepositoryDecisionType,
): RefundStateMutationAuditPersistenceRepositoryDecision["auditEvent"]["action"] => {
  if (decision === "audit_persistence_repository_intent_recorded") {
    return "refund_state_audit_persistence_repository_intent_recorded";
  }
  if (decision === "audit_persistence_repository_input_rejected") {
    return "refund_state_audit_persistence_repository_input_rejected";
  }
  return "refund_state_audit_persistence_repository_blocked";
};

const decisionFor = (
  input: RefundStateMutationAuditPersistenceRepositoryInput,
): RefundStateMutationAuditPersistenceRepositoryDecisionType => {
  if (!isAuditPersistenceSafe(input.auditPersistenceDecision)) {
    return "audit_persistence_repository_blocked";
  }

  if (input.repositoryContext.environment === "production") {
    return "audit_persistence_repository_blocked";
  }

  if (
    input.auditPersistenceDecision.decision !==
      "audit_persistence_intent_recorded" ||
    !input.auditPersistenceDecision.auditPersistenceIntent
  ) {
    return "audit_persistence_repository_input_rejected";
  }

  return "audit_persistence_repository_intent_recorded";
};

export const mapAuditPersistenceToRepositoryIntent = (
  input: RefundStateMutationAuditPersistenceRepositoryInput,
): RefundStateMutationAuditPersistenceRepositoryDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const persistenceIntent = input.auditPersistenceDecision.auditPersistenceIntent;

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
      decision === "audit_persistence_repository_intent_recorded" &&
      persistenceIntent
        ? {
            intentType:
              "refund_state_mutation_audit_persistence_repository_disabled",
            auditPersistenceIdempotencyKey:
              input.auditPersistenceDecision.idempotencyKey,
            approvalPersistenceIdempotencyKey:
              persistenceIntent.approvalPersistenceIdempotencyKey,
            approvalCandidateIdempotencyKey:
              persistenceIntent.approvalCandidateIdempotencyKey,
            targetState: persistenceIntent.targetState,
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
        idempotencyReplayReady: input.repositoryContext.idempotencyReplayReady,
        eventAppendOnlyReady: input.repositoryContext.eventAppendOnlyReady,
        replayReadModelReady: input.repositoryContext.replayReadModelReady,
        auditPersistenceDecision: input.auditPersistenceDecision.decision,
        auditPersistenceIdempotencyKey: input.auditPersistenceDecision.idempotencyKey,
        approvalPersistenceIdempotencyKey:
          persistenceIntent?.approvalPersistenceIdempotencyKey,
        approvalCandidateIdempotencyKey:
          persistenceIntent?.approvalCandidateIdempotencyKey,
        targetState: persistenceIntent?.targetState,
        metadata: input.repositoryContext.metadata ?? {},
      }),
    },
  };
};
