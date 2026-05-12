import { RefundStateMutationRuntimeAdapterDecision } from "./refund-state-mutation-runtime-adapter";

export type RefundStateMutationAuditWriteDecisionType =
  | "audit_write_intent_recorded"
  | "audit_write_input_rejected"
  | "audit_write_blocked";

export type RefundStateMutationAuditWriteInput = {
  runtimeDecision: RefundStateMutationRuntimeAdapterDecision;
  requestedAt: string;
  auditContext: {
    writerMode: "disabled" | "local_in_memory" | "db";
    actorType: "system_job" | "admin";
    actorId?: string;
    auditAllowlistReady: boolean;
    idempotencyRepositoryReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationAuditWriteDecision = {
  decision: RefundStateMutationAuditWriteDecisionType;
  auditWriteAllowed: false;
  dbWriteAllowed: false;
  executable: false;
  workflowExecutionAllowed: false;
  stateMutationAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  settlementMutationAllowed: false;
  commissionMutationAllowed: false;
  payoutMutationAllowed: false;
  fulfillmentMutationAllowed: false;
  logisticsMutationAllowed: false;
  blockCodes: string[];
  idempotencyKey: string;
  auditWriteIntent?: {
    intentType: "refund_state_mutation_audit_write_disabled";
    runtimeAdapterIdempotencyKey: string;
    approvalCandidateIdempotencyKey?: string;
    targetState?: string;
    auditWriteAllowed: false;
    dbWriteAllowed: false;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
  };
  auditEvent: {
    action:
      | "refund_state_audit_write_intent_recorded"
      | "refund_state_audit_write_input_rejected"
      | "refund_state_audit_write_blocked";
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
  "enabled",
  "environmentAllowed",
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
  "runtimeDecision",
  "runtimeAdapterIdempotencyKey",
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

const isRuntimeDecisionSafe = (
  runtimeDecision: RefundStateMutationRuntimeAdapterDecision,
): boolean =>
  runtimeDecision.enabled === false &&
  runtimeDecision.environmentAllowed === false &&
  runtimeDecision.executable === false &&
  runtimeDecision.workflowExecutionAllowed === false &&
  runtimeDecision.stateMutationAllowed === false &&
  runtimeDecision.runtimeMutationBlocked === true &&
  runtimeDecision.refundSuccessState === false &&
  runtimeDecision.settlementMutationAllowed === false &&
  runtimeDecision.commissionMutationAllowed === false &&
  runtimeDecision.payoutMutationAllowed === false &&
  runtimeDecision.fulfillmentMutationAllowed === false &&
  runtimeDecision.logisticsMutationAllowed === false &&
  (!runtimeDecision.adapterRecord ||
    (runtimeDecision.adapterRecord.workflowExecutionAllowed === false &&
      runtimeDecision.adapterRecord.stateMutationAllowed === false &&
      runtimeDecision.adapterRecord.settlementMutationAllowed === false &&
      runtimeDecision.adapterRecord.commissionMutationAllowed === false &&
      runtimeDecision.adapterRecord.payoutMutationAllowed === false &&
      runtimeDecision.adapterRecord.fulfillmentMutationAllowed === false &&
      runtimeDecision.adapterRecord.logisticsMutationAllowed === false));

const blockCodes = (input: RefundStateMutationAuditWriteInput): string[] => {
  const codes = ["audit_write_disabled"];

  if (!isRuntimeDecisionSafe(input.runtimeDecision)) {
    codes.push("unsafe_runtime_adapter_decision");
  }

  if (
    input.runtimeDecision.decision !== "runtime_adapter_disabled_recorded" ||
    !input.runtimeDecision.adapterRecord
  ) {
    codes.push("runtime_adapter_record_missing");
  }

  if (input.auditContext.writerMode !== "disabled") {
    codes.push("writer_mode_ignored_until_go");
  }

  if (!input.auditContext.auditAllowlistReady) {
    codes.push("audit_allowlist_missing");
  }

  if (!input.auditContext.idempotencyRepositoryReady) {
    codes.push("idempotency_repository_missing");
  }

  return codes;
};

const idempotencyKey = (input: RefundStateMutationAuditWriteInput): string =>
  [
    "refund_state_mutation_audit_write",
    input.runtimeDecision.idempotencyKey,
    input.auditContext.writerMode,
    input.auditContext.actorId ?? "missing_actor",
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const actionFor = (
  decision: RefundStateMutationAuditWriteDecisionType,
): RefundStateMutationAuditWriteDecision["auditEvent"]["action"] => {
  if (decision === "audit_write_intent_recorded") {
    return "refund_state_audit_write_intent_recorded";
  }

  if (decision === "audit_write_input_rejected") {
    return "refund_state_audit_write_input_rejected";
  }

  return "refund_state_audit_write_blocked";
};

const decisionFor = (
  input: RefundStateMutationAuditWriteInput,
): RefundStateMutationAuditWriteDecisionType => {
  if (!isRuntimeDecisionSafe(input.runtimeDecision)) {
    return "audit_write_blocked";
  }

  if (
    input.runtimeDecision.decision !== "runtime_adapter_disabled_recorded" ||
    !input.runtimeDecision.adapterRecord
  ) {
    return "audit_write_input_rejected";
  }

  return "audit_write_intent_recorded";
};

export const mapRuntimeAdapterToAuditWriteIntent = (
  input: RefundStateMutationAuditWriteInput,
): RefundStateMutationAuditWriteDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const adapterRecord = input.runtimeDecision.adapterRecord;

  return {
    decision,
    auditWriteAllowed: false,
    dbWriteAllowed: false,
    executable: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    settlementMutationAllowed: false,
    commissionMutationAllowed: false,
    payoutMutationAllowed: false,
    fulfillmentMutationAllowed: false,
    logisticsMutationAllowed: false,
    blockCodes: codes,
    idempotencyKey: idempotencyKey(input),
    auditWriteIntent:
      decision === "audit_write_intent_recorded" && adapterRecord
        ? {
            intentType: "refund_state_mutation_audit_write_disabled",
            runtimeAdapterIdempotencyKey: input.runtimeDecision.idempotencyKey,
            approvalCandidateIdempotencyKey:
              adapterRecord.approvalCandidateIdempotencyKey,
            targetState: adapterRecord.targetState,
            auditWriteAllowed: false,
            dbWriteAllowed: false,
            workflowExecutionAllowed: false,
            stateMutationAllowed: false,
          }
        : undefined,
    auditEvent: {
      action: actionFor(decision),
      metadata: {
        ...sanitizeMetadata(input.runtimeDecision.auditEvent.metadata),
        ...sanitizeMetadata(input.auditContext.metadata),
        requestedAt: input.requestedAt,
        writerMode: input.auditContext.writerMode,
        actorType: input.auditContext.actorType,
        actorId: input.auditContext.actorId,
        auditAllowlistReady: input.auditContext.auditAllowlistReady,
        idempotencyRepositoryReady:
          input.auditContext.idempotencyRepositoryReady,
        runtimeDecision: input.runtimeDecision.decision,
        runtimeAdapterIdempotencyKey: input.runtimeDecision.idempotencyKey,
        blockCodes: codes,
      },
    },
  };
};
