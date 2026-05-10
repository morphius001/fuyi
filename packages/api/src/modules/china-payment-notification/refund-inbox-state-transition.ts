import { RefundAmountGuardDecision } from "./refund-amount-guard";
import { RefundAuditEventAllowedAction } from "./refund-audit-event-allowlist";
import { RefundManualReviewAuditDecision } from "./refund-manual-review-audit";
import { ChinaPaymentNotificationEnvelope } from "./types";

export const refundInboxStates = [
  "received",
  "signature_verified",
  "normalized",
  "duplicate_seen",
  "digest_conflict_manual_review",
  "guard_checked",
  "manual_review_required",
  "state_owner_pending",
  "runtime_mutation_blocked",
  "terminal_rejected",
  "processed_for_audit_only",
] as const;

export type RefundInboxState = (typeof refundInboxStates)[number];

export type RefundInboxTransitionEvent =
  | "signature_verified"
  | "terminal_rejected"
  | "normalized"
  | "duplicate_replay_checked"
  | "guard_checked"
  | "guard_resolved"
  | "manual_review_resolved"
  | "runtime_mutation_blocked"
  | "processed_for_audit_only";

export type RefundInboxTransitionFailureCode =
  | "REFUND_INBOX_TRANSITION_UNSUPPORTED"
  | "REFUND_INBOX_SIGNATURE_NOT_VERIFIED"
  | "REFUND_INBOX_ENVELOPE_MISSING"
  | "REFUND_INBOX_ENVELOPE_UNSUPPORTED"
  | "REFUND_INBOX_IDEMPOTENCY_KEY_MISSING"
  | "REFUND_INBOX_DIGEST_MISSING"
  | "REFUND_INBOX_GUARD_DECISION_MISSING"
  | "REFUND_INBOX_MANUAL_REVIEW_DECISION_MISSING";

export type RefundInboxTransitionInput = {
  from: RefundInboxState;
  event: RefundInboxTransitionEvent;
  signatureStatus?: "verified" | "invalid" | "missing" | "unsupported";
  envelope?: ChinaPaymentNotificationEnvelope;
  existingIdempotencyKey?: string;
  incomingIdempotencyKey?: string;
  existingRawPayloadDigest?: string;
  incomingRawPayloadDigest?: string;
  guardDecision?: RefundAmountGuardDecision;
  manualReviewDecision?: RefundManualReviewAuditDecision;
  auditMetadata: Record<string, unknown>;
};

export type RefundInboxTransitionDecision =
  | {
      accepted: true;
      from: RefundInboxState;
      to: RefundInboxState;
      auditAction: RefundAuditEventAllowedAction;
      reason: string;
      blockRuntimeMutation: true;
      stateMutationAllowed: false;
      fixtureOnly: true;
      executable: false;
      auditMetadata: Record<string, unknown>;
    }
  | {
      accepted: false;
      from: RefundInboxState;
      event: RefundInboxTransitionEvent;
      failureCode: RefundInboxTransitionFailureCode;
      failureMessage: string;
      blockRuntimeMutation: true;
      stateMutationAllowed: false;
      fixtureOnly: true;
      executable: false;
      auditMetadata: Record<string, unknown>;
    };

export const refundInboxAllowedTransitions = [
  ["received", "signature_verified"],
  ["received", "terminal_rejected"],
  ["signature_verified", "normalized"],
  ["normalized", "duplicate_seen"],
  ["normalized", "digest_conflict_manual_review"],
  ["normalized", "guard_checked"],
  ["guard_checked", "manual_review_required"],
  ["guard_checked", "state_owner_pending"],
  ["guard_checked", "runtime_mutation_blocked"],
  ["manual_review_required", "runtime_mutation_blocked"],
  ["manual_review_required", "state_owner_pending"],
  ["state_owner_pending", "processed_for_audit_only"],
  ["runtime_mutation_blocked", "processed_for_audit_only"],
  ["duplicate_seen", "processed_for_audit_only"],
  ["digest_conflict_manual_review", "runtime_mutation_blocked"],
  ["terminal_rejected", "processed_for_audit_only"],
] as const satisfies readonly (readonly [RefundInboxState, RefundInboxState])[];

const allowedTransitionKeys = new Set(
  refundInboxAllowedTransitions.map(([from, to]) => `${from}->${to}`),
);

const refundEventTypes = new Set(["refund.succeeded", "refund.failed"]);

