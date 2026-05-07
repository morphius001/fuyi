import { createHash } from "crypto";

import {
  ChinaPaymentNotificationEnvelope,
  PaymentNotificationEventLogAction,
  PaymentNotificationEventLogRecord,
  PaymentNotificationInboxRecord,
  PaymentNotificationProcessingStatus,
  ReceivePaymentNotificationResult,
} from "./types";

const stableId = (prefix: string, parts: unknown[]): string => {
  const digest = createHash("sha256")
    .update(JSON.stringify(parts))
    .digest("hex")
    .slice(0, 16);

  return `${prefix}_${digest}`;
};

export class InMemoryPaymentNotificationInboxRepository {
  private readonly recordsByIdempotencyKey = new Map<
    string,
    PaymentNotificationInboxRecord
  >();
  private readonly logsByInboxId = new Map<string, PaymentNotificationEventLogRecord[]>();

  receive(
    envelope: ChinaPaymentNotificationEnvelope,
  ): ReceivePaymentNotificationResult {
    const existing = this.recordsByIdempotencyKey.get(envelope.idempotencyKey);

    if (existing) {
      this.appendLog(existing.id, "dedupe_hit", "system", "Duplicate notification replayed.", {
        idempotencyKey: envelope.idempotencyKey,
      });
      return {
        record: {
          ...existing,
          processingStatus: "ignored_duplicate",
        },
        replayed: true,
      };
    }

    const now = envelope.receivedAt;
    const status: PaymentNotificationProcessingStatus =
      envelope.signature.status === "verified" ? "verified" : "terminal_failed";
    const record: PaymentNotificationInboxRecord = {
      id: stableId("payment_notification_inbox", [
        envelope.provider,
        envelope.idempotencyKey,
      ]),
      envelope,
      processingStatus: status,
      retryCount: 0,
      ...(status === "terminal_failed"
        ? {
            lastErrorCode: envelope.signature.failureCode ?? "SIGNATURE_NOT_VERIFIED",
            lastErrorMessage:
              envelope.signature.failureMessage ??
              "Payment notification signature was not verified.",
          }
        : {}),
      createdAt: now,
      updatedAt: now,
    };

    this.recordsByIdempotencyKey.set(envelope.idempotencyKey, record);
    this.appendLog(record.id, "received", "provider", "Payment notification received.", {
      provider: envelope.provider,
      eventId: envelope.eventId,
    });

    if (status === "verified") {
      this.appendLog(record.id, "verified", "system", "Payment notification verified.", {
        signatureStatus: envelope.signature.status,
      });
    } else {
      this.appendLog(record.id, "failed", "system", "Payment notification rejected.", {
        signatureStatus: envelope.signature.status,
      });
    }

    return { record, replayed: false };
  }

  markProcessing(idempotencyKey: string): PaymentNotificationInboxRecord {
    return this.updateStatus(idempotencyKey, "processing", {
      action: "handler_started",
      message: "Payment notification handler started.",
    });
  }

  markProcessed(idempotencyKey: string): PaymentNotificationInboxRecord {
    const updated = this.updateStatus(idempotencyKey, "processed", {
      action: "processed",
      message: "Payment notification processed.",
    });

    return {
      ...updated,
      processedAt: updated.updatedAt,
    };
  }

  markRetryableFailed(
    idempotencyKey: string,
    errorCode: string,
    errorMessage: string,
  ): PaymentNotificationInboxRecord {
    const current = this.requireRecord(idempotencyKey);
    const updated: PaymentNotificationInboxRecord = {
      ...current,
      processingStatus: "retryable_failed",
      retryCount: current.retryCount + 1,
      lastErrorCode: errorCode,
      lastErrorMessage: errorMessage,
      updatedAt: new Date().toISOString(),
    };

    this.recordsByIdempotencyKey.set(idempotencyKey, updated);
    this.appendLog(updated.id, "retry_scheduled", "system", "Retry scheduled.", {
      errorCode,
      retryCount: updated.retryCount,
    });

    return updated;
  }

  getByIdempotencyKey(
    idempotencyKey: string,
  ): PaymentNotificationInboxRecord | undefined {
    return this.recordsByIdempotencyKey.get(idempotencyKey);
  }

  listEventLogs(inboxId: string): PaymentNotificationEventLogRecord[] {
    return [...(this.logsByInboxId.get(inboxId) ?? [])];
  }

  private updateStatus(
    idempotencyKey: string,
    processingStatus: PaymentNotificationProcessingStatus,
    log: {
      action: PaymentNotificationEventLogAction;
      message: string;
    },
  ): PaymentNotificationInboxRecord {
    const current = this.requireRecord(idempotencyKey);
    const updated: PaymentNotificationInboxRecord = {
      ...current,
      processingStatus,
      updatedAt: new Date().toISOString(),
    };

    this.recordsByIdempotencyKey.set(idempotencyKey, updated);
    this.appendLog(updated.id, log.action, "system", log.message, {
      processingStatus,
    });

    return updated;
  }

  private requireRecord(idempotencyKey: string): PaymentNotificationInboxRecord {
    const record = this.recordsByIdempotencyKey.get(idempotencyKey);

    if (!record) {
      throw new Error("PAYMENT_NOTIFICATION_INBOX_RECORD_NOT_FOUND");
    }

    return record;
  }

  private appendLog(
    inboxId: string,
    action: PaymentNotificationEventLogAction,
    actorType: PaymentNotificationEventLogRecord["actorType"],
    message: string,
    metadata: Record<string, unknown>,
  ): void {
    const createdAt = new Date().toISOString();
    const logs = this.logsByInboxId.get(inboxId) ?? [];
    const record: PaymentNotificationEventLogRecord = {
      id: stableId("payment_notification_event_log", [
        inboxId,
        action,
        logs.length,
      ]),
      inboxId,
      action,
      actorType,
      message,
      metadata,
      createdAt,
    };

    this.logsByInboxId.set(inboxId, [...logs, record]);
  }
}
