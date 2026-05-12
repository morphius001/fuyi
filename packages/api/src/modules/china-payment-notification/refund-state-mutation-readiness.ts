export type RefundStateMutationReadinessDecisionType =
  | "ready_for_shadow_state_command"
  | "manual_review_required"
  | "reconciliation_required"
  | "blocked";

export type RefundStateMutationReadinessBlockCode =
  | "VERIFIER_NOT_READY"
  | "PAYLOAD_NOT_REDACTED"
  | "INBOX_NOT_STABLE"
  | "UNSAFE_HANDOFF"
  | "QUERY_RECONCILIATION_REQUIRED"
  | "MANUAL_REVIEW_POLICY_MISSING"
  | "MANUAL_REVIEW_NOT_APPROVED"
  | "OWNERSHIP_CHECK_FAILED"
  | "PERMISSION_CHECK_FAILED"
  | "TERMINAL_STATE_CONFLICT"
  | "AMOUNT_MISMATCH"
  | "CURRENCY_MISMATCH"
  | "PROVIDER_REFUND_ID_MISMATCH"
  | "PAYMENT_SESSION_MISMATCH"
  | "MERCHANT_ORDER_REFERENCE_MISMATCH"
  | "FINANCIAL_SIDE_EFFECT_NOT_ISOLATED"
  | "FULFILLMENT_SIDE_EFFECT_NOT_ISOLATED"
  | "ROLLBACK_RUNBOOK_MISSING"
  | "RUNTIME_MUTATION_REQUESTED";

