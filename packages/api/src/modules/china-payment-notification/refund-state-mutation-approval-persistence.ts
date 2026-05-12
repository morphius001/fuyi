import { RefundStateMutationOperatorApprovalDecision } from "./refund-state-mutation-operator-approval";

export type RefundStateMutationApprovalPersistenceDecisionType =
  | "approval_persistence_intent_recorded"
  | "approval_persistence_input_rejected"
  | "approval_persistence_blocked";

export type RefundStateMutationApprovalPersistenceInput = {
  approvalDecision: RefundStateMutationOperatorApprovalDecision;
  requestedAt: string;
  persistenceContext: {
    environment: "development" | "test" | "staging" | "production";
    writerMode: "disabled" | "local_in_memory" | "db";
    approvalRepositoryReady: boolean;
    idempotencyRepositoryReady: boolean;
    appendOnlyAuditReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationApprovalPersistenceDecision = {
  decision: RefundStateMutationApprovalPersistenceDecisionType;
  approvalWriteAllowed: false;
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
  persistenceIntent?: {
    intentType: "refund_state_mutation_approval_persistence_disabled";
    approvalCandidateIdempotencyKey: string;
    targetState?: string;
    reviewerActorId: string;
    reviewerRole: string;
    permissionEvidenceId: string;
    approvalWriteAllowed: false;
    dbWriteAllowed: false;
    productionWriteAllowed: false;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_approval_persistence_intent_recorded"
      | "refund_state_approval_persistence_input_rejected"
      | "refund_state_approval_persistence_blocked";
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
  "approvalWriteAllowed",
  "dbWriteAllowed",
  "productionWriteAllowed",
  "executable",
  "workflowExecutionAllowed",
  "stateMutationAllowed",
  "runtimeMutationBlocked",
  "refundSuccessState",
  "operatorApprovalRecorded",
  "settlementMutationAllowed",
  "commissionMutationAllowed",
  "payoutMutationAllowed",
  "financialMutationAllowed",
  "permissionMutationAllowed",
  "fulfillmentMutationAllowed",
  "logisticsMutationAllowed",
  "providerQueryAllowed",
  "networkRequestAllowed",
  "workflowExecution",
  "executeWorkflow",
  "refundStateMutation",
  "approvalPersistence",
  "persistenceIntent",
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
  "approvalDecision",
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

const isApprovalDecisionSafe = (
  approvalDecision: RefundStateMutationOperatorApprovalDecision,
): boolean =>
  approvalDecision.executable === false &&
  approvalDecision.workflowExecutionAllowed === false &&
  approvalDecision.stateMutationAllowed === false &&
  approvalDecision.runtimeMutationBlocked === true &&
  approvalDecision.refundSuccessState === false &&
  (!approvalDecision.approvalCandidate ||
    (approvalDecision.approvalCandidate.workflowExecutionAllowed === false &&
      approvalDecision.approvalCandidate.stateMutationAllowed === false &&
      approvalDecision.approvalCandidate.financialMutationAllowed === false &&
      approvalDecision.approvalCandidate.fulfillmentMutationAllowed === false &&
      approvalDecision.approvalCandidate.logisticsMutationAllowed === false));

const blockCodes = (
  input: RefundStateMutationApprovalPersistenceInput,
): string[] => {
  const codes = ["approval_persistence_disabled"];

  if (!isApprovalDecisionSafe(input.approvalDecision)) {
    codes.push("unsafe_operator_approval_decision");
  }

  if (
    input.approvalDecision.decision !==
      "operator_approval_candidate_recorded" ||
    !input.approvalDecision.approvalCandidate
  ) {
    codes.push("operator_approval_candidate_missing");
  }

  if (input.persistenceContext.writerMode !== "disabled") {
    codes.push("writer_mode_ignored_until_go");
  }

  if (input.persistenceContext.environment === "production") {
    codes.push("production_write_blocked");
  }

  if (!input.persistenceContext.approvalRepositoryReady) {
    codes.push("approval_repository_missing");
  }

  if (!input.persistenceContext.idempotencyRepositoryReady) {
    codes.push("idempotency_repository_missing");
  }

  if (!input.persistenceContext.appendOnlyAuditReady) {
    codes.push("append_only_audit_missing");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationApprovalPersistenceInput,
): string =>
  [
    "refund_state_mutation_approval_persistence",
    input.approvalDecision.idempotencyKey,
    input.persistenceContext.environment,
    input.persistenceContext.writerMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const actionFor = (
  decision: RefundStateMutationApprovalPersistenceDecisionType,
): RefundStateMutationApprovalPersistenceDecision["auditEvent"]["action"] => {
  if (decision === "approval_persistence_intent_recorded") {
    return "refund_state_approval_persistence_intent_recorded";
  }

  if (decision === "approval_persistence_input_rejected") {
    return "refund_state_approval_persistence_input_rejected";
  }

  return "refund_state_approval_persistence_blocked";
};

const decisionFor = (
  input: RefundStateMutationApprovalPersistenceInput,
): RefundStateMutationApprovalPersistenceDecisionType => {
  if (!isApprovalDecisionSafe(input.approvalDecision)) {
    return "approval_persistence_blocked";
  }

  if (input.persistenceContext.environment === "production") {
    return "approval_persistence_blocked";
  }

  if (
    input.approvalDecision.decision !==
      "operator_approval_candidate_recorded" ||
    !input.approvalDecision.approvalCandidate
  ) {
    return "approval_persistence_input_rejected";
  }

  return "approval_persistence_intent_recorded";
};

export const mapOperatorApprovalToPersistenceIntent = (
  input: RefundStateMutationApprovalPersistenceInput,
): RefundStateMutationApprovalPersistenceDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const approvalCandidate = input.approvalDecision.approvalCandidate;

  return {
    decision,
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
    blockCodes: codes,
    idempotencyKey: idempotencyKey(input),
    persistenceIntent:
      decision === "approval_persistence_intent_recorded" &&
      approvalCandidate
        ? {
            intentType: "refund_state_mutation_approval_persistence_disabled",
            approvalCandidateIdempotencyKey: input.approvalDecision.idempotencyKey,
            targetState: approvalCandidate.targetState,
            reviewerActorId: approvalCandidate.reviewerActorId,
            reviewerRole: approvalCandidate.reviewerRole,
            permissionEvidenceId: approvalCandidate.permissionEvidenceId,
            approvalWriteAllowed: false,
            dbWriteAllowed: false,
            productionWriteAllowed: false,
            workflowExecutionAllowed: false,
            stateMutationAllowed: false,
            refundSuccessState: false,
          }
        : undefined,
    auditEvent: {
      action: actionFor(decision),
      metadata: {
        ...sanitizeMetadata(input.approvalDecision.auditEvent.metadata),
        ...sanitizeMetadata(input.persistenceContext.metadata),
        requestedAt: input.requestedAt,
        environment: input.persistenceContext.environment,
        writerMode: input.persistenceContext.writerMode,
        approvalRepositoryReady:
          input.persistenceContext.approvalRepositoryReady,
        idempotencyRepositoryReady:
          input.persistenceContext.idempotencyRepositoryReady,
        appendOnlyAuditReady: input.persistenceContext.appendOnlyAuditReady,
        approvalDecision: input.approvalDecision.decision,
        approvalCandidateIdempotencyKey: input.approvalDecision.idempotencyKey,
        blockCodes: codes,
      },
    },
  };
};
