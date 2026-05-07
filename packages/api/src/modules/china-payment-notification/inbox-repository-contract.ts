import {
  ChinaPaymentNotificationEnvelope,
  PaymentNotificationEventLogAction,
  PaymentNotificationEventLogRecord,
  PaymentNotificationInboxRecord,
} from "./types";

export type PaymentNotificationInboxReceiveResult =
  | {
      status: "received";
      record: PaymentNotificationInboxRecord;
    }
  | {
      status: "duplicate";
      record: PaymentNotificationInboxRecord;
    };

export type AppendPaymentNotificationEventInput = {
  inboxId: string;
  action: PaymentNotificationEventLogAction;
  actorType: PaymentNotificationEventLogRecord["actorType"];
  message: string;
  metadata: Record<string, unknown>;
};

export type MarkPaymentNotificationFailedInput = {
  idempotencyKey: string;
  errorCode: PaymentNotificationRepositoryErrorCode | string;
  errorMessage: string;
  metadata?: Record<string, unknown>;
};

export type PaymentNotificationRepositoryErrorKind =
  | "terminal"
  | "retryable"
  | "duplicate"
  | "unknown";

export type PaymentNotificationRepositoryErrorCode =
  | "SIGNATURE_MISSING"
  | "SIGNATURE_INVALID"
  | "PAYLOAD_INVALID"
  | "CURRENCY_UNSUPPORTED"
  | "EVENT_TYPE_UNSUPPORTED"
  | "DB_UNIQUE_CONFLICT"
  | "DB_LOCK_TIMEOUT"
  | "DB_CONNECTION_INTERRUPTED";

export const paymentNotificationRepositoryErrorKinds = {
  SIGNATURE_MISSING: "terminal",
  SIGNATURE_INVALID: "terminal",
  PAYLOAD_INVALID: "terminal",
  CURRENCY_UNSUPPORTED: "terminal",
  EVENT_TYPE_UNSUPPORTED: "terminal",
  DB_UNIQUE_CONFLICT: "duplicate",
  DB_LOCK_TIMEOUT: "retryable",
  DB_CONNECTION_INTERRUPTED: "retryable",
} as const satisfies Record<
  PaymentNotificationRepositoryErrorCode,
  PaymentNotificationRepositoryErrorKind
>;

export const classifyPaymentNotificationRepositoryError = (
  code: string,
): PaymentNotificationRepositoryErrorKind => {
  return (
    paymentNotificationRepositoryErrorKinds[
      code as PaymentNotificationRepositoryErrorCode
    ] ?? "unknown"
  );
};

export interface PaymentNotificationInboxRepositoryContract {
  receive(
    envelope: ChinaPaymentNotificationEnvelope,
  ): Promise<PaymentNotificationInboxReceiveResult>;
  appendEvent(input: AppendPaymentNotificationEventInput): Promise<void>;
  markProcessing(idempotencyKey: string): Promise<PaymentNotificationInboxRecord>;
  markProcessed(idempotencyKey: string): Promise<PaymentNotificationInboxRecord>;
  markRetryableFailed(
    input: MarkPaymentNotificationFailedInput,
  ): Promise<PaymentNotificationInboxRecord>;
  markTerminalFailed(
    input: MarkPaymentNotificationFailedInput,
  ): Promise<PaymentNotificationInboxRecord>;
  getByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<PaymentNotificationInboxRecord | null>;
}