export type RefundStateMutationReadinessInput = {
  provider: "wechat_pay" | "alipay" | "mock_china_pay";
  source: "provider_inbox" | "manual_review" | "query_reconciliation";
  requestedAt: string;
  evidence: {
    verifierReady: boolean;
    payloadRedacted: boolean;
    inboxStable: boolean;
    handoffSafe: boolean;
    reconciliationComplete?: boolean;
    manualReviewPolicyReady: boolean;
    manualReviewApproved: boolean;
    rollbackRunbookReady: boolean;
    sourceInboxId?: string;
    queryFollowUpId?: string;
    reconciliationId?: string;
  };
  expectedRefund: {
    localRefundCommandKey: string;
    providerRefundId: string;
    merchantOrderReference: string;
    paymentProviderSessionId: string;
    amountMinor: number;
    currency: "CNY";
    currentPlatformRefundState:
      | "none"
      | "pending"
      | "review_required"
      | "shadow_prepared"
      | "succeeded"
      | "failed"
      | "canceled";
  };
  observedRefund: {
    providerRefundId?: string;
    merchantOrderReference?: string;
    paymentProviderSessionId?: string;
    amountMinor?: number;
    currency?: "CNY";
  };
  safetyChecks: {
    ownershipPassed: boolean;
    permissionPassed: boolean;
    financialSideEffectsIsolated: boolean;
    fulfillmentSideEffectsIsolated: boolean;
    runtimeMutationRequested?: boolean;
    workflowExecutionRequested?: boolean;
    stateMutationRequested?: boolean;
  };
  auditContext?: {
    actorType: "system_job" | "admin" | "vendor";
    actorId?: string;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationReadinessDecision = {
  decision: RefundStateMutationReadinessDecisionType;
  executable: false;
  workflowExecutionAllowed: false;
  stateMutationAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  blockCodes: RefundStateMutationReadinessBlockCode[];
  idempotencyKey: string;
  shadowCommand?: {
    commandType: "refund_state_mutation_readiness_shadow";
    shadowOnly: true;
    provider: RefundStateMutationReadinessInput["provider"];
    source: RefundStateMutationReadinessInput["source"];
    localRefundCommandKey: string;
    providerRefundId: string;
    amountMinor: number;
    currency: "CNY";
    stateMutationAllowed: false;
    workflowExecutionAllowed: false;
    financialMutationAllowed: false;
    fulfillmentMutationAllowed: false;
  };
  auditEvent: {
    action:
      | "refund_state_mutation_readiness_shadow_prepared"
      | "refund_state_mutation_manual_review_required"
      | "refund_state_mutation_reconciliation_required"
      | "refund_state_mutation_readiness_blocked";
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

const idempotencyKey = (input: RefundStateMutationReadinessInput): string =>
  [
    "refund_state_mutation_readiness",
    input.provider,
    input.source,
    input.expectedRefund.localRefundCommandKey,
    input.expectedRefund.providerRefundId,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const baseMetadata = (
  input: RefundStateMutationReadinessInput,
  decision: RefundStateMutationReadinessDecisionType,
  blockCodes: RefundStateMutationReadinessBlockCode[],
) => ({
  provider: input.provider,
  source: input.source,
  requestedAt: input.requestedAt,
  localRefundCommandKey: input.expectedRefund.localRefundCommandKey,
  providerRefundId: input.expectedRefund.providerRefundId,
  observedProviderRefundId: input.observedRefund.providerRefundId,
  merchantOrderReference: input.expectedRefund.merchantOrderReference,
  observedMerchantOrderReference:
    input.observedRefund.merchantOrderReference,
  paymentProviderSessionId: input.expectedRefund.paymentProviderSessionId,
  observedPaymentProviderSessionId:
    input.observedRefund.paymentProviderSessionId,
  amountMinor: input.expectedRefund.amountMinor,
  observedAmountMinor: input.observedRefund.amountMinor,
  currency: input.expectedRefund.currency,
  observedCurrency: input.observedRefund.currency,
  currentPlatformRefundState:
    input.expectedRefund.currentPlatformRefundState,
  sourceInboxId: input.evidence.sourceInboxId,
  queryFollowUpId: input.evidence.queryFollowUpId,
  reconciliationId: input.evidence.reconciliationId,
  actorType: input.auditContext?.actorType,
  actorId: input.auditContext?.actorId,
  decision,
  blockCodes,
  ...sanitizeMetadata(input.auditContext?.metadata),
});

const actionFor = (
  decision: RefundStateMutationReadinessDecisionType,
): RefundStateMutationReadinessDecision["auditEvent"]["action"] => {
  if (decision === "ready_for_shadow_state_command") {
    return "refund_state_mutation_readiness_shadow_prepared";
  }

  if (decision === "manual_review_required") {
    return "refund_state_mutation_manual_review_required";
  }

  if (decision === "reconciliation_required") {
    return "refund_state_mutation_reconciliation_required";
  }

  return "refund_state_mutation_readiness_blocked";
};

const decision = (
  input: RefundStateMutationReadinessInput,
  decisionType: RefundStateMutationReadinessDecisionType,
  blockCodes: RefundStateMutationReadinessBlockCode[],
  includeShadowCommand = false,
): RefundStateMutationReadinessDecision => ({
  decision: decisionType,
  executable: false,
  workflowExecutionAllowed: false,
  stateMutationAllowed: false,
  runtimeMutationBlocked: true,
  refundSuccessState: false,
  blockCodes,
  idempotencyKey: idempotencyKey(input),
  shadowCommand: includeShadowCommand
    ? {
        commandType: "refund_state_mutation_readiness_shadow",
        shadowOnly: true,
        provider: input.provider,
        source: input.source,
        localRefundCommandKey: input.expectedRefund.localRefundCommandKey,
        providerRefundId: input.expectedRefund.providerRefundId,
        amountMinor: input.expectedRefund.amountMinor,
        currency: input.expectedRefund.currency,
        stateMutationAllowed: false,
        workflowExecutionAllowed: false,
        financialMutationAllowed: false,
        fulfillmentMutationAllowed: false,
      }
    : undefined,
  auditEvent: {
    action: actionFor(decisionType),
    metadata: baseMetadata(input, decisionType, blockCodes),
  },
});

const mismatchCodes = (
  input: RefundStateMutationReadinessInput,
): RefundStateMutationReadinessBlockCode[] => {
  const codes: RefundStateMutationReadinessBlockCode[] = [];

  if (
    input.observedRefund.amountMinor !== undefined &&
    input.observedRefund.amountMinor !== input.expectedRefund.amountMinor
  ) {
    codes.push("AMOUNT_MISMATCH");
  }

  if (
    input.observedRefund.currency &&
    input.observedRefund.currency !== input.expectedRefund.currency
  ) {
    codes.push("CURRENCY_MISMATCH");
  }

  if (
    input.observedRefund.providerRefundId &&
    input.observedRefund.providerRefundId !== input.expectedRefund.providerRefundId
  ) {
    codes.push("PROVIDER_REFUND_ID_MISMATCH");
  }

  if (
    input.observedRefund.paymentProviderSessionId &&
    input.observedRefund.paymentProviderSessionId !==
      input.expectedRefund.paymentProviderSessionId
  ) {
    codes.push("PAYMENT_SESSION_MISMATCH");
  }

  if (
    input.observedRefund.merchantOrderReference &&
    input.observedRefund.merchantOrderReference !==
      input.expectedRefund.merchantOrderReference
  ) {
    codes.push("MERCHANT_ORDER_REFERENCE_MISMATCH");
  }

  return codes;
};

export const evaluateRefundStateMutationReadiness = (
  input: RefundStateMutationReadinessInput,
): RefundStateMutationReadinessDecision => {
  if (
    input.safetyChecks.runtimeMutationRequested ||
    input.safetyChecks.workflowExecutionRequested ||
    input.safetyChecks.stateMutationRequested
  ) {
    return decision(input, "blocked", ["RUNTIME_MUTATION_REQUESTED"]);
  }

  if (!input.evidence.verifierReady) {
    return decision(input, "blocked", ["VERIFIER_NOT_READY"]);
  }

  if (!input.evidence.payloadRedacted) {
    return decision(input, "blocked", ["PAYLOAD_NOT_REDACTED"]);
  }

  if (!input.evidence.inboxStable) {
    return decision(input, "blocked", ["INBOX_NOT_STABLE"]);
  }

  if (!input.evidence.handoffSafe) {
    return decision(input, "blocked", ["UNSAFE_HANDOFF"]);
  }

  if (
    input.source === "query_reconciliation" &&
    !input.evidence.reconciliationComplete
  ) {
    return decision(input, "reconciliation_required", [
      "QUERY_RECONCILIATION_REQUIRED",
    ]);
  }

  if (!input.evidence.manualReviewPolicyReady) {
    return decision(input, "manual_review_required", [
      "MANUAL_REVIEW_POLICY_MISSING",
    ]);
  }

  if (!input.evidence.manualReviewApproved) {
    return decision(input, "manual_review_required", [
      "MANUAL_REVIEW_NOT_APPROVED",
    ]);
  }

  if (!input.safetyChecks.ownershipPassed) {
    return decision(input, "blocked", ["OWNERSHIP_CHECK_FAILED"]);
  }

  if (!input.safetyChecks.permissionPassed) {
    return decision(input, "blocked", ["PERMISSION_CHECK_FAILED"]);
  }

  if (
    terminalPlatformStates.has(
      input.expectedRefund.currentPlatformRefundState,
    )
  ) {
    return decision(input, "blocked", ["TERMINAL_STATE_CONFLICT"]);
  }

  const mismatches = mismatchCodes(input);

  if (mismatches.length > 0) {
    return decision(input, "reconciliation_required", mismatches);
  }

  if (!input.safetyChecks.financialSideEffectsIsolated) {
    return decision(input, "blocked", [
      "FINANCIAL_SIDE_EFFECT_NOT_ISOLATED",
    ]);
  }

  if (!input.safetyChecks.fulfillmentSideEffectsIsolated) {
    return decision(input, "blocked", [
      "FULFILLMENT_SIDE_EFFECT_NOT_ISOLATED",
    ]);
  }

  if (!input.evidence.rollbackRunbookReady) {
    return decision(input, "blocked", ["ROLLBACK_RUNBOOK_MISSING"]);
  }

  return decision(input, "ready_for_shadow_state_command", [], true);
};
