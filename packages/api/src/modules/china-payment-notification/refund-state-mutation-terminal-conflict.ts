export type RefundStateMutationTerminalState =
  | "none"
  | "pending"
  | "processing"
  | "retryable_failed"
  | "succeeded"
  | "failed_final"
  | "canceled"
  | "manual_closed";

export type RefundStateMutationTerminalConflictDecisionType =
  | "terminal_conflict_shadow_prepared"
  | "terminal_conflict_duplicate_noop"
  | "terminal_conflict_manual_review"
  | "terminal_conflict_blocked";

export type RefundStateMutationTerminalConflictInput = {
  requestedAt: string;
  runtimeContext: {
    environment: "development" | "test" | "staging" | "production";
    evaluatorMode: "disabled" | "local_shadow" | "db";
    terminalLockRepositoryReady: boolean;
    operatorReviewQueueReady: boolean;
    evidenceDigestVersion?: string;
    failClosedReady: boolean;
    metadata?: Record<string, unknown>;
  };
  currentRefund: {
    platformRefundId: string;
    currentState: RefundStateMutationTerminalState;
    terminalMarker?: {
      state: Extract<
        RefundStateMutationTerminalState,
        "succeeded" | "failed_final" | "canceled" | "manual_closed"
      >;
      enteredAt: string;
      evidenceDigest: string;
      stateOwnerEvidenceId: string;
    };
  };
  incoming: {
    targetState: Extract<
      RefundStateMutationTerminalState,
      "succeeded" | "failed_final" | "canceled" | "manual_closed"
    >;
    providerEvidenceDigest: string;
    providerRefundReference: string;
    merchantOrderReference: string;
    refundRequestReference: string;
    amountMinor: number;
    currency: "CNY";
    approvalPersistenceIdempotencyKey: string;
    auditPersistenceIdempotencyKey: string;
    workflowIdempotencyKey: string;
    actorId?: string;
    reviewerId?: string;
    permissionEvidenceId?: string;
  };
};

export type RefundStateMutationTerminalConflictDecision = {
  decision: RefundStateMutationTerminalConflictDecisionType;
  lockWriteAllowed: false;
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
  terminalConflictIntent?: {
    intentType: "refund_state_mutation_terminal_conflict_disabled";
    platformRefundId: string;
    currentState: RefundStateMutationTerminalState;
    incomingTargetState: RefundStateMutationTerminalConflictInput["incoming"]["targetState"];
    providerEvidenceDigest: string;
    currentEvidenceDigest?: string;
    conflictCode: "no_terminal_conflict" | "duplicate_noop" | "manual_review";
    lockWriteAllowed: false;
    dbWriteAllowed: false;
    productionWriteAllowed: false;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_terminal_conflict_shadow_prepared"
      | "refund_state_terminal_conflict_duplicate_noop"
      | "refund_state_terminal_conflict_manual_review"
      | "refund_state_terminal_conflict_blocked";
    metadata: Record<string, unknown>;
  };
};

const terminalStates = new Set<RefundStateMutationTerminalState>([
  "succeeded",
  "failed_final",
  "canceled",
  "manual_closed",
]);

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
  "lockWriteAllowed",
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
  "financialMutationAllowed",
  "permissionMutationAllowed",
  "fulfillmentMutationAllowed",
  "logisticsMutationAllowed",
  "workflowExecution",
  "executeWorkflow",
  "refundStateMutation",
  "terminalConflict",
  "terminalLock",
  "currentState",
  "targetState",
  "providerEvidenceDigest",
  "currentEvidenceDigest",
  "stateOwnerEvidenceId",
  "fullPhone",
  "fullAddress",
  "identityNumber",
  "bankCardNumber",
  "blockCodes",
  "evaluatorMode",
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

const isTerminalState = (state: RefundStateMutationTerminalState): boolean =>
  terminalStates.has(state);

