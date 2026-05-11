import { ChinaPaymentNotificationEnvelope } from "./types";

export type RefundStateOwnerHandoffActorType =
  | "system_job"
  | "admin"
  | "vendor";

export type RefundStateOwnerHandoffDecisionType =
  | "shadow_command_prepared"
  | "manual_review_required"
  | "query_required"
  | "reconciliation_required"
  | "blocked";

export type RefundStateOwnerHandoffBlockCode =
  | "SIGNATURE_NOT_VERIFIED"
  | "INBOX_RECORD_UNSAFE"
  | "DIGEST_CONFLICT"
  | "PROVIDER_REFUND_FAILED"
  | "PROVIDER_REFUND_ID_MISSING"
  | "PROVIDER_REFUND_ID_MISMATCH"
  | "AMOUNT_MISMATCH"
  | "CURRENCY_MISMATCH"
  | "PAYMENT_SESSION_MISMATCH"
  | "TERMINAL_STATE_CONFLICT"
  | "OWNERSHIP_CHECK_FAILED"
  | "PERMISSION_CHECK_FAILED"
  | "MANUAL_REVIEW_REQUIRED"
  | "MANUAL_REVIEW_REJECTED"
  | "QUERY_REQUIRED"
  | "RECONCILIATION_REQUIRED";

export type RefundStateOwnerExpectedSnapshot = {
  localRefundCommandKey: string;
  requestedAmountMinor: number;
  currency: "CNY";
  providerRefundId?: string;
  paymentSessionId?: string;
  currentPlatformRefundState:
    | "none"
    | "pending"
    | "review_required"
    | "shadow_prepared"
    | "succeeded"
    | "failed"
    | "canceled";
};

export type RefundStateOwnerHandoffInput = {
  inboxRecordId: string;
  inboxProcessingStatus: string;
  provider: "wechat_pay" | "alipay" | "mock_china_pay";
  envelope: ChinaPaymentNotificationEnvelope;
  expectedRefundSnapshot: RefundStateOwnerExpectedSnapshot;
  ownershipCheck: {
    sellerId?: string;
    marketId?: string;
    passed: boolean;
  };
  permissionCheck: {
    actorType: RefundStateOwnerHandoffActorType;
    actorId?: string;
    passed: boolean;
  };
  manualReview?: {
    required: boolean;
    decision?:
      | "approved_for_shadow"
      | "rejected"
      | "needs_query"
      | "needs_reconciliation";
    reasonCodes: string[];
  };
  auditMetadata?: Record<string, unknown>;
};

export type RefundStateOwnerHandoffDecision = {
  decision: RefundStateOwnerHandoffDecisionType;
  executable: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  idempotencyKey: string;
  blockCodes: RefundStateOwnerHandoffBlockCode[];
  shadowCommand?: {
    commandType: "refund_state_shadow";
    provider: RefundStateOwnerHandoffInput["provider"];
    inboxRecordId: string;
    providerRefundId: string;
    localRefundCommandKey: string;
    amountMinor: number;
    currency: "CNY";
  };
  auditMetadata: Record<string, unknown>;
};

const terminalPlatformStates = new Set([
  "succeeded",
  "failed",
  "canceled",
]);

const unsafeInboxStates = new Set([
  "digest_conflict_manual_review",
  "terminal_rejected",
]);

const auditMetadataDeniedKeys = new Set([
  "providerRefundRequest",
  "providerRefundQuery",
  "refundQuery",
  "refundStateMutation",
  "workflowCommand",
  "workflowExecution",
  "rawProviderPayload",
  "rawPayload",
  "privateKey",
  "certificate",
  "apiV3Key",
  "webhookSecret",
  "settlementAdjustment",
  "commissionAdjustment",
  "payoutAdjustment",
  "fulfillmentMutation",
  "logisticsMutation",
].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")));

const normalizeMetadataKey = (key: string): string =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

const sanitizeMetadataValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeMetadataValue);
  }

  if (value && typeof value === "object") {
    return sanitizeAuditMetadata(value as Record<string, unknown>);
  }

  return value;
};

const sanitizeAuditMetadata = (
  metadata: Record<string, unknown> = {},
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !auditMetadataDeniedKeys.has(normalizeMetadataKey(key)))
      .map(([key, value]) => [key, sanitizeMetadataValue(value)]),
  );

const baseAuditMetadata = (input: RefundStateOwnerHandoffInput) => ({
  inboxRecordId: input.inboxRecordId,
  inboxProcessingStatus: input.inboxProcessingStatus,
  provider: input.provider,
  providerEventId: input.envelope.eventId,
  providerEventType: input.envelope.eventType,
  providerRefundId: input.envelope.providerRefundId,
  merchantOrderRef: input.envelope.merchantOrderRef,
  paymentSessionId: input.envelope.paymentSessionId,
  amountMinor: input.envelope.amount.value,
  currency: input.envelope.amount.currency,
  expectedAmountMinor: input.expectedRefundSnapshot.requestedAmountMinor,
  expectedCurrency: input.expectedRefundSnapshot.currency,
  currentPlatformRefundState:
    input.expectedRefundSnapshot.currentPlatformRefundState,
  actorType: input.permissionCheck.actorType,
  actorId: input.permissionCheck.actorId,
  sellerId: input.ownershipCheck.sellerId,
  marketId: input.ownershipCheck.marketId,
  manualReviewRequired: input.manualReview?.required ?? false,
  manualReviewDecision: input.manualReview?.decision,
  manualReviewReasonCodes: input.manualReview?.reasonCodes ?? [],
  ...sanitizeAuditMetadata(input.auditMetadata),
});

