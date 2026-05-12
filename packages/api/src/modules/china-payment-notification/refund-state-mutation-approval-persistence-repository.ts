import { RefundStateMutationApprovalPersistenceDecision } from "./refund-state-mutation-approval-persistence";

export type RefundStateMutationApprovalPersistenceStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "expired"
  | "replayed";

export type RefundStateMutationApprovalPersistenceEventAction =
  | "approval_requested"
  | "approval_approved"
  | "approval_rejected"
  | "approval_expired"
  | "approval_replayed"
  | "manual_review_handoff";

export type RefundStateMutationApprovalPersistenceRecord = {
  id: string;
  approvalIdempotencyKey: string;
  platformRefundId: string;
  providerName: "mock_china_pay" | "alipay" | "wechat_pay";
  providerRefundReference: string;
  merchantOrderReference: string;
  refundRequestReference: string;
  targetState: string;
  targetStateAuditLabel: string;
  amountMinor: number;
  currency: "CNY";
  requestActorId: string;
  requestActorType: "admin" | "system_job";
  reviewerActorId: string;
  reviewerRole: "admin_refund_reviewer" | "admin_finance_reviewer";
  permissionEvidenceId: string;
  ownershipEvidenceId: string;
  readinessDecisionKey: string;
  shadowCommandKey: string;
  runtimeAdapterDecisionKey: string;
  featureFlagSnapshotKey: string;
  status: RefundStateMutationApprovalPersistenceStatus;
  decisionReasonRedacted: string;
  createdAt: string;
  decidedAt?: string;
  expiresAt?: string;
};

export type RefundStateMutationApprovalPersistenceEventRecord = {
  id: string;
  approvalId: string;
  action: RefundStateMutationApprovalPersistenceEventAction;
  actorId: string;
  actorType: "admin" | "system_job" | "system" | "operator";
  metadataRedacted: Record<string, unknown>;
  createdAt: string;
};

export type RecordRefundStateMutationApprovalPersistenceInput = {
  record: RefundStateMutationApprovalPersistenceRecord;
  event: RefundStateMutationApprovalPersistenceEventRecord;
};

export interface RefundStateMutationApprovalPersistenceRepositoryContract {
  recordApprovalPersistence(
    input: RecordRefundStateMutationApprovalPersistenceInput,
  ): Promise<RefundStateMutationApprovalPersistenceRecord>;
  appendApprovalPersistenceEvent(
    event: RefundStateMutationApprovalPersistenceEventRecord,
  ): Promise<void>;
  getByApprovalIdempotencyKey(
    approvalIdempotencyKey: string,
  ): Promise<RefundStateMutationApprovalPersistenceRecord | null>;
  getByPlatformRefundId(
    platformRefundId: string,
  ): Promise<RefundStateMutationApprovalPersistenceRecord[]>;
  getByProviderRefundReference(
    providerName: RefundStateMutationApprovalPersistenceRecord["providerName"],
    providerRefundReference: string,
  ): Promise<RefundStateMutationApprovalPersistenceRecord[]>;
}

export type RefundStateMutationApprovalPersistenceRepositoryDecisionType =
  | "approval_persistence_repository_intent_recorded"
  | "approval_persistence_repository_input_rejected"
  | "approval_persistence_repository_blocked";

