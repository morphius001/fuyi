import {
  RefundStateMutationShadowCommandDecision,
  RefundStateMutationShadowTargetState,
} from "./refund-state-mutation-shadow-command";

export type RefundStateMutationOperatorApprovalDecisionType =
  | "operator_approval_candidate_recorded"
  | "operator_approval_rejected"
  | "operator_approval_blocked";

export type RefundStateMutationOperatorReviewerRole =
  | "admin_refund_reviewer"
  | "admin_finance_reviewer";

export type RefundStateMutationOperatorApprovalInput = {
  shadowDecision: RefundStateMutationShadowCommandDecision;
  requestedAt: string;
  approvalContext: {
    actorType: "system_job" | "admin" | "vendor";
    actorId?: string;
    reviewerRole?: RefundStateMutationOperatorReviewerRole;
    permissionEvidenceId?: string;
    initiatedByActorId?: string;
    targetState?: RefundStateMutationShadowTargetState;
    metadata?: Record<string, unknown>;
  };
  evidence: {
    manualReviewPolicyReady: boolean;
    reviewerDecision: "approved" | "rejected" | "needs_more_evidence";
    permissionPassed: boolean;
    separationOfDutiesPassed: boolean;
    rollbackRunbookReady: boolean;
    auditAllowlistReady: boolean;
    financialSideEffectsIsolated: boolean;
    fulfillmentSideEffectsIsolated: boolean;
    terminalStateConflict?: boolean;
    runtimeMutationRequested?: boolean;
    financialMutationRequested?: boolean;
    fulfillmentMutationRequested?: boolean;
    logisticsMutationRequested?: boolean;
  };
};

