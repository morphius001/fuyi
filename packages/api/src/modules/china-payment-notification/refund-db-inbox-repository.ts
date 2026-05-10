import { createHash } from "crypto";

import {
  AppendRefundInboxEventInput,
  MarkRefundGuardCheckedInput,
  MarkRefundInboxFailedInput,
  MarkRefundManualReviewRequiredInput,
  MarkRefundRuntimeMutationBlockedInput,
  ReceiveRefundNotificationInput,
  RefundInboxReceiveResult,
  RefundInboxRecord,
  RefundInboxRepositoryContract,
  classifyRefundInboxRepositoryError,
} from "./refund-inbox-repository-contract";
import { RefundInboxState } from "./refund-inbox-state-transition";

export type RefundInboxDbRow = {
  id: string;
  provider: string;
  eventId: string | null;
  eventType: "refund.succeeded" | "refund.failed";
  idempotencyKey: string;
  providerRefundId: string;
  merchantOrderRef: string;
  paymentSessionId: string | null;
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

export type RefundInboxDbEventLogRow = {
  id: string;
  inboxId: string;
  action: AppendRefundInboxEventInput["action"];
  actorType: AppendRefundInboxEventInput["actorType"];
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type RefundInboxDbTransaction = {
  insertInbox(row: RefundInboxDbRow): Promise<void>;
  updateInbox(
    idempotencyKey: string,
    patch: Partial<RefundInboxDbRow>,
  ): Promise<RefundInboxDbRow>;
  findInboxByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<RefundInboxDbRow | null>;
  findInboxByProviderRefundId(
    provider: string,
    providerRefundId: string,
  ): Promise<RefundInboxDbRow[]>;
  insertEventLog(row: RefundInboxDbEventLogRow): Promise<void>;
};

export type RefundInboxDbClient = {
  transaction<T>(
    handler: (transaction: RefundInboxDbTransaction) => Promise<T>,
  ): Promise<T>;
};

const metadataDeniedKeys = new Set([
  "providerRefundRequest",
  "refundStateMutation",
  "workflowCommand",
  "workflowExecution",
  "providerSdkRequest",
  "providerRequest",
  "rawProviderPayload",
  "rawPayload",
  "privateKey",
  "certificate",
  "apiV3Key",
  "apiV3Secret",
  "webhookSecret",
  "fullPhone",
  "identityNumber",
  "bankCardNumber",
  "fullAddress",
].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")));

const normalizeMetadataKey = (key: string): string =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

const stableId = (prefix: string, parts: string[]): string => {
  const sanitized = parts.join("_").replace(/[^a-zA-Z0-9]+/g, "_");
  const readable = sanitized.slice(0, 40).replace(/_+$/, "");
  const digest = createHash("sha256").update(sanitized).digest("hex").slice(0, 16);

  return `${prefix}_${readable}_${digest}`;
};

const nowIso = (): string => new Date().toISOString();

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
      .filter(([key]) => !metadataDeniedKeys.has(normalizeMetadataKey(key)))
      .map(([key, value]) => [key, sanitizeMetadataValue(value)]),
  );

const toInboxRow = (input: ReceiveRefundNotificationInput): RefundInboxDbRow => {
  const { envelope } = input;

  return {
    id: stableId("rinbox", [envelope.provider, envelope.idempotencyKey]),
    provider: envelope.provider,
    eventId: envelope.eventId || null,
    eventType: envelope.eventType as "refund.succeeded" | "refund.failed",
    idempotencyKey: envelope.idempotencyKey,
    providerRefundId: envelope.providerRefundId ?? "",
    merchantOrderRef: envelope.merchantOrderRef,
    paymentSessionId: envelope.paymentSessionId ?? null,
    amountMinor: envelope.amount.value,
    currency: envelope.amount.currency,
    signatureStatus: envelope.signature.status,
    rawPayloadDigest: envelope.rawPayloadDigest,
    processingStatus: "received",
    retryCount: 0,
    createdAt: input.receivedAt,
    updatedAt: input.receivedAt,
  };
};

const toInboxRecord = (row: RefundInboxDbRow): RefundInboxRecord => ({
  id: row.id,
  provider: row.provider,
  eventId: row.eventId ?? undefined,
  eventType: row.eventType,
  idempotencyKey: row.idempotencyKey,
  providerRefundId: row.providerRefundId,
  merchantOrderRef: row.merchantOrderRef,
  paymentSessionId: row.paymentSessionId ?? undefined,
  amountMinor: row.amountMinor,
  currency: row.currency,
  signatureStatus: row.signatureStatus,
  rawPayloadDigest: row.rawPayloadDigest,
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
    classifyRefundInboxRepositoryError(String(error.code)) === "duplicate"
  );
};

export class DbRefundInboxRepository
  implements RefundInboxRepositoryContract
{
  constructor(private readonly client: RefundInboxDbClient) {}

  async receiveNotification(
    input: ReceiveRefundNotificationInput,
  ): Promise<RefundInboxReceiveResult> {
    return this.client.transaction(async (transaction) => {
      const row = toInboxRow(input);

      try {
        await transaction.insertInbox(row);
      } catch (error) {
        if (!isUniqueConflict(error)) {
          throw error;
        }

        const existing = await transaction.findInboxByIdempotencyKey(
          row.idempotencyKey,
        );

        if (!existing) {
          throw error;
        }

        const sameDigest = existing.rawPayloadDigest === row.rawPayloadDigest;
        const status = sameDigest
          ? "duplicate_same_digest"
          : "duplicate_digest_conflict";
        const action = sameDigest
          ? "refund_notification_duplicate_seen"
          : "refund_notification_digest_conflict";

        await transaction.insertEventLog({
          id: stableId("rlog", [existing.id, action, nowIso()]),
          inboxId: existing.id,
          action,
          actorType: "provider",
          message: sameDigest
            ? "Duplicate refund notification replayed."
            : "Refund notification digest conflict detected.",
          metadata: sanitizeMetadata({
            idempotencyKey: row.idempotencyKey,
            incomingRawPayloadDigest: row.rawPayloadDigest,
            existingRawPayloadDigest: existing.rawPayloadDigest,
            ...input.sanitizedMetadata,
          }),
          createdAt: nowIso(),
        });

        return {
          status,
          record: {
            ...toInboxRecord(existing),
            processingStatus: sameDigest
              ? "duplicate_seen"
              : "digest_conflict_manual_review",
          },
          fixtureOnly: true,
          executable: false,
        };
      }

      await transaction.insertEventLog({
        id: stableId("rlog", [row.id, "refund_notification_received"]),
        inboxId: row.id,
        action: "refund_notification_received",
        actorType: "provider",
        message: "Refund notification received.",
        metadata: sanitizeMetadata({
          provider: row.provider,
          eventId: row.eventId,
          providerRefundId: row.providerRefundId,
          ...input.sanitizedMetadata,
        }),
        createdAt: nowIso(),
      });

      return {
        status: "received",
        record: toInboxRecord(row),
        fixtureOnly: true,
        executable: false,
      };
    });
  }

  async appendEvent(input: AppendRefundInboxEventInput): Promise<void> {
    await this.client.transaction(async (transaction) => {
      await transaction.insertEventLog({
        id: stableId("rlog", [input.inboxId, input.action, nowIso()]),
        inboxId: input.inboxId,
        action: input.action,
        actorType: input.actorType,
        message: input.message,
        metadata: sanitizeMetadata(input.metadata),
        createdAt: nowIso(),
      });
    });
  }

  async markSignatureVerified(idempotencyKey: string): Promise<RefundInboxRecord> {
    return this.updateState(
      idempotencyKey,
      "signature_verified",
      "refund_notification_verified",
      "Refund notification signature verified.",
    );
  }

  async markNormalized(idempotencyKey: string): Promise<RefundInboxRecord> {
    return this.updateState(
      idempotencyKey,
      "normalized",
      "refund_notification_normalized",
      "Refund notification normalized.",
    );
  }

  async markGuardChecked(
    input: MarkRefundGuardCheckedInput,
  ): Promise<RefundInboxRecord> {
    return this.updateState(
      input.idempotencyKey,
      "guard_checked",
      input.guardDecisionType === "manual_review_required"
        ? "refund_guard_manual_review_required"
        : "refund_runtime_mutation_blocked",
      "Refund guard checked without runtime mutation.",
      {
        guardDecisionType: input.guardDecisionType,
        blockCode: input.blockCode,
        ...input.metadata,
      },
    );
  }

  async markManualReviewRequired(
    input: MarkRefundManualReviewRequiredInput,
  ): Promise<RefundInboxRecord> {
    return this.updateState(
      input.idempotencyKey,
      "manual_review_required",
      "refund_guard_manual_review_required",
      "Refund manual review required.",
      {
        reasonCodes: input.reasonCodes,
        severity: input.severity,
        ...input.metadata,
      },
    );
  }

  async markRuntimeMutationBlocked(
    input: MarkRefundRuntimeMutationBlockedInput,
  ): Promise<RefundInboxRecord> {
    return this.updateState(
      input.idempotencyKey,
      "runtime_mutation_blocked",
      "refund_runtime_mutation_blocked",
      "Refund runtime mutation blocked.",
      {
        reason: input.reason,
        ...input.metadata,
      },
    );
  }

  async markProcessedForAuditOnly(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord> {
    return this.updateState(
      idempotencyKey,
      "processed_for_audit_only",
      "refund_runtime_mutation_blocked",
      "Refund inbox processed for audit only.",
      {
        processedAt: nowIso(),
      },
    );
  }

  async markTerminalRejected(
    input: MarkRefundInboxFailedInput,
  ): Promise<RefundInboxRecord> {
    return this.updateState(
      input.idempotencyKey,
      "terminal_rejected",
      "refund_runtime_mutation_blocked",
      "Refund inbox terminal rejected.",
      {
        errorCode: input.errorCode,
        errorMessage: input.errorMessage,
        ...input.metadata,
      },
    );
  }

  async getByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord | null> {
    return this.client.transaction(async (transaction) => {
      const row = await transaction.findInboxByIdempotencyKey(idempotencyKey);

      return row ? toInboxRecord(row) : null;
    });
  }

  async getByProviderRefundId(
    provider: string,
    providerRefundId: string,
  ): Promise<RefundInboxRecord[]> {
    return this.client.transaction(async (transaction) => {
      const rows = await transaction.findInboxByProviderRefundId(
        provider,
        providerRefundId,
      );

      return rows.map(toInboxRecord);
    });
  }

  private async updateState(
    idempotencyKey: string,
    processingStatus: RefundInboxState,
    action: AppendRefundInboxEventInput["action"],
    message: string,
    metadata: Record<string, unknown> = {},
  ): Promise<RefundInboxRecord> {
    return this.client.transaction(async (transaction) => {
      const patch: Partial<RefundInboxDbRow> = {
        processingStatus,
        updatedAt: nowIso(),
      };

      if (processingStatus === "processed_for_audit_only") {
        patch.processedAt = nowIso();
      }

      const updated = await transaction.updateInbox(idempotencyKey, patch);

      await transaction.insertEventLog({
        id: stableId("rlog", [updated.id, action, nowIso()]),
        inboxId: updated.id,
        action,
        actorType: "system_job",
        message,
        metadata: sanitizeMetadata({
          processingStatus,
          ...metadata,
        }),
        createdAt: nowIso(),
      });

      return toInboxRecord(updated);
    });
  }
}
