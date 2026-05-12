import { RefundStateMutationAuditWriteDecision } from "./refund-state-mutation-audit-write";

export type RefundStateMutationWorkflowAdapterDecisionType =
  | "workflow_adapter_command_candidate_recorded"
  | "workflow_adapter_input_rejected"
  | "workflow_adapter_blocked";

export type RefundStateMutationWorkflowAdapterInput = {
  auditWriteDecision: RefundStateMutationAuditWriteDecision;
  requestedAt: string;
  workflowContext: {
    environment: "development" | "test" | "staging" | "production";
    adapterMode: "disabled" | "dry_run" | "registered";
    featureFlagEnabled: boolean;
    adapterRegistered: boolean;
    dryRunRepositoryReady: boolean;
    rollbackRunbookReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationWorkflowAdapterDecision = {
  decision: RefundStateMutationWorkflowAdapterDecisionType;
  adapterEnabled: false;
  environmentAllowed: false;
  executable: false;
  workflowCommandPrepared: boolean;
  workflowDryRunOnly: true;
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
  commandCandidate?: {
    commandType: "refund_state_mutation_workflow_adapter_disabled";
    auditWriteIntentIdempotencyKey: string;
    runtimeAdapterIdempotencyKey?: string;
    approvalCandidateIdempotencyKey?: string;
    targetState?: string;
    workflowCommandPrepared: true;
    workflowDryRunOnly: true;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_workflow_adapter_command_candidate_recorded"
      | "refund_state_workflow_adapter_input_rejected"
      | "refund_state_workflow_adapter_blocked";
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
  "adapterEnabled",
  "environmentAllowed",
  "enabled",
  "executable",
  "workflowCommandPrepared",
  "workflowDryRunOnly",
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
  "workflowAdapter",
  "workflowCommand",
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
  "auditWriteIntent",
  "commandCandidate",
  "adapterMode",
  "auditWriteDecision",
  "auditWriteIntentIdempotencyKey",
  "runtimeAdapterIdempotencyKey",
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

const isAuditWriteDecisionSafe = (
  auditWriteDecision: RefundStateMutationAuditWriteDecision,
): boolean =>
  auditWriteDecision.auditWriteAllowed === false &&
  auditWriteDecision.dbWriteAllowed === false &&
  auditWriteDecision.executable === false &&
  auditWriteDecision.workflowExecutionAllowed === false &&
  auditWriteDecision.stateMutationAllowed === false &&
  auditWriteDecision.runtimeMutationBlocked === true &&
  auditWriteDecision.refundSuccessState === false &&
  auditWriteDecision.settlementMutationAllowed === false &&
  auditWriteDecision.commissionMutationAllowed === false &&
  auditWriteDecision.payoutMutationAllowed === false &&
  auditWriteDecision.fulfillmentMutationAllowed === false &&
  auditWriteDecision.logisticsMutationAllowed === false &&
  (!auditWriteDecision.auditWriteIntent ||
    (auditWriteDecision.auditWriteIntent.auditWriteAllowed === false &&
      auditWriteDecision.auditWriteIntent.dbWriteAllowed === false &&
      auditWriteDecision.auditWriteIntent.workflowExecutionAllowed === false &&
      auditWriteDecision.auditWriteIntent.stateMutationAllowed === false));

const blockCodes = (
  input: RefundStateMutationWorkflowAdapterInput,
): string[] => {
  const codes = ["workflow_adapter_disabled"];

  if (!isAuditWriteDecisionSafe(input.auditWriteDecision)) {
    codes.push("unsafe_audit_write_decision");
  }

  if (
    input.auditWriteDecision.decision !== "audit_write_intent_recorded" ||
    !input.auditWriteDecision.auditWriteIntent
  ) {
    codes.push("audit_write_intent_missing");
  }

  if (input.workflowContext.adapterMode !== "disabled") {
    codes.push("adapter_mode_ignored_until_go");
  }

  if (input.workflowContext.featureFlagEnabled) {
    codes.push("feature_flag_ignored_until_go");
  }

  if (input.workflowContext.adapterRegistered) {
    codes.push("adapter_registration_ignored_until_go");
  }

  if (!input.workflowContext.dryRunRepositoryReady) {
    codes.push("dry_run_repository_missing");
  }

  if (!input.workflowContext.rollbackRunbookReady) {
    codes.push("rollback_runbook_missing");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationWorkflowAdapterInput,
): string =>
  [
    "refund_state_mutation_workflow_adapter",
    input.auditWriteDecision.idempotencyKey,
    input.workflowContext.environment,
    input.workflowContext.adapterMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const actionFor = (
  decision: RefundStateMutationWorkflowAdapterDecisionType,
): RefundStateMutationWorkflowAdapterDecision["auditEvent"]["action"] => {
  if (decision === "workflow_adapter_command_candidate_recorded") {
    return "refund_state_workflow_adapter_command_candidate_recorded";
  }

  if (decision === "workflow_adapter_input_rejected") {
    return "refund_state_workflow_adapter_input_rejected";
  }

  return "refund_state_workflow_adapter_blocked";
};

const decisionFor = (
  input: RefundStateMutationWorkflowAdapterInput,
): RefundStateMutationWorkflowAdapterDecisionType => {
  if (!isAuditWriteDecisionSafe(input.auditWriteDecision)) {
    return "workflow_adapter_blocked";
  }

  if (
    input.auditWriteDecision.decision !== "audit_write_intent_recorded" ||
    !input.auditWriteDecision.auditWriteIntent
  ) {
    return "workflow_adapter_input_rejected";
  }

  return "workflow_adapter_command_candidate_recorded";
};

export const mapAuditWriteIntentToWorkflowAdapterCommand = (
  input: RefundStateMutationWorkflowAdapterInput,
): RefundStateMutationWorkflowAdapterDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const auditWriteIntent = input.auditWriteDecision.auditWriteIntent;

  return {
    decision,
    adapterEnabled: false,
    environmentAllowed: false,
    executable: false,
    workflowCommandPrepared:
      decision === "workflow_adapter_command_candidate_recorded",
    workflowDryRunOnly: true,
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
    commandCandidate:
      decision === "workflow_adapter_command_candidate_recorded" &&
      auditWriteIntent
        ? {
            commandType: "refund_state_mutation_workflow_adapter_disabled",
            auditWriteIntentIdempotencyKey:
              input.auditWriteDecision.idempotencyKey,
            runtimeAdapterIdempotencyKey:
              auditWriteIntent.runtimeAdapterIdempotencyKey,
            approvalCandidateIdempotencyKey:
              auditWriteIntent.approvalCandidateIdempotencyKey,
            targetState: auditWriteIntent.targetState,
            workflowCommandPrepared: true,
            workflowDryRunOnly: true,
            workflowExecutionAllowed: false,
            stateMutationAllowed: false,
            refundSuccessState: false,
          }
        : undefined,
    auditEvent: {
      action: actionFor(decision),
      metadata: {
        ...sanitizeMetadata(input.auditWriteDecision.auditEvent.metadata),
        ...sanitizeMetadata(input.workflowContext.metadata),
        requestedAt: input.requestedAt,
        environment: input.workflowContext.environment,
        adapterMode: input.workflowContext.adapterMode,
        featureFlagEnabled: input.workflowContext.featureFlagEnabled,
        adapterRegistered: input.workflowContext.adapterRegistered,
        dryRunRepositoryReady: input.workflowContext.dryRunRepositoryReady,
        rollbackRunbookReady: input.workflowContext.rollbackRunbookReady,
        auditWriteDecision: input.auditWriteDecision.decision,
        auditWriteIntentIdempotencyKey: input.auditWriteDecision.idempotencyKey,
        blockCodes: codes,
      },
    },
  };
};