export type RefundStateMutationOperatorApprovalDecision = {
  decision: RefundStateMutationOperatorApprovalDecisionType;
  executable: false;
  workflowExecutionAllowed: false;
  stateMutationAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  operatorApprovalRecorded: boolean;
  blockCodes: string[];
  idempotencyKey: string;
  approvalCandidate?: {
    candidateType: "refund_state_mutation_operator_approval";
    shadowOnly: true;
    targetState: RefundStateMutationShadowTargetState;
    localRefundCommandKey: string;
    providerRefundId: string;
    amountMinor: number;
    currency: "CNY";
    reviewerActorId: string;
    reviewerRole: RefundStateMutationOperatorReviewerRole;
    permissionEvidenceId: string;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    financialMutationAllowed: false;
    fulfillmentMutationAllowed: false;
    logisticsMutationAllowed: false;
  };
  auditEvent: {
    action:
      | "refund_state_operator_approval_candidate_recorded"
      | "refund_state_operator_approval_rejected"
      | "refund_state_operator_approval_blocked";
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
  "executable",
  "workflowExecutionAllowed",
  "stateMutationAllowed",
  "runtimeMutationBlocked",
  "refundSuccessState",
  "operatorApprovalRecorded",
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

const isShadowDecisionSafe = (
  shadowDecision: RefundStateMutationShadowCommandDecision,
): boolean =>
  shadowDecision.executable === false &&
  shadowDecision.workflowExecutionAllowed === false &&
  shadowDecision.stateMutationAllowed === false &&
  shadowDecision.runtimeMutationBlocked === true &&
  shadowDecision.refundSuccessState === false &&
  (!shadowDecision.command ||
    (shadowDecision.command.stateMutationAllowed === false &&
      shadowDecision.command.workflowExecutionAllowed === false &&
      shadowDecision.command.financialMutationAllowed === false &&
      shadowDecision.command.fulfillmentMutationAllowed === false));

const approvalBlockCodes = (
  input: RefundStateMutationOperatorApprovalInput,
): string[] => {
  const codes: string[] = [];

  if (!isShadowDecisionSafe(input.shadowDecision)) {
    codes.push("unsafe_shadow_decision");
  }

  if (
    input.shadowDecision.decision !== "state_shadow_command_recorded" ||
    !input.shadowDecision.command
  ) {
    codes.push("shadow_command_missing");
  }

  if (input.approvalContext.actorType !== "admin") {
    codes.push("operator_actor_not_admin");
  }

  if (!input.approvalContext.actorId) {
    codes.push("reviewer_actor_missing");
  }

  if (!input.approvalContext.reviewerRole) {
    codes.push("reviewer_role_missing");
  }

  if (!input.approvalContext.permissionEvidenceId) {
    codes.push("permission_evidence_missing");
  }

  if (
    input.approvalContext.initiatedByActorId &&
    input.approvalContext.actorId === input.approvalContext.initiatedByActorId
  ) {
    codes.push("same_actor_initiated_and_approved");
  }

  if (!input.evidence.manualReviewPolicyReady) {
    codes.push("manual_review_policy_missing");
  }

  if (!input.evidence.permissionPassed) {
    codes.push("permission_not_passed");
  }

  if (!input.evidence.separationOfDutiesPassed) {
    codes.push("separation_of_duties_not_passed");
  }

  if (!input.evidence.rollbackRunbookReady) {
    codes.push("rollback_runbook_missing");
  }

  if (!input.evidence.auditAllowlistReady) {
    codes.push("audit_allowlist_missing");
  }

  if (!input.evidence.financialSideEffectsIsolated) {
    codes.push("financial_side_effects_not_isolated");
  }

  if (!input.evidence.fulfillmentSideEffectsIsolated) {
    codes.push("fulfillment_side_effects_not_isolated");
  }

  if (input.evidence.terminalStateConflict) {
    codes.push("terminal_state_conflict");
  }

  if (input.evidence.runtimeMutationRequested) {
    codes.push("runtime_mutation_requested");
  }

  if (input.evidence.financialMutationRequested) {
    codes.push("financial_mutation_requested");
  }

  if (input.evidence.fulfillmentMutationRequested) {
    codes.push("fulfillment_mutation_requested");
  }

  if (input.evidence.logisticsMutationRequested) {
    codes.push("logistics_mutation_requested");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationOperatorApprovalInput,
): string =>
  [
    "refund_state_mutation_operator_approval",
    input.shadowDecision.idempotencyKey,
    input.approvalContext.actorId ?? "missing_actor",
    input.approvalContext.permissionEvidenceId ?? "missing_permission",
    input.approvalContext.targetState ?? "no_target_state",
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const actionFor = (
  decision: RefundStateMutationOperatorApprovalDecisionType,
): RefundStateMutationOperatorApprovalDecision["auditEvent"]["action"] => {
  if (decision === "operator_approval_candidate_recorded") {
    return "refund_state_operator_approval_candidate_recorded";
  }

  if (decision === "operator_approval_rejected") {
    return "refund_state_operator_approval_rejected";
  }

  return "refund_state_operator_approval_blocked";
};

const baseDecision = (
  input: RefundStateMutationOperatorApprovalInput,
  decision: RefundStateMutationOperatorApprovalDecisionType,
  blockCodes: string[],
): Omit<RefundStateMutationOperatorApprovalDecision, "approvalCandidate"> => ({
  decision,
  executable: false,
  workflowExecutionAllowed: false,
  stateMutationAllowed: false,
  runtimeMutationBlocked: true,
  refundSuccessState: false,
  operatorApprovalRecorded: decision === "operator_approval_candidate_recorded",
  blockCodes,
  idempotencyKey: idempotencyKey(input),
  auditEvent: {
    action: actionFor(decision),
    metadata: {
      requestedAt: input.requestedAt,
      reviewerActorType: input.approvalContext.actorType,
      reviewerActorId: input.approvalContext.actorId,
      reviewerRole: input.approvalContext.reviewerRole,
      permissionEvidenceId: input.approvalContext.permissionEvidenceId,
      initiatedByActorId: input.approvalContext.initiatedByActorId,
      shadowDecision: input.shadowDecision.decision,
      shadowIdempotencyKey: input.shadowDecision.idempotencyKey,
      targetState:
        input.approvalContext.targetState ??
        input.shadowDecision.command?.targetState,
      blockCodes,
      ...sanitizeMetadata(input.shadowDecision.auditEvent.metadata),
      ...sanitizeMetadata(input.approvalContext.metadata),
    },
  },
});

export const mapRefundShadowCommandToOperatorApproval = (
  input: RefundStateMutationOperatorApprovalInput,
): RefundStateMutationOperatorApprovalDecision => {
  const blockCodes = approvalBlockCodes(input);

  if (blockCodes.length > 0) {
    return baseDecision(input, "operator_approval_blocked", blockCodes);
  }

  if (input.evidence.reviewerDecision !== "approved") {
    return baseDecision(input, "operator_approval_rejected", [
      `reviewer_${input.evidence.reviewerDecision}`,
    ]);
  }

  const base = baseDecision(
    input,
    "operator_approval_candidate_recorded",
    [],
  );
  const command = input.shadowDecision.command;

  if (!command) {
    return baseDecision(input, "operator_approval_blocked", [
      "shadow_command_missing",
    ]);
  }

  return {
    ...base,
    approvalCandidate: {
      candidateType: "refund_state_mutation_operator_approval",
      shadowOnly: true,
      targetState: input.approvalContext.targetState ?? command.targetState,
      localRefundCommandKey: command.localRefundCommandKey,
      providerRefundId: command.providerRefundId,
      amountMinor: command.amountMinor,
      currency: command.currency,
      reviewerActorId: input.approvalContext.actorId as string,
      reviewerRole:
        input.approvalContext
          .reviewerRole as RefundStateMutationOperatorReviewerRole,
      permissionEvidenceId: input.approvalContext
        .permissionEvidenceId as string,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      financialMutationAllowed: false,
      fulfillmentMutationAllowed: false,
      logisticsMutationAllowed: false,
    },
  };
};
