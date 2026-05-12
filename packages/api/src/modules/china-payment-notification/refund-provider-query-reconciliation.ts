import { RefundProviderQueryFollowUpProvider } from "./refund-provider-query-follow-up";

export type RefundProviderQuerySnapshotState =
  | "succeeded"
  | "failed"
  | "processing"
  | "closed"
  | "abnormal"
  | "unknown";

export type RefundProviderQueryReconciliationDecisionType =
  | "ready_for_manual_review"
  | "mismatch_requires_review"
  | "provider_still_processing"
  | "blocked";

export type RefundProviderQueryReconciliationBlockCode =
  | "SNAPSHOT_NOT_REDACTED"
  | "UNSAFE_PROVIDER_QUERY_SNAPSHOT"
  | "AMOUNT_MISMATCH"
  | "CURRENCY_MISMATCH"
  | "PROVIDER_REFUND_ID_MISMATCH"
  | "PAYMENT_SESSION_MISMATCH"
  | "MERCHANT_ORDER_REFERENCE_MISMATCH"
  | "TERMINAL_STATE_CONFLICT"
  | "OWNERSHIP_CHECK_FAILED"
  | "PERMISSION_CHECK_FAILED"
  | "RUNTIME_MUTATION_REQUESTED";

export type RefundProviderQuerySnapshot = {
  source: "provider_query_snapshot";
  provider: RefundProviderQueryFollowUpProvider;
  queryFollowUpId: string;
  providerRefundId?: string;
  localRefundCommandKey?: string;
  merchantOrderReference?: string;
  paymentProviderSessionId?: string;
  providerRefundState: RefundProviderQuerySnapshotState;
  amount?: {
    currency: "CNY";
    value: number;
  };
  queriedAt: string;
  rawPayloadDigest?: string;
  redactionApplied: boolean;
  providerQueryAllowed: boolean;
  runtimeMutationBlocked: boolean;
  refundSuccessState: boolean;
  metadata?: Record<string, unknown>;
};

export type RefundProviderQueryReconciliationInput = {
  snapshot: RefundProviderQuerySnapshot;
  expectedRefund: {
    localRefundCommandKey?: string;
    providerRefundId?: string;
    merchantOrderReference?: string;
    paymentProviderSessionId?: string;
    amountMinor?: number;
    currency?: "CNY";
    currentPlatformRefundState?:
      | "none"
      | "pending"
      | "review_required"
      | "shadow_prepared"
      | "succeeded"
      | "failed"
      | "canceled";
  };
  safetyChecks: {
    ownershipPassed: boolean;
    permissionPassed: boolean;
    terminalStateConflict?: boolean;
    runtimeMutationRequested?: boolean;
    workflowExecutionRequested?: boolean;
    financialMutationRequested?: boolean;
    fulfillmentMutationRequested?: boolean;
  };
  auditContext?: {
    sourceInboxId?: string;
    sourceAuditEventId?: string;
    actorType: "system_job" | "admin" | "vendor";
    actorId?: string;
    metadata?: Record<string, unknown>;
  };
};

export type RefundProviderQueryReconciliationAuditAction =
  | "provider_query_reconciliation_manual_review_ready"
  | "provider_query_reconciliation_mismatch_review_required"
  | "provider_query_reconciliation_processing"
  | "provider_query_reconciliation_blocked";

export type RefundProviderQueryReconciliationDecision = {
  decision: RefundProviderQueryReconciliationDecisionType;
  executable: false;
  workflowExecutionAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  blockCodes: RefundProviderQueryReconciliationBlockCode[];
  idempotencyKey: string;
  manualReviewHandoff?: {
    handoffType: "provider_query_reconciliation_review";
    manualReviewReason:
      | "provider_query_snapshot_consistent"
      | "provider_query_mismatch"
      | "provider_processing"
      | "provider_failure";
    recommendedNextStep:
      | "review_platform_refund_state"
      | "schedule_requery"
      | "investigate_provider_mismatch";
    provider: RefundProviderQueryFollowUpProvider;
    queryFollowUpId: string;
    providerRefundState: RefundProviderQuerySnapshotState;
    stateMutationAllowed: false;
    financialMutationAllowed: false;
    fulfillmentMutationAllowed: false;
  };
  auditEvent: {
    action: RefundProviderQueryReconciliationAuditAction;
    metadata: Record<string, unknown>;
  };
};