const decision = (
  input: RefundStateOwnerHandoffInput,
  decisionType: RefundStateOwnerHandoffDecisionType,
  blockCodes: RefundStateOwnerHandoffBlockCode[],
): RefundStateOwnerHandoffDecision => ({
  decision: decisionType,
  executable: false,
  runtimeMutationBlocked: true,
  refundSuccessState: false,
  idempotencyKey: input.envelope.idempotencyKey,
  blockCodes,
  auditMetadata: {
    ...baseAuditMetadata(input),
    decision: decisionType,
    blockCodes,
  },
});

export const evaluateRefundStateOwnerHandoffContract = (
  input: RefundStateOwnerHandoffInput,
): RefundStateOwnerHandoffDecision => {
  if (input.envelope.signature.status !== "verified") {
    return decision(input, "blocked", ["SIGNATURE_NOT_VERIFIED"]);
  }

  if (unsafeInboxStates.has(input.inboxProcessingStatus)) {
    return decision(
      input,
      input.inboxProcessingStatus === "digest_conflict_manual_review"
        ? "manual_review_required"
        : "blocked",
      [
        input.inboxProcessingStatus === "digest_conflict_manual_review"
          ? "DIGEST_CONFLICT"
          : "INBOX_RECORD_UNSAFE",
      ],
    );
  }

  if (input.envelope.eventType === "refund.failed") {
    return decision(input, "manual_review_required", [
      "PROVIDER_REFUND_FAILED",
    ]);
  }

  const providerRefundId = input.envelope.providerRefundId;

  if (!providerRefundId) {
    return decision(input, "query_required", ["PROVIDER_REFUND_ID_MISSING"]);
  }

  if (
    input.expectedRefundSnapshot.providerRefundId &&
    input.expectedRefundSnapshot.providerRefundId !== providerRefundId
  ) {
    return decision(input, "query_required", [
      "PROVIDER_REFUND_ID_MISMATCH",
    ]);
  }

  if (
    input.envelope.amount.value !==
    input.expectedRefundSnapshot.requestedAmountMinor
  ) {
    return decision(input, "manual_review_required", ["AMOUNT_MISMATCH"]);
  }

  if (
    input.envelope.amount.currency !== input.expectedRefundSnapshot.currency
  ) {
    return decision(input, "manual_review_required", ["CURRENCY_MISMATCH"]);
  }

  if (
    input.expectedRefundSnapshot.paymentSessionId &&
    input.envelope.paymentSessionId !==
      input.expectedRefundSnapshot.paymentSessionId
  ) {
    return decision(input, "manual_review_required", [
      "PAYMENT_SESSION_MISMATCH",
    ]);
  }

  if (
    terminalPlatformStates.has(
      input.expectedRefundSnapshot.currentPlatformRefundState,
    )
  ) {
    return decision(input, "reconciliation_required", [
      "TERMINAL_STATE_CONFLICT",
    ]);
  }

  if (!input.ownershipCheck.passed) {
    return decision(input, "blocked", ["OWNERSHIP_CHECK_FAILED"]);
  }

  if (!input.permissionCheck.passed) {
    return decision(input, "blocked", ["PERMISSION_CHECK_FAILED"]);
  }

  if (input.manualReview?.required) {
    if (input.manualReview.decision === "approved_for_shadow") {
      return {
        ...decision(input, "shadow_command_prepared", []),
        shadowCommand: {
          commandType: "refund_state_shadow",
          provider: input.provider,
          inboxRecordId: input.inboxRecordId,
          providerRefundId,
          localRefundCommandKey:
            input.expectedRefundSnapshot.localRefundCommandKey,
          amountMinor: input.envelope.amount.value,
          currency: "CNY",
        },
      };
    }

    if (input.manualReview.decision === "needs_query") {
      return decision(input, "query_required", ["QUERY_REQUIRED"]);
    }

    if (input.manualReview.decision === "needs_reconciliation") {
      return decision(input, "reconciliation_required", [
        "RECONCILIATION_REQUIRED",
      ]);
    }

    if (input.manualReview.decision === "rejected") {
      return decision(input, "blocked", ["MANUAL_REVIEW_REJECTED"]);
    }

    return decision(input, "manual_review_required", [
      "MANUAL_REVIEW_REQUIRED",
    ]);
  }

  return {
    ...decision(input, "shadow_command_prepared", []),
    shadowCommand: {
      commandType: "refund_state_shadow",
      provider: input.provider,
      inboxRecordId: input.inboxRecordId,
      providerRefundId,
      localRefundCommandKey:
        input.expectedRefundSnapshot.localRefundCommandKey,
      amountMinor: input.envelope.amount.value,
      currency: "CNY",
    },
  };
};
