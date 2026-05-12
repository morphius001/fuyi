import { RefundStateMutationOperatorApprovalDecision } from "./refund-state-mutation-operator-approval";

export type RefundStateMutationRuntimeAdapterDecisionType =
  | "runtime_adapter_disabled_recorded"
  | "runtime_adapter_input_rejected"
  | "runtime_adapter_blocked";

export type RefundStateMutationRuntimeAdapterInput = {
  approvalDecision: RefundStateMutationOperatorApprovalDecision;
  requestedAt: string;
  runtimeContext: {
    environment: "development" | "test" | "staging" | "production";
    featureFlagEnabled: boolean;
    adapterRegistered: boolean;
    auditWriteAvailable: boolean;
    rollbackRunbookReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationRuntimeAdapterDecision = {
  decision: RefundStateMutationRuntimeAdapterDecisionType;
  enabled: false;
  environmentAllowed: false;
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
  adapterRecord?: {
    recordType: "refund_state_mutation_runtime_adapter_disabled";
    approvalCandidateIdempotencyKey: string;
    targetState?: string;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    settlementMutationAllowed: false;
    commissionMutationAllowed: false;
    payoutMutationAllowed: false;
    fulfillmentMutationAllowed: false;
    logisticsMutationAllowed: false;
  };
  auditEvent: {
    action:
      | "refund_state_runtime_adapter_disabled_recorded"
      | "refund_state_runtime_adapter_input_rejected"
      | "refund_state_runtime_adapter_blocked";
    metadata: Record<string, unknown>;
  };
};

const deniedMetadataKeys = new Set([
  "rawProviderPayload",
  "rawPayload",
  "signature",
  "secret",
  "privateKey",
  "certificate",
  "apiV3Key",
  "webhookSecret",
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

const idempotencyKey = (
  input: RefundStateMutationRuntimeAdapterInput,
): string =>
  [
    "refund_state_mutation_runtime_adapter",
    input.approvalDecision.idempotencyKey,
    input.runtimeContext.environment,
    input.runtimeContext.featureFlagEnabled ? "flag_on" : "flag_off",
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const adapterBlockCodes = (
  input: RefundStateMutationRuntimeAdapterInput,
): string[] => {
  const codes: string[] = ["runtime_adapter_disabled"];

  if (!isApprovalDecisionSafe(input.approvalDecision)) {
    codes.push("unsafe_operator_approval");
  }

  if (
    input.approvalDecision.decision !==
      "operator_approval_candidate_recorded" ||
    !input.approvalDecision.approvalCandidate
  ) {
    codes.push("operator_approval_candidate_missing");
  }

  if (input.runtimeContext.featureFlagEnabled) {
    codes.push("feature_flag_ignored_until_go");
  }

  if (input.runtimeContext.adapterRegistered) {
    codes.push("adapter_registration_ignored_until_go");
  }

  return codes;
};

const actionFor = (
  decision: RefundStateMutationRuntimeAdapterDecisionType,
): RefundStateMutationRuntimeAdapterDecision["auditEvent"]["action"] => {
  if (decision === "runtime_adapter_disabled_recorded") {
    return "refund_state_runtime_adapter_disabled_recorded";
  }

  if (decision === "runtime_adapter_input_rejected") {
    return "refund_state_runtime_adapter_input_rejected";
  }

  return "refund_state_runtime_adapter_blocked";
};

const decisionType = (
  input: RefundStateMutationRuntimeAdapterInput,
  blockCodes: string[],
): RefundStateMutationRuntimeAdapterDecisionType => {
  if (!isApprovalDecisionSafe(input.approvalDecision)) {
    return "runtime_adapter_blocked";
  }

  if (
    input.approvalDecision.decision !==
      "operator_approval_candidate_recorded" ||
    !input.approvalDecision.approvalCandidate
  ) {
    return "runtime_adapter_input_rejected";
  }

  if (blockCodes.includes("runtime_adapter_disabled")) {
    return "runtime_adapter_disabled_recorded";
  }

  return "runtime_adapter_blocked";
};

export const mapOperatorApprovalToRuntimeAdapterDecision = (
  input: RefundStateMutationRuntimeAdapterInput,
): RefundStateMutationRuntimeAdapterDecision => {
  const blockCodes = adapterBlockCodes(input);
  const decision = decisionType(input, blockCodes);
  const approvalCandidate = input.approvalDecision.approvalCandidate;

  return {
    decision,
    enabled: false,
    environmentAllowed: false,
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
    blockCodes,
    idempotencyKey: idempotencyKey(input),
    adapterRecord:
      decision === "runtime_adapter_disabled_recorded" && approvalCandidate
        ? {
            recordType: "refund_state_mutation_runtime_adapter_disabled",
            approvalCandidateIdempotencyKey: input.approvalDecision.idempotencyKey,
            targetState: approvalCandidate.targetState,
            workflowExecutionAllowed: false,
            stateMutationAllowed: false,
            settlementMutationAllowed: false,
            commissionMutationAllowed: false,
            payoutMutationAllowed: false,
            fulfillmentMutationAllowed: false,
            logisticsMutationAllowed: false,
          }
        : undefined,
    auditEvent: {
      action: actionFor(decision),
      metadata: {
        requestedAt: input.requestedAt,
        environment: input.runtimeContext.environment,
        featureFlagEnabled: input.runtimeContext.featureFlagEnabled,
        adapterRegistered: input.runtimeContext.adapterRegistered,
        auditWriteAvailable: input.runtimeContext.auditWriteAvailable,
        rollbackRunbookReady: input.runtimeContext.rollbackRunbookReady,
        approvalDecision: input.approvalDecision.decision,
        approvalIdempotencyKey: input.approvalDecision.idempotencyKey,
        blockCodes,
        ...sanitizeMetadata(input.approvalDecision.auditEvent.metadata),
        ...sanitizeMetadata(input.runtimeContext.metadata),
      },
    },
  };
};
