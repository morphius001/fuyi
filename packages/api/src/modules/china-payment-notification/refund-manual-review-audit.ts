import { RefundAmountGuardDecision } from "./refund-amount-guard";

export type RefundManualReviewReasonCode =
  | "amount_mismatch"
  | "currency_mismatch"
  | "provider_refund_id_mismatch"
  | "merchant_order_mismatch"
  | "payment_session_mismatch"
  | "provider_transaction_mismatch"
  | "notification_idempotency_mismatch"
  | "duplicate_digest_conflict"
  | "duplicate_provider_refund_conflict"
  | "provider_unknown_or_timeout"
  | "request_context_missing"
  | "order_ownership_mismatch"
  | "seller_ownership_mismatch"
  | "market_ownership_mismatch"
  | "rbac_missing"
  | "vendor_actor_not_allowed"
  | "over_refund_attempt"
  | "settlement_or_payout_locked"
  | "reconciliation_mismatch"
  | "refund_reason_or_audit_note_missing"
  | "guard_blocked"
  | "guard_manual_review_required";

export type RefundManualReviewSeverity = "low" | "medium" | "high" | "critical";

export type RefundManualReviewSignal = {
  reasonCode: RefundManualReviewReasonCode;
  severity?: RefundManualReviewSeverity;
  retryable?: boolean;
  message?: string;
};

export type RefundManualReviewAuditInput = {
  guardDecision: RefundAmountGuardDecision;
  signals: RefundManualReviewSignal[];
  auditContext: {
    auditEventId: string;
    actorType: "admin" | "vendor" | "system_job" | "provider";
    actorId?: string;
    providerEventId?: string;
    orderId: string;
    paymentId: string;
    paymentSessionId: string;
    merchantOrderRef: string;
    sellerId?: string;
    marketId?: string;
    requestedAmountMinor: number;
    currency: "CNY";
    capturedAmountMinor: number;
    previousRefundedAmountMinor: number;
    pendingRefundAmountMinor: number;
    localRefundCommandIdempotencyKey: string;
    refundRequestIdempotencyKey?: string;
    providerRefundId?: string;
    notificationIdempotencyKey?: string;
    rawPayloadDigest?: string;
    createdAt: string;
  };
};

export type RefundManualReviewAuditDecision = {
  required: boolean;
  reasonCodes: RefundManualReviewReasonCode[];
  severity: RefundManualReviewSeverity;
  retryable: boolean;
  blockRuntimeMutation: true;
  auditAction:
    | "refund_guard_manual_review_required"
    | "refund_guard_blocked"
    | "refund_notification_digest_conflict"
    | "refund_runtime_mutation_blocked";
  auditMetadata: Record<string, unknown>;
  redactionPolicy: {
    includeRawPayload: false;
    includeProviderSecrets: false;
    includeUserSensitiveData: false;
    includeExecutableCommand: false;
  };
  fixtureOnly: true;
  executable: false;
};

const severityRank: Record<RefundManualReviewSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const maxSeverity = (
  signals: readonly RefundManualReviewSignal[],
): RefundManualReviewSeverity => {
  const highest = signals.reduce<RefundManualReviewSeverity>(
    (current, signal) => {
      const severity = signal.severity ?? "medium";
      return severityRank[severity] > severityRank[current]
        ? severity
        : current;
    },
    "low",
  );

  return highest;
};

const uniqueReasonCodes = (
  signals: readonly RefundManualReviewSignal[],
): RefundManualReviewReasonCode[] =>
  Array.from(new Set(signals.map((signal) => signal.reasonCode)));

const hasSignal = (
  signals: readonly RefundManualReviewSignal[],
  reasonCode: RefundManualReviewReasonCode,
) => signals.some((signal) => signal.reasonCode === reasonCode);

const chooseAuditAction = (
  input: RefundManualReviewAuditInput,
): RefundManualReviewAuditDecision["auditAction"] => {
  if (hasSignal(input.signals, "duplicate_digest_conflict")) {
    return "refund_notification_digest_conflict";
  }

  if (input.guardDecision.decisionType === "blocked") {
    return "refund_guard_blocked";
  }

  if (
    input.guardDecision.decisionType === "manual_review_required" ||
    input.signals.length > 0
  ) {
    return "refund_guard_manual_review_required";
  }

  return "refund_runtime_mutation_blocked";
};

export const buildRefundManualReviewAuditDecision = (
  input: RefundManualReviewAuditInput,
): RefundManualReviewAuditDecision => {
  const guardRequiresReview =
    input.guardDecision.decisionType === "blocked" ||
    input.guardDecision.decisionType === "manual_review_required";
  const required = guardRequiresReview || input.signals.length > 0;
  const guardReason: RefundManualReviewSignal[] = guardRequiresReview
    ? [
        {
          reasonCode:
            input.guardDecision.decisionType === "blocked"
              ? "guard_blocked"
              : "guard_manual_review_required",
          severity:
            input.guardDecision.decisionType === "blocked"
              ? "high"
              : "medium",
          retryable: input.guardDecision.retryable,
        },
      ]
    : [];
  const signals = [...input.signals, ...guardReason];

  return {
    required,
    reasonCodes: uniqueReasonCodes(signals),
    severity: maxSeverity(signals),
    retryable: signals.some((signal) => signal.retryable === true),
    blockRuntimeMutation: true,
    auditAction: chooseAuditAction(input),
    auditMetadata: {
      ...input.auditContext,
      decisionType: input.guardDecision.decisionType,
      guardBlockCode: input.guardDecision.blockCode,
      manualReviewRequired: required,
      manualReviewReasonCodes: uniqueReasonCodes(signals),
      retryable: signals.some((signal) => signal.retryable === true),
    },
    redactionPolicy: {
      includeRawPayload: false,
      includeProviderSecrets: false,
      includeUserSensitiveData: false,
      includeExecutableCommand: false,
    },
    fixtureOnly: true,
    executable: false,
  };
};