export type RefundStateMutationApprovalPersistenceRepositoryInput = {
  approvalPersistenceDecision: RefundStateMutationApprovalPersistenceDecision;
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

export type RefundStateMutationApprovalPersistenceRepositoryDecision = {
  decision: RefundStateMutationApprovalPersistenceRepositoryDecisionType;
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
    intentType: "refund_state_mutation_approval_persistence_repository_disabled";
    approvalPersistenceIdempotencyKey: string;
    approvalCandidateIdempotencyKey: string;
    targetState?: string;
    reviewerActorId: string;
    reviewerRole: string;
    permissionEvidenceId: string;
    repositoryWriteAllowed: false;
    dbWriteAllowed: false;
    productionWriteAllowed: false;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_approval_persistence_repository_intent_recorded"
      | "refund_state_approval_persistence_repository_input_rejected"
      | "refund_state_approval_persistence_repository_blocked";
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
  "approvalPersistence",
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
  "approvalPersistenceDecision",
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

const isApprovalPersistenceSafe = (
  decision: RefundStateMutationApprovalPersistenceDecision,
): boolean =>
  decision.approvalWriteAllowed === false &&
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
  (!decision.persistenceIntent ||
    (decision.persistenceIntent.approvalWriteAllowed === false &&
      decision.persistenceIntent.dbWriteAllowed === false &&
      decision.persistenceIntent.productionWriteAllowed === false &&
      decision.persistenceIntent.workflowExecutionAllowed === false &&
      decision.persistenceIntent.stateMutationAllowed === false &&
      decision.persistenceIntent.refundSuccessState === false));

const blockCodes = (
  input: RefundStateMutationApprovalPersistenceRepositoryInput,
): string[] => {
  const codes = ["approval_persistence_repository_disabled"];

  if (!isApprovalPersistenceSafe(input.approvalPersistenceDecision)) {
    codes.push("unsafe_approval_persistence_decision");
  }

  if (
    input.approvalPersistenceDecision.decision !==
      "approval_persistence_intent_recorded" ||
    !input.approvalPersistenceDecision.persistenceIntent
  ) {
    codes.push("approval_persistence_intent_missing");
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
  input: RefundStateMutationApprovalPersistenceRepositoryInput,
): string =>
  [
    "refund_state_mutation_approval_persistence_repository",
    input.approvalPersistenceDecision.idempotencyKey,
    input.repositoryContext.environment,
    input.repositoryContext.writerMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const actionFor = (
  decision: RefundStateMutationApprovalPersistenceRepositoryDecisionType,
): RefundStateMutationApprovalPersistenceRepositoryDecision["auditEvent"]["action"] => {
  if (decision === "approval_persistence_repository_intent_recorded") {
    return "refund_state_approval_persistence_repository_intent_recorded";
  }
  if (decision === "approval_persistence_repository_input_rejected") {
    return "refund_state_approval_persistence_repository_input_rejected";
  }
  return "refund_state_approval_persistence_repository_blocked";
};

const decisionFor = (
  input: RefundStateMutationApprovalPersistenceRepositoryInput,
): RefundStateMutationApprovalPersistenceRepositoryDecisionType => {
  if (!isApprovalPersistenceSafe(input.approvalPersistenceDecision)) {
    return "approval_persistence_repository_blocked";
  }

  if (input.repositoryContext.environment === "production") {
    return "approval_persistence_repository_blocked";
  }

  if (
    input.approvalPersistenceDecision.decision !==
      "approval_persistence_intent_recorded" ||
    !input.approvalPersistenceDecision.persistenceIntent
  ) {
    return "approval_persistence_repository_input_rejected";
  }

  return "approval_persistence_repository_intent_recorded";
};

export const mapApprovalPersistenceToRepositoryIntent = (
  input: RefundStateMutationApprovalPersistenceRepositoryInput,
): RefundStateMutationApprovalPersistenceRepositoryDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const persistenceIntent =
    input.approvalPersistenceDecision.persistenceIntent;

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
      decision === "approval_persistence_repository_intent_recorded" &&
      persistenceIntent
        ? {
            intentType:
              "refund_state_mutation_approval_persistence_repository_disabled",
            approvalPersistenceIdempotencyKey:
              input.approvalPersistenceDecision.idempotencyKey,
            approvalCandidateIdempotencyKey:
              persistenceIntent.approvalCandidateIdempotencyKey,
            targetState: persistenceIntent.targetState,
            reviewerActorId: persistenceIntent.reviewerActorId,
            reviewerRole: persistenceIntent.reviewerRole,
            permissionEvidenceId: persistenceIntent.permissionEvidenceId,
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
        approvalPersistenceDecision:
          input.approvalPersistenceDecision.decision,
        approvalPersistenceIdempotencyKey:
          input.approvalPersistenceDecision.idempotencyKey,
        approvalCandidateIdempotencyKey:
          persistenceIntent?.approvalCandidateIdempotencyKey,
        targetState: persistenceIntent?.targetState,
        reviewerRole: persistenceIntent?.reviewerRole,
        metadata: input.repositoryContext.metadata ?? {},
      }),
    },
  };
};
