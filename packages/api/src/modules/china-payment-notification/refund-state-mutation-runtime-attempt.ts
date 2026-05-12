import { RefundStateMutationTerminalConflictDecision } from "./refund-state-mutation-terminal-conflict";

export type RefundStateMutationRuntimeAttemptDecisionType =
  | "runtime_attempt_intent_recorded"
  | "runtime_attempt_duplicate_noop_recorded"
  | "runtime_attempt_manual_review_recorded"
  | "runtime_attempt_input_rejected"
  | "runtime_attempt_blocked";

export type RefundStateMutationRuntimeAttemptInput = {
  terminalConflictDecision: RefundStateMutationTerminalConflictDecision;
  requestedAt: string;
  attemptContext: {
    environment: "development" | "test" | "staging" | "production";
    writerMode: "disabled" | "local_in_memory" | "db";
    attemptRepositoryReady: boolean;
    idempotencyRepositoryReady: boolean;
    replayRepositoryReady: boolean;
    retryPolicyReady: boolean;
    failClosedReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationRuntimeAttemptDecision = {
  decision: RefundStateMutationRuntimeAttemptDecisionType;
  attemptWriteAllowed: false;
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
  runtimeAttemptIntent?: {
    intentType: "refund_state_mutation_runtime_attempt_disabled";
    attemptStatus:
      | "planned_disabled"
      | "duplicate_noop_disabled"
      | "manual_review_disabled";
    terminalConflictDecisionKey: string;
    platformRefundId?: string;
    incomingTargetState?: string;
    providerEvidenceDigest?: string;
    attemptWriteAllowed: false;
    dbWriteAllowed: false;
    productionWriteAllowed: false;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_runtime_attempt_intent_recorded"
      | "refund_state_runtime_attempt_duplicate_noop_recorded"
      | "refund_state_runtime_attempt_manual_review_recorded"
      | "refund_state_runtime_attempt_input_rejected"
      | "refund_state_runtime_attempt_blocked";
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
  "attemptWriteAllowed",
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
  "runtimeAttempt",
  "attemptStatus",
  "workflowAttempt",
  "terminalConflictDecision",
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

const isTerminalConflictDecisionSafe = (
  decision: RefundStateMutationTerminalConflictDecision,
): boolean =>
  decision.lockWriteAllowed === false &&
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
  (!decision.terminalConflictIntent ||
    (decision.terminalConflictIntent.lockWriteAllowed === false &&
      decision.terminalConflictIntent.dbWriteAllowed === false &&
      decision.terminalConflictIntent.productionWriteAllowed === false &&
      decision.terminalConflictIntent.workflowExecutionAllowed === false &&
      decision.terminalConflictIntent.stateMutationAllowed === false &&
      decision.terminalConflictIntent.refundSuccessState === false));

const blockCodes = (
  input: RefundStateMutationRuntimeAttemptInput,
): string[] => {
  const codes = ["runtime_attempt_disabled"];

  if (!isTerminalConflictDecisionSafe(input.terminalConflictDecision)) {
    codes.push("unsafe_terminal_conflict_decision");
  }
  if (
    input.terminalConflictDecision.decision ===
      "terminal_conflict_blocked" ||
    !input.terminalConflictDecision.terminalConflictIntent
  ) {
    codes.push("terminal_conflict_intent_missing");
  }
  if (input.attemptContext.writerMode !== "disabled") {
    codes.push("writer_mode_ignored_until_go");
  }
  if (input.attemptContext.environment === "production") {
    codes.push("production_write_blocked");
  }
  if (!input.attemptContext.attemptRepositoryReady) {
    codes.push("attempt_repository_missing");
  }
  if (!input.attemptContext.idempotencyRepositoryReady) {
    codes.push("idempotency_repository_missing");
  }
  if (!input.attemptContext.replayRepositoryReady) {
    codes.push("replay_repository_missing");
  }
  if (!input.attemptContext.retryPolicyReady) {
    codes.push("retry_policy_missing");
  }
  if (!input.attemptContext.failClosedReady) {
    codes.push("fail_closed_missing");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationRuntimeAttemptInput,
): string =>
  [
    "refund_state_mutation_runtime_attempt",
    input.terminalConflictDecision.idempotencyKey,
    input.attemptContext.environment,
    input.attemptContext.writerMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const attemptStatusFor = (
  decision: RefundStateMutationRuntimeAttemptDecisionType,
): NonNullable<
  RefundStateMutationRuntimeAttemptDecision["runtimeAttemptIntent"]
>["attemptStatus"] => {
  if (decision === "runtime_attempt_duplicate_noop_recorded") {
    return "duplicate_noop_disabled";
  }
  if (decision === "runtime_attempt_manual_review_recorded") {
    return "manual_review_disabled";
  }
  return "planned_disabled";
};

const decisionFor = (
  input: RefundStateMutationRuntimeAttemptInput,
): RefundStateMutationRuntimeAttemptDecisionType => {
  if (!isTerminalConflictDecisionSafe(input.terminalConflictDecision)) {
    return "runtime_attempt_blocked";
  }
  if (input.attemptContext.environment === "production") {
    return "runtime_attempt_blocked";
  }
  if (
    input.terminalConflictDecision.decision ===
      "terminal_conflict_blocked" ||
    !input.terminalConflictDecision.terminalConflictIntent
  ) {
    return "runtime_attempt_input_rejected";
  }
  if (
    input.terminalConflictDecision.decision ===
    "terminal_conflict_duplicate_noop"
  ) {
    return "runtime_attempt_duplicate_noop_recorded";
  }
  if (
    input.terminalConflictDecision.decision ===
    "terminal_conflict_manual_review"
  ) {
    return "runtime_attempt_manual_review_recorded";
  }
  return "runtime_attempt_intent_recorded";
};

const actionFor = (
  decision: RefundStateMutationRuntimeAttemptDecisionType,
): RefundStateMutationRuntimeAttemptDecision["auditEvent"]["action"] => {
  if (decision === "runtime_attempt_intent_recorded") {
    return "refund_state_runtime_attempt_intent_recorded";
  }
  if (decision === "runtime_attempt_duplicate_noop_recorded") {
    return "refund_state_runtime_attempt_duplicate_noop_recorded";
  }
  if (decision === "runtime_attempt_manual_review_recorded") {
    return "refund_state_runtime_attempt_manual_review_recorded";
  }
  if (decision === "runtime_attempt_input_rejected") {
    return "refund_state_runtime_attempt_input_rejected";
  }
  return "refund_state_runtime_attempt_blocked";
};

export const mapTerminalConflictToRuntimeAttemptIntent = (
  input: RefundStateMutationRuntimeAttemptInput,
): RefundStateMutationRuntimeAttemptDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const terminalIntent =
    input.terminalConflictDecision.terminalConflictIntent;
  const runtimeAttemptIntent =
    decision === "runtime_attempt_blocked" ||
    decision === "runtime_attempt_input_rejected" ||
    !terminalIntent
      ? undefined
      : {
          intentType:
            "refund_state_mutation_runtime_attempt_disabled" as const,
          attemptStatus: attemptStatusFor(decision),
          terminalConflictDecisionKey:
            input.terminalConflictDecision.idempotencyKey,
          platformRefundId: terminalIntent.platformRefundId,
          incomingTargetState: terminalIntent.incomingTargetState,
          providerEvidenceDigest: terminalIntent.providerEvidenceDigest,
          attemptWriteAllowed: false as const,
          dbWriteAllowed: false as const,
          productionWriteAllowed: false as const,
          workflowExecutionAllowed: false as const,
          stateMutationAllowed: false as const,
          refundSuccessState: false as const,
        };

  return {
    decision,
    attemptWriteAllowed: false,
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
    runtimeAttemptIntent,
    auditEvent: {
      action: actionFor(decision),
      metadata: {
        requestedAt: input.requestedAt,
        environment: input.attemptContext.environment,
        writerMode: input.attemptContext.writerMode,
        terminalConflictDecision: input.terminalConflictDecision.decision,
        terminalConflictDecisionKey:
          input.terminalConflictDecision.idempotencyKey,
        platformRefundId: terminalIntent?.platformRefundId,
        incomingTargetState: terminalIntent?.incomingTargetState,
        attemptStatus: runtimeAttemptIntent?.attemptStatus,
        decision,
        blockCodes: codes,
        ...sanitizeMetadata(input.attemptContext.metadata),
      },
    },
  };
};