const auditMetadataDeniedKeys = new Set([
  "providerRefundRequest",
  "refundStateMutation",
  "workflowCommand",
  "workflowExecution",
  "providerSdkRequest",
  "rawProviderPayload",
  "privateKey",
  "certificate",
  "apiV3Key",
  "webhookSecret",
  "fullPhone",
  "identityNumber",
  "bankCardNumber",
  "fullAddress",
]);

const sanitizeAuditMetadataValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeAuditMetadataValue);
  }

  if (value && typeof value === "object") {
    return sanitizeAuditMetadata(value as Record<string, unknown>);
  }

  return value;
};

const sanitizeAuditMetadata = (
  metadata: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !auditMetadataDeniedKeys.has(key))
      .map(([key, value]) => [key, sanitizeAuditMetadataValue(value)]),
  );

const accepted = (
  input: RefundInboxTransitionInput,
  to: RefundInboxState,
  auditAction: RefundAuditEventAllowedAction,
  reason: string,
): RefundInboxTransitionDecision => ({
  accepted: true,
  from: input.from,
  to,
  auditAction,
  reason,
  blockRuntimeMutation: true,
  stateMutationAllowed: false,
  fixtureOnly: true,
  executable: false,
  auditMetadata: {
    ...sanitizeAuditMetadata(input.auditMetadata),
    fromState: input.from,
    toState: to,
    transitionEvent: input.event,
  },
});

const rejected = (
  input: RefundInboxTransitionInput,
  failureCode: RefundInboxTransitionFailureCode,
  failureMessage: string,
): RefundInboxTransitionDecision => ({
  accepted: false,
  from: input.from,
  event: input.event,
  failureCode,
  failureMessage,
  blockRuntimeMutation: true,
  stateMutationAllowed: false,
  fixtureOnly: true,
  executable: false,
  auditMetadata: {
    ...sanitizeAuditMetadata(input.auditMetadata),
    fromState: input.from,
    transitionEvent: input.event,
  },
});

const ensureAllowedTransition = (
  input: RefundInboxTransitionInput,
  to: RefundInboxState,
): RefundInboxTransitionDecision | undefined => {
  if (allowedTransitionKeys.has(`${input.from}->${to}`)) {
    return undefined;
  }

  return rejected(
    input,
    "REFUND_INBOX_TRANSITION_UNSUPPORTED",
    "Refund inbox transition is not allowed by the current non-executable contract.",
  );
};

const acceptIfAllowed = (
  input: RefundInboxTransitionInput,
  to: RefundInboxState,
  auditAction: RefundAuditEventAllowedAction,
  reason: string,
): RefundInboxTransitionDecision =>
  ensureAllowedTransition(input, to) ?? accepted(input, to, auditAction, reason);

const normalizeDuplicateReplay = (
  input: RefundInboxTransitionInput,
): RefundInboxTransitionDecision => {
  if (!input.existingIdempotencyKey || !input.incomingIdempotencyKey) {
    return rejected(
      input,
      "REFUND_INBOX_IDEMPOTENCY_KEY_MISSING",
      "Refund notification duplicate replay check requires both idempotency keys.",
    );
  }

  if (!input.existingRawPayloadDigest || !input.incomingRawPayloadDigest) {
    return rejected(
      input,
      "REFUND_INBOX_DIGEST_MISSING",
      "Refund notification duplicate replay check requires both payload digests.",
    );
  }

  if (
    input.existingIdempotencyKey === input.incomingIdempotencyKey &&
    input.existingRawPayloadDigest === input.incomingRawPayloadDigest
  ) {
    return acceptIfAllowed(
      input,
      "duplicate_seen",
      "refund_notification_duplicate_seen",
      "Duplicate refund notification has the same idempotency key and digest; no runtime mutation is allowed.",
    );
  }

  return acceptIfAllowed(
    input,
    "digest_conflict_manual_review",
    "refund_notification_digest_conflict",
    "Refund notification idempotency replay has a digest conflict and must enter manual review.",
  );
};

