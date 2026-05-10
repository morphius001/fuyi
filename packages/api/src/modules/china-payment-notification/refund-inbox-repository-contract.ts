import { RefundAuditEventAllowedAction } from "./refund-audit-event-allowlist";
import { RefundInboxState } from "./refund-inbox-state-transition";
import { ChinaPaymentNotificationEnvelope } from "./types";

export type RefundInboxRecord = {
  id: string;
  provider: string;
  eventId?: string;
  eventType: "refund.succeeded" | "refund.failed";
  idempotencyKey: string;
  providerRefundId: string;
  merchantOrderRef: string;
  paymentSessionId?: string;
  amountMinor: number;
  currency: "CNY";
  signatureStatus: "verified" | "invalid" | "missing" | "unsupported";
  rawPayloadDigest: string;
  processingStatus: RefundInboxState;
  retryCount: number;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
};

export type ReceiveRefundNotificationInput = {
  envelope: ChinaPaymentNotificationEnvelope;
  receivedAt: string;
  sanitizedMetadata: Record<string, unknown>;
};

export type RefundInboxReceiveResult =
  | {
      status: "received";
      record: RefundInboxRecord;
      fixtureOnly: true;
      executable: false;
    }
  | {
      status: "duplicate_same_digest";
      record: RefundInboxRecord;
      fixtureOnly: true;
      executable: false;
    }
  | {
      status: "duplicate_digest_conflict";
      record: RefundInboxRecord;
      fixtureOnly: true;
      executable: false;
    };

export type AppendRefundInboxEventInput = {
  inboxId: string;
  action: RefundAuditEventAllowedAction;
  actorType: "admin" | "vendor" | "system_job" | "provider";
  message: string;
  metadata: Record<string, unknown>;
};

export type MarkRefundInboxFailedInput = {
  idempotencyKey: string;
  errorCode: RefundInboxRepositoryErrorCode | string;
  errorMessage: string;
  metadata?: Record<string, unknown>;
};

export type MarkRefundGuardCheckedInput = {
  idempotencyKey: string;
  guardDecisionType: "accepted_for_guard_only" | "blocked" | "manual_review_required";
  blockCode?: string;
  metadata?: Record<string, unknown>;
};

export type MarkRefundManualReviewRequiredInput = {
  idempotencyKey: string;
  reasonCodes: string[];
  severity: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, unknown>;
};

export type MarkRefundRuntimeMutationBlockedInput = {
  idempotencyKey: string;
  reason: string;
  metadata?: Record<string, unknown>;
};

export type RefundInboxRepositoryErrorKind =
  | "terminal"
  | "retryable"
  | "duplicate"
  | "manual_review"
  | "unknown";

export type RefundInboxRepositoryErrorCode =
  | "REFUND_DB_UNIQUE_CONFLICT"
  | "REFUND_DB_DIGEST_CONFLICT"
  | "REFUND_DB_PROVIDER_REFUND_CONFLICT"
  | "REFUND_DB_LOCK_TIMEOUT"
  | "REFUND_DB_CONNECTION_INTERRUPTED"
  | "REFUND_DB_EVENT_LOG_WRITE_FAILED"
  | "REFUND_DB_INVALID_STATE_TRANSITION"
  | "REFUND_DB_METADATA_REDACTION_FAILED";

export const refundInboxRepositoryErrorKinds = {
  REFUND_DB_UNIQUE_CONFLICT: "duplicate",
  REFUND_DB_DIGEST_CONFLICT: "manual_review",
  REFUND_DB_PROVIDER_REFUND_CONFLICT: "manual_review",
  REFUND_DB_LOCK_TIMEOUT: "retryable",
  REFUND_DB_CONNECTION_INTERRUPTED: "retryable",
  REFUND_DB_EVENT_LOG_WRITE_FAILED: "retryable",
  REFUND_DB_INVALID_STATE_TRANSITION: "terminal",
  REFUND_DB_METADATA_REDACTION_FAILED: "terminal",
} as const satisfies Record<
  RefundInboxRepositoryErrorCode,
  RefundInboxRepositoryErrorKind
>;

export const classifyRefundInboxRepositoryError = (
  code: string,
): RefundInboxRepositoryErrorKind =>
  refundInboxRepositoryErrorKinds[code as RefundInboxRepositoryErrorCode] ??
  "unknown";

export interface RefundInboxRepositoryContract {
  receiveNotification(
    input: ReceiveRefundNotificationInput,
  ): Promise<RefundInboxReceiveResult>;
  appendEvent(input: AppendRefundInboxEventInput): Promise<void>;
  markSignatureVerified(idempotencyKey: string): Promise<RefundInboxRecord>;
  markNormalized(idempotencyKey: string): Promise<RefundInboxRecord>;
  markGuardChecked(
    input: MarkRefundGuardCheckedInput,
  ): Promise<RefundInboxRecord>;
  markManualReviewRequired(
    input: MarkRefundManualReviewRequiredInput,
  ): Promise<RefundInboxRecord>;
  markRuntimeMutationBlocked(
    input: MarkRefundRuntimeMutationBlockedInput,
  ): Promise<RefundInboxRecord>;
  markProcessedForAuditOnly(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord>;
  markTerminalRejected(
    input: MarkRefundInboxFailedInput,
  ): Promise<RefundInboxRecord>;
  getByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord | null>;
  getByProviderRefundId(
    provider: string,
    providerRefundId: string,
  ): Promise<RefundInboxRecord[]>;
}
