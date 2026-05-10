export const refundAuditEventAllowedActions = [
  "refund_command_received",
  "refund_guard_blocked",
  "refund_guard_manual_review_required",
  "refund_request_idempotency_key_created",
  "refund_provider_request_prepared",
  "refund_provider_request_blocked",
  "refund_notification_received",
  "refund_notification_verified",
  "refund_notification_normalized",
  "refund_notification_duplicate_seen",
  "refund_notification_digest_conflict",
  "refund_manual_review_opened",
  "refund_manual_review_assigned",
  "refund_manual_review_resolved",
  "refund_runtime_mutation_blocked",
  "refund_settlement_blocked",
] as const;

export const refundAuditEventForbiddenActions = [
  "refund_state_mutated",
  "refund_workflow_executed",
  "provider_refund_request_sent",
  "settlement_adjusted",
  "commission_adjusted",
  "payout_adjusted",
] as const;

export type RefundAuditEventAllowedAction =
  (typeof refundAuditEventAllowedActions)[number];

export type RefundAuditEventForbiddenAction =
  (typeof refundAuditEventForbiddenActions)[number];

export type RefundAuditEventValidationFailureCode =
  | "REFUND_AUDIT_ACTION_FORBIDDEN"
  | "REFUND_AUDIT_ACTION_UNSUPPORTED"
  | "REFUND_AUDIT_METADATA_MISSING"
  | "REFUND_AUDIT_METADATA_SENSITIVE"
  | "REFUND_AUDIT_METADATA_EXECUTABLE";

export type RefundAuditEventCandidate = {
  action: string;
  actorType?: "admin" | "vendor" | "system_job" | "provider";
  metadata: Record<string, unknown>;
};

export type RefundAuditEventAllowlistDecision =
  | {
      allowed: true;
      action: RefundAuditEventAllowedAction;
      fixtureOnly: true;
      executable: false;
    }
  | {
      allowed: false;
      action: string;
      failureCode: RefundAuditEventValidationFailureCode;
      failureMessage: string;
      fixtureOnly: true;
      executable: false;
    };

const allowedActions = new Set<string>(refundAuditEventAllowedActions);
const forbiddenActions = new Set<string>(refundAuditEventForbiddenActions);

const requiredMetadataFields = [
  "auditEventId",
  "actorType",
  "orderId",
  "paymentId",
  "paymentSessionId",
  "merchantOrderRef",
  "requestedAmountMinor",
  "currency",
  "localRefundCommandIdempotencyKey",
  "decisionType",
  "createdAt",
] as const;

const sensitiveMetadataKeys = [
  "rawProviderPayload",
  "privateKey",
  "certificate",
  "apiV3Key",
  "webhookSecret",
  "fullPhone",
  "identityNumber",
  "bankCardNumber",
  "fullAddress",
] as const;

const executableMetadataKeys = [
  "providerRefundRequest",
  "refundStateMutation",
  "workflowCommand",
  "workflowExecution",
  "providerSdkRequest",
] as const;

const hasAnyKey = (
  metadata: Record<string, unknown>,
  keys: readonly string[],
): boolean => keys.some((key) => Object.prototype.hasOwnProperty.call(metadata, key));

const missingRequiredMetadata = (
  metadata: Record<string, unknown>,
): string[] =>
  requiredMetadataFields.filter(
    (field) =>
      !Object.prototype.hasOwnProperty.call(metadata, field) ||
      metadata[field] === undefined ||
      metadata[field] === "",
  );

const failed = (
  candidate: RefundAuditEventCandidate,
  failureCode: RefundAuditEventValidationFailureCode,
  failureMessage: string,
): RefundAuditEventAllowlistDecision => ({
  allowed: false,
  action: candidate.action,
  failureCode,
  failureMessage,
  fixtureOnly: true,
  executable: false,
});

export const validateRefundAuditEventAllowlistContract = (
  candidate: RefundAuditEventCandidate,
): RefundAuditEventAllowlistDecision => {
  if (forbiddenActions.has(candidate.action)) {
    return failed(
      candidate,
      "REFUND_AUDIT_ACTION_FORBIDDEN",
      "Refund audit action is explicitly forbidden in the current gate.",
    );
  }

  if (!allowedActions.has(candidate.action)) {
    return failed(
      candidate,
      "REFUND_AUDIT_ACTION_UNSUPPORTED",
      "Refund audit action is not in the current allowlist.",
    );
  }

  const missingFields = missingRequiredMetadata(candidate.metadata);

  if (missingFields.length > 0) {
    return failed(
      candidate,
      "REFUND_AUDIT_METADATA_MISSING",
      `Refund audit metadata is missing required fields: ${missingFields.join(", ")}.`,
    );
  }

  if (hasAnyKey(candidate.metadata, sensitiveMetadataKeys)) {
    return failed(
      candidate,
      "REFUND_AUDIT_METADATA_SENSITIVE",
      "Refund audit metadata contains sensitive provider or user data.",
    );
  }

  if (hasAnyKey(candidate.metadata, executableMetadataKeys)) {
    return failed(
      candidate,
      "REFUND_AUDIT_METADATA_EXECUTABLE",
      "Refund audit metadata contains executable provider or workflow data.",
    );
  }

  return {
    allowed: true,
    action: candidate.action as RefundAuditEventAllowedAction,
    fixtureOnly: true,
    executable: false,
  };
};