const blockCodes = (
  input: RefundStateMutationTerminalConflictInput,
): string[] => {
  const codes = ["terminal_conflict_lock_disabled"];

  if (input.runtimeContext.evaluatorMode !== "disabled") {
    codes.push("evaluator_mode_ignored_until_go");
  }
  if (input.runtimeContext.environment === "production") {
    codes.push("production_write_blocked");
  }
  if (!input.runtimeContext.terminalLockRepositoryReady) {
    codes.push("terminal_lock_repository_missing");
  }
  if (!input.runtimeContext.operatorReviewQueueReady) {
    codes.push("operator_review_queue_missing");
  }
  if (!input.runtimeContext.evidenceDigestVersion) {
    codes.push("evidence_digest_version_missing");
  }
  if (!input.runtimeContext.failClosedReady) {
    codes.push("fail_closed_missing");
  }
  if (input.incoming.currency !== "CNY") {
    codes.push("currency_mismatch");
  }
  if (input.incoming.amountMinor <= 0) {
    codes.push("invalid_amount");
  }
  if (isTerminalState(input.currentRefund.currentState)) {
    if (!input.currentRefund.terminalMarker) {
      codes.push("terminal_marker_missing");
    }
    if (!input.currentRefund.terminalMarker?.stateOwnerEvidenceId) {
      codes.push("state_owner_evidence_missing");
    }
    if (!input.currentRefund.terminalMarker?.evidenceDigest) {
      codes.push("current_evidence_digest_missing");
    }
  }

  if (!input.incoming.providerEvidenceDigest) {
    codes.push("incoming_evidence_digest_missing");
  }
  if (!input.incoming.approvalPersistenceIdempotencyKey) {
    codes.push("approval_persistence_key_missing");
  }
  if (!input.incoming.auditPersistenceIdempotencyKey) {
    codes.push("audit_persistence_key_missing");
  }
  if (!input.incoming.workflowIdempotencyKey) {
    codes.push("workflow_idempotency_key_missing");
  }
  if (!input.incoming.permissionEvidenceId) {
    codes.push("permission_evidence_missing");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationTerminalConflictInput,
): string =>
  [
    "refund_state_mutation_terminal_conflict",
    input.currentRefund.platformRefundId,
    input.currentRefund.currentState,
    input.incoming.targetState,
    input.incoming.providerRefundReference,
    input.incoming.providerEvidenceDigest,
    input.runtimeContext.environment,
    input.runtimeContext.evaluatorMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const hasInfrastructureBlocks = (codes: string[]): boolean =>
  codes.some((code) =>
    [
      "evaluator_mode_ignored_until_go",
      "production_write_blocked",
      "terminal_lock_repository_missing",
      "operator_review_queue_missing",
      "evidence_digest_version_missing",
      "fail_closed_missing",
      "currency_mismatch",
      "invalid_amount",
      "incoming_evidence_digest_missing",
      "approval_persistence_key_missing",
      "audit_persistence_key_missing",
      "workflow_idempotency_key_missing",
      "permission_evidence_missing",
      "terminal_marker_missing",
      "state_owner_evidence_missing",
      "current_evidence_digest_missing",
    ].includes(code),
  );

const decisionFor = (
  input: RefundStateMutationTerminalConflictInput,
  codes: string[],
): RefundStateMutationTerminalConflictDecisionType => {
  if (hasInfrastructureBlocks(codes)) {
    return "terminal_conflict_blocked";
  }

  if (!isTerminalState(input.currentRefund.currentState)) {
    return "terminal_conflict_shadow_prepared";
  }

  const marker = input.currentRefund.terminalMarker;
  if (
    marker?.state === input.incoming.targetState &&
    marker.evidenceDigest === input.incoming.providerEvidenceDigest
  ) {
    return "terminal_conflict_duplicate_noop";
  }

  return "terminal_conflict_manual_review";
};

const conflictCodeFor = (
  decision: RefundStateMutationTerminalConflictDecisionType,
): NonNullable<
  RefundStateMutationTerminalConflictDecision["terminalConflictIntent"]
>["conflictCode"] => {
  if (decision === "terminal_conflict_shadow_prepared") {
    return "no_terminal_conflict";
  }
  if (decision === "terminal_conflict_duplicate_noop") {
    return "duplicate_noop";
  }
  return "manual_review";
};

const actionFor = (
  decision: RefundStateMutationTerminalConflictDecisionType,
): RefundStateMutationTerminalConflictDecision["auditEvent"]["action"] => {
  if (decision === "terminal_conflict_shadow_prepared") {
    return "refund_state_terminal_conflict_shadow_prepared";
  }
  if (decision === "terminal_conflict_duplicate_noop") {
    return "refund_state_terminal_conflict_duplicate_noop";
  }
  if (decision === "terminal_conflict_manual_review") {
    return "refund_state_terminal_conflict_manual_review";
  }
  return "refund_state_terminal_conflict_blocked";
};

export const evaluateRefundStateMutationTerminalConflict = (
  input: RefundStateMutationTerminalConflictInput,
): RefundStateMutationTerminalConflictDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input, codes);
  const terminalConflictIntent =
    decision === "terminal_conflict_blocked"
      ? undefined
      : {
          intentType:
            "refund_state_mutation_terminal_conflict_disabled" as const,
          platformRefundId: input.currentRefund.platformRefundId,
          currentState: input.currentRefund.currentState,
          incomingTargetState: input.incoming.targetState,
          providerEvidenceDigest: input.incoming.providerEvidenceDigest,
          currentEvidenceDigest:
            input.currentRefund.terminalMarker?.evidenceDigest,
          conflictCode: conflictCodeFor(decision),
          lockWriteAllowed: false as const,
          dbWriteAllowed: false as const,
          productionWriteAllowed: false as const,
          workflowExecutionAllowed: false as const,
          stateMutationAllowed: false as const,
          refundSuccessState: false as const,
        };

  return {
    decision,
    lockWriteAllowed: false,
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
    terminalConflictIntent,
    auditEvent: {
      action: actionFor(decision),
      metadata: {
        requestedAt: input.requestedAt,
        environment: input.runtimeContext.environment,
        evaluatorMode: input.runtimeContext.evaluatorMode,
        evidenceDigestVersion: input.runtimeContext.evidenceDigestVersion,
        platformRefundId: input.currentRefund.platformRefundId,
        currentState: input.currentRefund.currentState,
        currentTerminalState: input.currentRefund.terminalMarker?.state,
        incomingTargetState: input.incoming.targetState,
        providerRefundReference: input.incoming.providerRefundReference,
        merchantOrderReference: input.incoming.merchantOrderReference,
        refundRequestReference: input.incoming.refundRequestReference,
        amountMinor: input.incoming.amountMinor,
        currency: input.incoming.currency,
        approvalPersistenceIdempotencyKey:
          input.incoming.approvalPersistenceIdempotencyKey,
        auditPersistenceIdempotencyKey:
          input.incoming.auditPersistenceIdempotencyKey,
        workflowIdempotencyKey: input.incoming.workflowIdempotencyKey,
        actorId: input.incoming.actorId,
        reviewerId: input.incoming.reviewerId,
        permissionEvidenceId: input.incoming.permissionEvidenceId,
        decision,
        blockCodes: codes,
        ...sanitizeMetadata(input.runtimeContext.metadata),
      },
    },
  };
};