const terminalPlatformStates = new Set(["succeeded", "failed", "canceled"]);

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
  "providerRefundRequest",
  "providerRefundQuery",
  "refundQuery",
  "workflowExecution",
  "executeWorkflow",
  "refundStateMutation",
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

const buildIdempotencyKey = (
  input: RefundProviderQueryReconciliationInput,
): string =>
  [
    "provider_query_reconciliation",
    input.snapshot.provider,
    input.snapshot.queryFollowUpId,
    input.expectedRefund.localRefundCommandKey ?? "no_local_refund_command",
    input.snapshot.providerRefundId ?? "no_provider_refund_id",
    input.snapshot.providerRefundState,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const metadata = (
  input: RefundProviderQueryReconciliationInput,
  decisionType: RefundProviderQueryReconciliationDecisionType,
  blockCodes: RefundProviderQueryReconciliationBlockCode[],
) => ({
  provider: input.snapshot.provider,
  source: input.snapshot.source,
  queryFollowUpId: input.snapshot.queryFollowUpId,
  providerRefundId: input.snapshot.providerRefundId,
  localRefundCommandKey: input.snapshot.localRefundCommandKey,
  expectedLocalRefundCommandKey: input.expectedRefund.localRefundCommandKey,
  merchantOrderReference: input.snapshot.merchantOrderReference,
  expectedMerchantOrderReference:
    input.expectedRefund.merchantOrderReference,
  paymentProviderSessionId: input.snapshot.paymentProviderSessionId,
  expectedPaymentProviderSessionId:
    input.expectedRefund.paymentProviderSessionId,
  providerRefundState: input.snapshot.providerRefundState,
  amountMinor: input.snapshot.amount?.value,
  expectedAmountMinor: input.expectedRefund.amountMinor,
  currency: input.snapshot.amount?.currency,
  expectedCurrency: input.expectedRefund.currency,
  queriedAt: input.snapshot.queriedAt,
  rawPayloadDigest: input.snapshot.rawPayloadDigest,
  redactionApplied: input.snapshot.redactionApplied,
  currentPlatformRefundState:
    input.expectedRefund.currentPlatformRefundState,
  sourceInboxId: input.auditContext?.sourceInboxId,
  sourceAuditEventId: input.auditContext?.sourceAuditEventId,
  actorType: input.auditContext?.actorType,
  actorId: input.auditContext?.actorId,
  decision: decisionType,
  blockCodes,
  ...sanitizeMetadata(input.snapshot.metadata),
  ...sanitizeMetadata(input.auditContext?.metadata),
});

const decision = (
  input: RefundProviderQueryReconciliationInput,
  decisionType: RefundProviderQueryReconciliationDecisionType,
  blockCodes: RefundProviderQueryReconciliationBlockCode[],
  handoff?: RefundProviderQueryReconciliationDecision["manualReviewHandoff"],
): RefundProviderQueryReconciliationDecision => {
  const action: RefundProviderQueryReconciliationAuditAction =
    decisionType === "ready_for_manual_review"
      ? "provider_query_reconciliation_manual_review_ready"
      : decisionType === "mismatch_requires_review"
        ? "provider_query_reconciliation_mismatch_review_required"
        : decisionType === "provider_still_processing"
          ? "provider_query_reconciliation_processing"
          : "provider_query_reconciliation_blocked";

  return {
    decision: decisionType,
    executable: false,
    workflowExecutionAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    blockCodes,
    idempotencyKey: buildIdempotencyKey(input),
    manualReviewHandoff: handoff,
    auditEvent: {
      action,
      metadata: metadata(input, decisionType, blockCodes),
    },
  };
};

const manualReviewHandoff = (
  input: RefundProviderQueryReconciliationInput,
  reason: NonNullable<
    RefundProviderQueryReconciliationDecision["manualReviewHandoff"]
  >["manualReviewReason"],
  recommendedNextStep: NonNullable<
    RefundProviderQueryReconciliationDecision["manualReviewHandoff"]
  >["recommendedNextStep"],
): NonNullable<
  RefundProviderQueryReconciliationDecision["manualReviewHandoff"]
> => ({
  handoffType: "provider_query_reconciliation_review",
  manualReviewReason: reason,
  recommendedNextStep,
  provider: input.snapshot.provider,
  queryFollowUpId: input.snapshot.queryFollowUpId,
  providerRefundState: input.snapshot.providerRefundState,
  stateMutationAllowed: false,
  financialMutationAllowed: false,
  fulfillmentMutationAllowed: false,
});

const mismatchCodes = (
  input: RefundProviderQueryReconciliationInput,
): RefundProviderQueryReconciliationBlockCode[] => {
  const codes: RefundProviderQueryReconciliationBlockCode[] = [];

  if (
    input.expectedRefund.amountMinor !== undefined &&
    input.snapshot.amount?.value !== input.expectedRefund.amountMinor
  ) {
    codes.push("AMOUNT_MISMATCH");
  }

  if (
    input.expectedRefund.currency &&
    input.snapshot.amount?.currency !== input.expectedRefund.currency
  ) {
    codes.push("CURRENCY_MISMATCH");
  }

  if (
    input.expectedRefund.providerRefundId &&
    input.snapshot.providerRefundId !== input.expectedRefund.providerRefundId
  ) {
    codes.push("PROVIDER_REFUND_ID_MISMATCH");
  }

  if (
    input.expectedRefund.paymentProviderSessionId &&
    input.snapshot.paymentProviderSessionId !==
      input.expectedRefund.paymentProviderSessionId
  ) {
    codes.push("PAYMENT_SESSION_MISMATCH");
  }

  if (
    input.expectedRefund.merchantOrderReference &&
    input.snapshot.merchantOrderReference !==
      input.expectedRefund.merchantOrderReference
  ) {
    codes.push("MERCHANT_ORDER_REFERENCE_MISMATCH");
  }

  return codes;
};

export const planRefundProviderQueryReconciliation = (
  input: RefundProviderQueryReconciliationInput,
): RefundProviderQueryReconciliationDecision => {
  if (!input.snapshot.redactionApplied) {
    return decision(input, "blocked", ["SNAPSHOT_NOT_REDACTED"]);
  }

  if (
    input.snapshot.providerQueryAllowed ||
    !input.snapshot.runtimeMutationBlocked ||
    input.snapshot.refundSuccessState
  ) {
    return decision(input, "blocked", ["UNSAFE_PROVIDER_QUERY_SNAPSHOT"]);
  }

  if (!input.safetyChecks.ownershipPassed) {
    return decision(input, "blocked", ["OWNERSHIP_CHECK_FAILED"]);
  }

  if (!input.safetyChecks.permissionPassed) {
    return decision(input, "blocked", ["PERMISSION_CHECK_FAILED"]);
  }

  if (
    input.safetyChecks.runtimeMutationRequested ||
    input.safetyChecks.workflowExecutionRequested ||
    input.safetyChecks.financialMutationRequested ||
    input.safetyChecks.fulfillmentMutationRequested
  ) {
    return decision(input, "blocked", ["RUNTIME_MUTATION_REQUESTED"]);
  }

  if (
    input.safetyChecks.terminalStateConflict ||
    (input.expectedRefund.currentPlatformRefundState &&
      terminalPlatformStates.has(input.expectedRefund.currentPlatformRefundState))
  ) {
    return decision(input, "blocked", ["TERMINAL_STATE_CONFLICT"]);
  }

  const mismatch = mismatchCodes(input);

  if (mismatch.length > 0) {
    return decision(
      input,
      "mismatch_requires_review",
      mismatch,
      manualReviewHandoff(
        input,
        "provider_query_mismatch",
        "investigate_provider_mismatch",
      ),
    );
  }

  if (
    input.snapshot.providerRefundState === "processing" ||
    input.snapshot.providerRefundState === "unknown"
  ) {
    return decision(
      input,
      "provider_still_processing",
      [],
      manualReviewHandoff(input, "provider_processing", "schedule_requery"),
    );
  }

  const failureStates = new Set(["failed", "closed", "abnormal"]);

  return decision(
    input,
    "ready_for_manual_review",
    [],
    manualReviewHandoff(
      input,
      failureStates.has(input.snapshot.providerRefundState)
        ? "provider_failure"
        : "provider_query_snapshot_consistent",
      "review_platform_refund_state",
    ),
  );
};
