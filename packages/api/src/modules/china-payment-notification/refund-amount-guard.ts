export type RefundCommandActorType = "admin" | "vendor" | "system_job";

export type RefundCommandReasonCode =
  | "customer_requested"
  | "out_of_stock"
  | "quality_issue"
  | "merchant_cancelled"
  | "delivery_failed"
  | "duplicate_payment"
  | "operator_adjustment"
  | "other";

export type RefundPaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "partially_refunded"
  | "failed"
  | "canceled"
  | "refunded"
  | "unknown";

export type RefundCommandBlockCode =
  | "AMOUNT_NOT_POSITIVE"
  | "CURRENCY_UNSUPPORTED"
  | "CURRENCY_MISMATCH"
  | "PAYMENT_NOT_CAPTURED"
  | "PAYMENT_ALREADY_REFUNDED"
  | "REFUND_AMOUNT_EXCEEDS_CAPTURED"
  | "REFUND_PENDING_CONFLICT"
  | "IDEMPOTENCY_REPLAY"
  | "PROVIDER_MISMATCH"
  | "SELLER_OWNERSHIP_MISMATCH"
  | "MARKET_OWNERSHIP_MISMATCH"
  | "ACTOR_NOT_ALLOWED"
  | "RBAC_REQUIRED"
  | "REASON_REQUIRED"
  | "AUDIT_NOTE_REQUIRED"
  | "MANUAL_REVIEW_REQUIRED";

export type RefundCommandActor = {
  type: RefundCommandActorType;
  id: string;
  roleKeys: string[];
  marketIds: string[];
  sellerIds: string[];
};

export type RefundCommandOwnership = {
  marketId?: string;
  sellerId?: string;
  orderSellerId?: string;
  orderMarketId?: string;
  paymentSellerId?: string;
  paymentMarketId?: string;
};

export type RefundCommandPaymentSnapshot = {
  capturedAmountMinor: number;
  currency: "CNY";
  status: RefundPaymentStatus;
  capturedAt?: string;
  provider: string;
  providerTransactionId?: string;
};

export type RefundCommandRefundSnapshot = {
  previousRefundedAmountMinor: number;
  pendingRefundAmountMinor: number;
  priorIdempotencyKeys: string[];
  priorProviderRefundIds: string[];
  lastKnownRefundStatus?: "none" | "pending" | "succeeded" | "failed";
};

export type RefundAmountGuardInput = {
  commandId: string;
  idempotencyKey: string;
  provider: string;
  merchantOrderRef: string;
  orderId: string;
  paymentId: string;
  paymentSessionId: string;
  providerTransactionId?: string;
  requestedAmountMinor: number;
  currency: string;
  reasonCode?: RefundCommandReasonCode;
  reasonNote?: string;
  actor: RefundCommandActor;
  ownership: RefundCommandOwnership;
  paymentSnapshot: RefundCommandPaymentSnapshot;
  refundSnapshot: RefundCommandRefundSnapshot;
  requestedAt: string;
};

export type RefundAmountGuardDecision = {
  executable: false;
  decisionType: "accepted_for_guard_only" | "blocked" | "manual_review_required";
  blockCode?: RefundCommandBlockCode;
  retryable: boolean;
  idempotencyKey: string;
  auditMetadata: Record<string, unknown>;
};

const adminRefundRoles = new Set(["refund:write", "admin:refund"]);
const allowedPaymentStatuses = new Set<RefundPaymentStatus>([
  "captured",
  "partially_refunded",
]);

const buildAuditMetadata = (
  input: RefundAmountGuardInput,
  decisionType: RefundAmountGuardDecision["decisionType"],
  blockCode?: RefundCommandBlockCode,
) => ({
  commandId: input.commandId,
  actorType: input.actor.type,
  actorId: input.actor.id,
  orderId: input.orderId,
  paymentId: input.paymentId,
  paymentSessionId: input.paymentSessionId,
  sellerId: input.ownership.sellerId,
  marketId: input.ownership.marketId,
  requestedAmountMinor: input.requestedAmountMinor,
  currency: input.currency,
  capturedAmountMinor: input.paymentSnapshot.capturedAmountMinor,
  previousRefundedAmountMinor:
    input.refundSnapshot.previousRefundedAmountMinor,
  pendingRefundAmountMinor: input.refundSnapshot.pendingRefundAmountMinor,
  reasonCode: input.reasonCode,
  hasReasonNote: Boolean(input.reasonNote?.trim()),
  idempotencyKey: input.idempotencyKey,
  decisionType,
  blockCode,
  createdAt: input.requestedAt,
});

