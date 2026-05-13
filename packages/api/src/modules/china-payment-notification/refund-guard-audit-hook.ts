import {
  RefundAmountGuardDecision,
  RefundAmountGuardInput,
} from "./refund-amount-guard";

export type RefundAmountGuardAuditHook = {
  action:
    | "refund_guard_accepted_for_review"
    | "refund_guard_blocked"
    | "refund_guard_manual_review_required";
  actorType: RefundAmountGuardInput["actor"]["type"];
  message: string;
  metadata: Record<string, unknown>;
};

const deniedMetadataKeys = new Set(
  [
    "rawProviderPayload",
    "rawPayload",
    "signature",
    "secret",
    "privateKey",
    "certificate",
    "apiV3Key",
    "webhookSecret",
    "providerRefundRequest",
    "providerRefundQuery",
    "refundQuery",
    "workflowExecution",
    "executeWorkflow",
    "refundStateMutation",
    "fullPhone",
    "fullAddress",
    "identityNumber",
    "bankCardNumber",
  ].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")),
);

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

const actionFor = (
  decision: RefundAmountGuardDecision,
): RefundAmountGuardAuditHook["action"] => {
  if (decision.decisionType === "accepted_for_guard_only") {
    return "refund_guard_accepted_for_review";
  }

  if (decision.decisionType === "manual_review_required") {
    return "refund_guard_manual_review_required";
  }

  return "refund_guard_blocked";
};

const messageFor = (decision: RefundAmountGuardDecision): string => {
  if (decision.decisionType === "accepted_for_guard_only") {
    return "Refund guard accepted the request for further review without executing refund runtime.";
  }

  if (decision.decisionType === "manual_review_required") {
    return "Refund guard requires manual review before any refund runtime can proceed.";
  }

  return "Refund guard blocked the request before any refund runtime could proceed.";
};

export const mapRefundAmountGuardDecisionToAuditHook = (
  input: RefundAmountGuardInput,
  decision: RefundAmountGuardDecision,
): RefundAmountGuardAuditHook => ({
  action: actionFor(decision),
  actorType: input.actor.type,
  message: messageFor(decision),
  metadata: sanitizeMetadata({
    ...decision.auditMetadata,
    actorRoleKeys: input.actor.roleKeys,
    actorMarketIds: input.actor.marketIds,
    actorSellerIds: input.actor.sellerIds,
  }),
});