const normalizeGuardResolution = (
  input: RefundInboxTransitionInput,
): RefundInboxTransitionDecision => {
  if (!input.guardDecision) {
    return rejected(
      input,
      "REFUND_INBOX_GUARD_DECISION_MISSING",
      "Refund inbox guard resolution requires a guard decision.",
    );
  }

  if (input.guardDecision.decisionType === "accepted_for_guard_only") {
    return acceptIfAllowed(
      input,
      "state_owner_pending",
      "refund_runtime_mutation_blocked",
      "Refund guard accepted the notification for handoff only; state owner remains pending and runtime mutation is blocked.",
    );
  }

  if (input.guardDecision.decisionType === "manual_review_required") {
    return acceptIfAllowed(
      input,
      "manual_review_required",
      "refund_guard_manual_review_required",
      "Refund guard requires manual review before any future state owner can continue.",
    );
  }

  return acceptIfAllowed(
    input,
    "runtime_mutation_blocked",
    "refund_runtime_mutation_blocked",
    "Refund guard blocked the notification and runtime mutation remains disabled.",
  );
};

const normalizeManualReviewResolution = (
  input: RefundInboxTransitionInput,
): RefundInboxTransitionDecision => {
  if (!input.manualReviewDecision) {
    return rejected(
      input,
      "REFUND_INBOX_MANUAL_REVIEW_DECISION_MISSING",
      "Refund inbox manual review resolution requires a manual review decision.",
    );
  }

  if (input.manualReviewDecision.required) {
    return acceptIfAllowed(
      input,
      "runtime_mutation_blocked",
      "refund_runtime_mutation_blocked",
      "Manual review is still required; runtime mutation remains blocked.",
    );
  }

  return acceptIfAllowed(
    input,
    "state_owner_pending",
    "refund_runtime_mutation_blocked",
    "Manual review did not require further review, but this contract only hands off to a future state owner.",
  );
};

export const evaluateRefundInboxStateTransitionContract = (
  input: RefundInboxTransitionInput,
): RefundInboxTransitionDecision => {
  switch (input.event) {
    case "signature_verified":
      if (input.signatureStatus !== "verified") {
        return rejected(
          input,
          "REFUND_INBOX_SIGNATURE_NOT_VERIFIED",
          "Refund inbox signature transition requires a verified signature.",
        );
      }

      return acceptIfAllowed(
        input,
        "signature_verified",
        "refund_notification_verified",
        "Refund notification signature was verified for inbox processing only.",
      );

    case "terminal_rejected":
      return acceptIfAllowed(
        input,
        "terminal_rejected",
        "refund_runtime_mutation_blocked",
        "Refund notification was rejected for audit-only processing.",
      );

    case "normalized":
      if (!input.envelope) {
        return rejected(
          input,
          "REFUND_INBOX_ENVELOPE_MISSING",
          "Refund inbox normalization transition requires a normalized envelope.",
        );
      }

      if (
        !refundEventTypes.has(input.envelope.eventType) ||
        input.envelope.signature.status !== "verified" ||
        !input.envelope.providerRefundId ||
        !input.envelope.idempotencyKey ||
        !input.envelope.rawPayloadDigest
      ) {
        return rejected(
          input,
          "REFUND_INBOX_ENVELOPE_UNSUPPORTED",
          "Refund inbox normalization only accepts verified refund envelopes with provider refund id, idempotency key, and digest.",
        );
      }

      return acceptIfAllowed(
        input,
        "normalized",
        "refund_notification_normalized",
        "Refund notification was normalized as an inbox input only.",
      );

    case "duplicate_replay_checked":
      return normalizeDuplicateReplay(input);

    case "guard_checked":
      if (!input.guardDecision) {
        return rejected(
          input,
          "REFUND_INBOX_GUARD_DECISION_MISSING",
          "Refund inbox guard check requires a guard decision.",
        );
      }

      return acceptIfAllowed(
        input,
        "guard_checked",
        input.guardDecision.decisionType === "manual_review_required"
          ? "refund_guard_manual_review_required"
          : "refund_runtime_mutation_blocked",
        "Refund guard was evaluated without enabling runtime mutation.",
      );

    case "guard_resolved":
      return normalizeGuardResolution(input);

    case "manual_review_resolved":
      return normalizeManualReviewResolution(input);

    case "runtime_mutation_blocked":
      return acceptIfAllowed(
        input,
        "runtime_mutation_blocked",
        "refund_runtime_mutation_blocked",
        "Refund runtime mutation was explicitly blocked.",
      );

    case "processed_for_audit_only":
      return acceptIfAllowed(
        input,
        "processed_for_audit_only",
        "refund_runtime_mutation_blocked",
        "Refund inbox item was processed for audit only.",
      );
  }
};