const decision = (
  input: RefundAmountGuardInput,
  decisionType: RefundAmountGuardDecision["decisionType"],
  blockCode?: RefundCommandBlockCode,
  retryable = false,
): RefundAmountGuardDecision => ({
  executable: false,
  decisionType,
  blockCode,
  retryable,
  idempotencyKey: input.idempotencyKey,
  auditMetadata: buildAuditMetadata(input, decisionType, blockCode),
});

const hasAdminRefundRole = (actor: RefundCommandActor) =>
  actor.roleKeys.some((role) => adminRefundRoles.has(role));

const same = (left?: string, right?: string) =>
  Boolean(left) && Boolean(right) && left === right;

const ownershipMissing = (ownership: RefundCommandOwnership) =>
  !ownership.sellerId ||
  !ownership.marketId ||
  !ownership.orderSellerId ||
  !ownership.orderMarketId ||
  !ownership.paymentSellerId ||
  !ownership.paymentMarketId;

export const evaluateRefundAmountGuardContract = (
  input: RefundAmountGuardInput,
): RefundAmountGuardDecision => {
  if (input.currency !== "CNY") {
    return decision(input, "blocked", "CURRENCY_UNSUPPORTED");
  }

  if (input.paymentSnapshot.currency !== input.currency) {
    return decision(input, "blocked", "CURRENCY_MISMATCH");
  }

  if (input.provider !== input.paymentSnapshot.provider) {
    return decision(input, "blocked", "PROVIDER_MISMATCH");
  }

  if (!Number.isInteger(input.requestedAmountMinor) || input.requestedAmountMinor <= 0) {
    return decision(input, "blocked", "AMOUNT_NOT_POSITIVE");
  }

  if (ownershipMissing(input.ownership)) {
    return decision(input, "manual_review_required", "MANUAL_REVIEW_REQUIRED");
  }

  const sellerId = input.ownership.sellerId as string;
  const marketId = input.ownership.marketId as string;

  if (
    !same(sellerId, input.ownership.orderSellerId) ||
    !same(sellerId, input.ownership.paymentSellerId)
  ) {
    return decision(input, "blocked", "SELLER_OWNERSHIP_MISMATCH");
  }

  if (
    !same(marketId, input.ownership.orderMarketId) ||
    !same(marketId, input.ownership.paymentMarketId)
  ) {
    return decision(input, "blocked", "MARKET_OWNERSHIP_MISMATCH");
  }

  if (input.actor.type === "admin" && !hasAdminRefundRole(input.actor)) {
    return decision(input, "blocked", "RBAC_REQUIRED");
  }

  if (
    input.actor.type === "vendor" &&
    !input.actor.sellerIds.includes(sellerId)
  ) {
    return decision(input, "blocked", "ACTOR_NOT_ALLOWED");
  }

  if (
    input.actor.type === "system_job" &&
    !input.actor.roleKeys.includes("refund:system")
  ) {
    return decision(input, "blocked", "ACTOR_NOT_ALLOWED");
  }

  if (!allowedPaymentStatuses.has(input.paymentSnapshot.status)) {
    return decision(
      input,
      "blocked",
      input.paymentSnapshot.status === "refunded"
        ? "PAYMENT_ALREADY_REFUNDED"
        : "PAYMENT_NOT_CAPTURED",
    );
  }

  if (input.refundSnapshot.priorIdempotencyKeys.includes(input.idempotencyKey)) {
    return decision(input, "manual_review_required", "IDEMPOTENCY_REPLAY");
  }

  if (input.refundSnapshot.pendingRefundAmountMinor > 0) {
    return decision(input, "manual_review_required", "REFUND_PENDING_CONFLICT");
  }

  const totalRefundedAfterRequest =
    input.refundSnapshot.previousRefundedAmountMinor +
    input.refundSnapshot.pendingRefundAmountMinor +
    input.requestedAmountMinor;

  if (totalRefundedAfterRequest > input.paymentSnapshot.capturedAmountMinor) {
    return decision(input, "blocked", "REFUND_AMOUNT_EXCEEDS_CAPTURED");
  }

  if (!input.reasonCode) {
    return decision(input, "blocked", "REASON_REQUIRED");
  }

  if (input.reasonCode === "other" && !input.reasonNote?.trim()) {
    return decision(input, "blocked", "AUDIT_NOTE_REQUIRED");
  }

  const isPartialRefund =
    input.requestedAmountMinor < input.paymentSnapshot.capturedAmountMinor;

  if (isPartialRefund && !input.reasonNote?.trim()) {
    return decision(input, "blocked", "AUDIT_NOTE_REQUIRED");
  }

  return decision(input, "accepted_for_guard_only");
};
