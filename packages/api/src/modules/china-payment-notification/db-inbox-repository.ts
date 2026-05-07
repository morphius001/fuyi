import {
  AppendPaymentNotificationEventInput,
  MarkPaymentNotificationFailedInput,
  PaymentNotificationInboxReceiveResult,
  PaymentNotificationInboxRepositoryContract,
  classifyPaymentNotificationRepositoryError,
} from "./inbox-repository-contract";
import {
  ChinaPaymentNotificationEnvelope,
  PaymentNotificationEventLogRecord,
  PaymentNotificationInboxRecord,
  PaymentNotificationProcessingStatus,
} from "./types";

export type PaymentNotificationDbInboxRow = {
  id: string;
  provider: string;
  eventId: string | null;
  eventType: string;
  idempotencyKey: string;
  merchantOrderRef: string;
  paymentSessionId: string | null;
  providerTransactionId: string | null;
  providerRefundId: string | null;
  amountValue: number;
  currency: "CNY";
  signatureStatus: string;
  rawPayloadDigest: string;
  processingStatus: PaymentNotificationProcessingStatus;
  retryCount: number;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  occurredAt?: string;
  receivedAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentNotificationDbEventLogRow = {
  id: string;
  inboxId: string;
  action: PaymentNotificationEventLogRecord["action"];
  actorType: PaymentNotificationEventLogRecord["actorType"];
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type PaymentNotificationDbTransaction = {
  insertInbox(row: PaymentNotificationDbInboxRow): Promise<void>;
  updateInbox(
    idempotencyKey: string,
    patch: Partial<PaymentNotificationDbInboxRow>,
  ): Promise<PaymentNotificationDbInboxRow>;
  findInboxByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<PaymentNotificationDbInboxRow | null>;
  insertEventLog(row: PaymentNotificationDbEventLogRow): Promise<void>;
};

export type PaymentNotificationDbClient = {
  transaction<T>(
    handler: (transaction: PaymentNotificationDbTransaction) => Promise<T>,
  ): Promise<T>;
};

const stableId = (prefix: string, parts: string[]): string => {
  return `${prefix}_${parts.join("_").replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 48)}`;
};

const nowIso = (): string => new Date().toISOString();

const toInboxRow = (
  envelope: ChinaPaymentNotificationEnvelope,
  processingStatus: PaymentNotificationProcessingStatus,
): PaymentNotificationDbInboxRow => {
  const now = envelope.receivedAt;

  return {
    id: stableId("pinbox", [envelope.provider, envelope.idempotencyKey]),
    provider: envelope.provider,
    eventId: envelope.eventId || null,
    eventType: envelope.eventType,
    idempotencyKey: envelope.idempotencyKey,
    merchantOrderRef: envelope.merchantOrderRef,
    paymentSessionId: envelope.paymentSessionId ?? null,
    providerTransactionId: envelope.providerTransactionId ?? null,
    providerRefundId: envelope.providerRefundId ?? null,
    amountValue: envelope.amount.value,
    currency: envelope.amount.currency,
    signatureStatus: envelope.signature.status,
    rawPayloadDigest: envelope.rawPayloadDigest,
    processingStatus,
    retryCount: 0,
    ...(processingStatus === "terminal_failed"
      ? {
          lastErrorCode: envelope.signature.failureCode ?? "SIGNATURE_NOT_VERIFIED",
          lastErrorMessage:
            envelope.signature.failureMessage ??
            "Payment notification signature was not verified.",
        }
      : {}),
    occurredAt: envelope.occurredAt,
    receivedAt: envelope.receivedAt,
    createdAt: now,
    updatedAt: now,
  };
};

const toInboxRecord = (
  row: PaymentNotificationDbInboxRow,
): PaymentNotificationInboxRecord => ({
  id: row.id,
  envelope: {
    provider: row.provider,
    eventId: row.eventId ?? "",
    eventType: row.eventType as ChinaPaymentNotificationEnvelope["eventType"],
    merchantOrderRef: row.merchantOrderRef,
    paymentSessionId: row.paymentSessionId ?? undefined,
    providerTransactionId: row.providerTransactionId ?? undefined,
    providerRefundId: row.providerRefundId ?? undefined,
    amount: {
      value: row.amountValue,
      currency: row.currency,
    },
    occurredAt: row.occurredAt,
    receivedAt: row.receivedAt,
    idempotencyKey: row.idempotencyKey,
    signature: {
      status: row.signatureStatus as ChinaPaymentNotificationEnvelope["signature"]["status"],
    },
    rawPayloadDigest: row.rawPayloadDigest,
    riskFlags: [],
  },
  processingStatus: row.processingStatus,
  retryCount: row.retryCount,
  lastErrorCode: row.lastErrorCode,
  lastErrorMessage: row.lastErrorMessage,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  processedAt: row.processedAt,
});

const isUniqueConflict = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  return (
    "code" in error &&
    classifyPaymentNotificationRepositoryError(String(error.code)) === "duplicate"
  );
};

export class DbPaymentNotificationInboxRepository
  implements PaymentNotificationInboxRepositoryContract
{
  constructor(private readonly client: PaymentNotificationDbClient) {}

  async receive(
    envelope: ChinaPaymentNotificationEnvelope,
  ): Promise<PaymentNotificationInboxReceiveResult> {
    return this.client.transaction(async (transaction) => {
      const status: PaymentNotificationProcessingStatus =
        envelope.signature.status === "verified" ? "verified" : "terminal_failed";
      const row = toInboxRow(envelope, status);

      try {
        await transaction.insertInbox(row);
      } catch (error) {
        if (!isUniqueConflict(error)) {
          throw error;
        }

        const existing = await transaction.findInboxByIdempotencyKey(
          envelope.idempotencyKey,
        );

        if (!existing) {
          throw error;
        }

        await transaction.insertEventLog({
          id: stableId("plog", [existing.id, "dedupe_hit", nowIso()]),
          inboxId: existing.id,
          action: "dedupe_hit",
          actorType: "system",
          message: "Duplicate payment notification replayed.",
          metadata: {
            idempotencyKey: envelope.idempotencyKey,
          },
          createdAt: nowIso(),
        });

        return {
          status: "duplicate",
          record: {
            ...toInboxRecord(existing),
            processingStatus: "ignored_duplicate",
          },
        };
      }

      await transaction.insertEventLog({
        id: stableId("plog", [row.id, "received"]),
        inboxId: row.id,
        action: "received",
        actorType: "provider",
        message: "Payment notification received.",
        metadata: {
          provider: envelope.provider,
          eventId: envelope.eventId,
        },
        createdAt: nowIso(),
      });

      await transaction.insertEventLog({
        id: stableId("plog", [row.id, status === "verified" ? "verified" : "failed"]),
        inboxId: row.id,
        action: status === "verified" ? "verified" : "failed",
        actorType: "system",
        message:
          status === "verified"
            ? "Payment notification verified."
            : "Payment notification rejected.",
        metadata: {
          signatureStatus: envelope.signature.status,
        },
        createdAt: nowIso(),
      });

      return {
        status: "received",
        record: toInboxRecord(row),
      };
    });
  }

  async appendEvent(input: AppendPaymentNotificationEventInput): Promise<void> {
    await this.client.transaction(async (transaction) => {
      await transaction.insertEventLog({
        id: stableId("plog", [input.inboxId, input.action, nowIso()]),
        inboxId: input.inboxId,
        action: input.action,
        actorType: input.actorType,
        message: input.message,
        metadata: input.metadata,
        createdAt: nowIso(),
      });
    });
  }

  async markProcessing(
    idempotencyKey: string,
  ): Promise<PaymentNotificationInboxRecord> {
    return this.updateStatus(idempotencyKey, "processing", "handler_started");
  }

  async markProcessed(
    idempotencyKey: string,
  ): Promise<PaymentNotificationInboxRecord> {
    return this.updateStatus(idempotencyKey, "processed", "processed", {
      processedAt: nowIso(),
    });
  }

  async markRetryableFailed(
    input: MarkPaymentNotificationFailedInput,
  ): Promise<PaymentNotificationInboxRecord> {
    return this.markFailed(input, "retryable_failed", "retry_scheduled");
  }

  async markTerminalFailed(
    input: MarkPaymentNotificationFailedInput,
  ): Promise<PaymentNotificationInboxRecord> {
    return this.markFailed(input, "terminal_failed", "failed");
  }

  async getByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<PaymentNotificationInboxRecord | null> {
    return this.client.transaction(async (transaction) => {
      const row = await transaction.findInboxByIdempotencyKey(idempotencyKey);

      return row ? toInboxRecord(row) : null;
    });
  }

  private async updateStatus(
    idempotencyKey: string,
    processingStatus: PaymentNotificationProcessingStatus,
    action: PaymentNotificationEventLogRecord["action"],
    extraPatch: Partial<PaymentNotificationDbInboxRow> = {},
  ): Promise<PaymentNotificationInboxRecord> {
    return this.client.transaction(async (transaction) => {
      const updated = await transaction.updateInbox(idempotencyKey, {
        processingStatus,
        updatedAt: nowIso(),
        ...extraPatch,
      });

      await transaction.insertEventLog({
        id: stableId("plog", [updated.id, action, nowIso()]),
        inboxId: updated.id,
        action,
        actorType: "system",
        message: `Payment notification ${processingStatus}.`,
        metadata: {
          processingStatus,
        },
        createdAt: nowIso(),
      });

      return toInboxRecord(updated);
    });
  }

  private async markFailed(
    input: MarkPaymentNotificationFailedInput,
    processingStatus: "retryable_failed" | "terminal_failed",
    action: "retry_scheduled" | "failed",
  ): Promise<PaymentNotificationInboxRecord> {
    return this.client.transaction(async (transaction) => {
      const current = await transaction.findInboxByIdempotencyKey(
        input.idempotencyKey,
      );
      const updated = await transaction.updateInbox(input.idempotencyKey, {
        processingStatus,
        retryCount:
          processingStatus === "retryable_failed"
            ? (current?.retryCount ?? 0) + 1
            : current?.retryCount ?? 0,
        lastErrorCode: input.errorCode,
        lastErrorMessage: input.errorMessage,
        updatedAt: nowIso(),
      });

      await transaction.insertEventLog({
        id: stableId("plog", [updated.id, action, nowIso()]),
        inboxId: updated.id,
        action,
        actorType: "system",
        message:
          processingStatus === "retryable_failed"
            ? "Payment notification retry scheduled."
            : "Payment notification terminal failure recorded.",
        metadata: {
          errorCode: input.errorCode,
          retryCount: updated.retryCount,
          ...input.metadata,
        },
        createdAt: nowIso(),
      });

      return toInboxRecord(updated);
    });
  }
}
