import { RefundStateMutationApprovalPersistenceDecision } from "./refund-state-mutation-approval-persistence";

export type RefundStateMutationAuditPersistenceDecisionType =
  | "audit_persistence_intent_recorded"
  | "audit_persistence_input_rejected"
  | "audit_persistence_blocked";

export type RefundStateMutationAuditPersistenceInput = {
  approvalPersistenceDecision: RefundStateMutationApprovalPersistenceDecision;
  requestedAt: string;
  auditContext: {
    environment: "development" | "test" | "staging" | "production";
    writerMode: "disabled" | "local_in_memory" | "db";
    auditRepositoryReady: boolean;
    idempotencyRepositoryReady: boolean;
    appendOnlyLogReady: boolean;
    failClosedReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationAuditPersistenceDecision = {
  decision: RefundStateMutationAuditPersistenceDecisionType;
  auditWriteAllowed: false;
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
  auditPersistenceIntent?: {
    intentType: "refund_state_mutation_audit_persistence_disabled";
    approvalPersistenceIdempotencyKey: string;
    approvalCandidateIdempotencyKey?: string;
    targetState?: string;
    auditWriteAllowed: false;
    dbWriteAllowed: false;
    productionWriteAllowed: false;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_audit_persistence_intent_recorded"
      | "refund_state_audit_persistence_input_rejected"
      | "refund_state_audit_persistence_blocked";
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
  "auditWriteAllowed",
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
  "financialMutationAllowed",
  "permissionMutationAllowed",
  "fulfillmentMutationAllowed",
  "logisticsMutationAllowed",
  "providerQueryAllowed",
  "networkRequestAllowed",
  "workflowExecution",
  "executeWorkflow",
  "refundStateMutation",
  "auditPersistence",
  "auditPersistenceIntent",
  "auditWrite",
  "dbWrite",
  "financialMutation",
  "settlementMutation",
  "commissionMutation",
  "payoutMutation",
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
  input: RefundStateMutationAuditPersistenceInput,
): string[] => {
  const codes = ["audit_persistence_disabled"];

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
  if (input.auditContext.writerMode !== "disabled") {
    codes.push("writer_mode_ignored_until_go");
  }
  if (input.auditContext.environment === "production") {
    codes.push("production_write_blocked");
  }
  if (!input.auditContext.auditRepositoryReady) {
    codes.push("audit_repository_missing");
  }
  if (!input.auditContext.idempotencyRepositoryReady) {
    codes.push("idempotency_repository_missing");
  }
  if (!input.auditContext.appendOnlyLogReady) {
    codes.push("append_only_log_missing");
  }
  if (!input.auditContext.failClosedReady) {
    codes.push("fail_closed_missing");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationAuditPersistenceInput,
): string =>
  [
    "refund_state_mutation_audit_persistence",
    input.approvalPersistenceDecision.idempotencyKey,
    input.auditContext.environment,
    input.auditContext.writerMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const actionFor = (
  decision: RefundStateMutationAuditPersistenceDecisionType,
): RefundStateMutationAuditPersistenceDecision["auditEvent"]["action"] => {
  if (decision === "audit_persistence_intent_recorded") {
    return "refund_state_audit_persistence_intent_recorded";
  }
  if (decision === "audit_persistence_input_rejected") {
    return "refund_state_audit_persistence_input_rejected";
  }
  return "refund_state_audit_persistence_blocked";
};

const decisionFor = (
  input: RefundStateMutationAuditPersistenceInput,
): RefundStateMutationAuditPersistenceDecisionType => {
  if (!isApprovalPersistenceSafe(input.approvalPersistenceDecision)) {
    return "audit_persistence_blocked";
  }
  if (input.auditContext.environment === "production") {
    return "audit_persistence_blocked";
  }
  if (
    input.approvalPersistenceDecision.decision !==
      "approval_persistence_intent_recorded" ||
    !input.approvalPersistenceDecision.persistenceIntent
  ) {
    return "audit_persistence_input_rejected";
  }
  return "audit_persistence_intent_recorded";
};

export const mapApprovalPersistenceToAuditPersistenceIntent = (
  input: RefundStateMutationAuditPersistenceInput,
): RefundStateMutationAuditPersistenceDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const persistenceIntent =
    input.approvalPersistenceDecision.persistenceIntent;

  return {
    decision,
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
    blockCodes: codes,
    idempotencyKey: idempotencyKey(input),
    auditPersistenceIntent:
      decision === "audit_persistence_intent_recorded" && persistenceIntent
        ? {
            intentType: "refund_state_mutation_audit_persistence_disabled",
            approvalPersistenceIdempotencyKey:
              input.approvalPersistenceDecision.idempotencyKey,
            approvalCandidateIdempotencyKey:
              persistenceIntent.approvalCandidateIdempotencyKey,
            targetState: persistenceIntent.targetState,
            auditWriteAllowed: false,
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
        ...sanitizeMetadata(
          input.approvalPersistenceDecision.auditEvent.metadata,
        ),
        ...sanitizeMetadata(input.auditContext.metadata),
        requestedAt: input.requestedAt,
        environment: input.auditContext.environment,
        writerMode: input.auditContext.writerMode,
        auditRepositoryReady: input.auditContext.auditRepositoryReady,
        idempotencyRepositoryReady:
          input.auditContext.idempotencyRepositoryReady,
        appendOnlyLogReady: input.auditContext.appendOnlyLogReady,
        failClosedReady: input.auditContext.failClosedReady,
        approvalPersistenceDecision:
          input.approvalPersistenceDecision.decision,
        approvalPersistenceIdempotencyKey:
          input.approvalPersistenceDecision.idempotencyKey,
        blockCodes: codes,
      },
    },
  };
};
