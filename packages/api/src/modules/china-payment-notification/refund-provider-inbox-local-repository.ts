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
} from "./refund-inbox-repository-contract";

const nowIso = () => new Date().toISOString();

const stableRefundInboxRecordId = (idempotencyKey: string) =>
  `rinbox_${idempotencyKey.replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 56)}`;

const buildRecord = (
  input: ReceiveRefundNotificationInput,
): RefundInboxRecord => ({
  id: stableRefundInboxRecordId(input.envelope.idempotencyKey),
  provider: input.envelope.provider,
  eventId: input.envelope.eventId,
  eventType: input.envelope.eventType as "refund.succeeded" | "refund.failed",
  idempotencyKey: input.envelope.idempotencyKey,
  providerRefundId: input.envelope.providerRefundId ?? "",
  merchantOrderRef: input.envelope.merchantOrderRef,
  paymentSessionId: input.envelope.paymentSessionId,
  amountMinor: input.envelope.amount.value,
  currency: input.envelope.amount.currency,
  signatureStatus: input.envelope.signature.status,
  rawPayloadDigest: input.envelope.rawPayloadDigest,
  processingStatus: "received",
  retryCount: 0,
  createdAt: input.receivedAt,
  updatedAt: input.receivedAt,
});

const updateRecordState = (
  record: RefundInboxRecord,
  processingStatus: RefundInboxRecord["processingStatus"],
): RefundInboxRecord => ({
  ...record,
  processingStatus,
  updatedAt: nowIso(),
  processedAt:
    processingStatus === "processed_for_audit_only"
      ? nowIso()
      : record.processedAt,
});

export class InMemoryRefundProviderInboxRouteRepository
  implements RefundInboxRepositoryContract
{
  private readonly records = new Map<string, RefundInboxRecord>();
  private readonly events: AppendRefundInboxEventInput[] = [];

  async receiveNotification(
    input: ReceiveRefundNotificationInput,
  ): Promise<RefundInboxReceiveResult> {
    const existing = this.records.get(input.envelope.idempotencyKey);

    if (existing) {
      const sameDigest =
        existing.rawPayloadDigest === input.envelope.rawPayloadDigest;
      const record = updateRecordState(
        existing,
        sameDigest ? "duplicate_seen" : "digest_conflict_manual_review",
      );
      this.records.set(record.idempotencyKey, record);

      return {
        status: sameDigest
          ? "duplicate_same_digest"
          : "duplicate_digest_conflict",
        record,
        fixtureOnly: true,
        executable: false,
      };
    }

    const record = buildRecord(input);
    this.records.set(record.idempotencyKey, record);

    return {
      status: "received",
      record,
      fixtureOnly: true,
      executable: false,
    };
  }

  async appendEvent(input: AppendRefundInboxEventInput): Promise<void> {
    this.events.push(input);
  }

  async markSignatureVerified(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord> {
    return this.markState(idempotencyKey, "signature_verified");
  }

  async markNormalized(idempotencyKey: string): Promise<RefundInboxRecord> {
    return this.markState(idempotencyKey, "normalized");
  }

  async markGuardChecked(
    input: MarkRefundGuardCheckedInput,
  ): Promise<RefundInboxRecord> {
    return this.markState(input.idempotencyKey, "guard_checked");
  }

  async markManualReviewRequired(
    input: MarkRefundManualReviewRequiredInput,
  ): Promise<RefundInboxRecord> {
    return this.markState(
      input.idempotencyKey,
      "manual_review_required",
    );
  }

  async markRuntimeMutationBlocked(
    input: MarkRefundRuntimeMutationBlockedInput,
  ): Promise<RefundInboxRecord> {
    return this.markState(input.idempotencyKey, "runtime_mutation_blocked");
  }

  async markProcessedForAuditOnly(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord> {
    return this.markState(idempotencyKey, "processed_for_audit_only");
  }

  async markTerminalRejected(
    input: MarkRefundInboxFailedInput,
  ): Promise<RefundInboxRecord> {
    const record = await this.markState(
      input.idempotencyKey,
      "terminal_rejected",
    );

    return {
      ...record,
      lastErrorCode: input.errorCode,
      lastErrorMessage: input.errorMessage,
    };
  }

  async getByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord | null> {
    return this.records.get(idempotencyKey) ?? null;
  }

  async getByProviderRefundId(
    provider: string,
    providerRefundId: string,
  ): Promise<RefundInboxRecord[]> {
    return Array.from(this.records.values()).filter(
      (record) =>
        record.provider === provider &&
        record.providerRefundId === providerRefundId,
    );
  }

  private async markState(
    idempotencyKey: string,
    processingStatus: RefundInboxRecord["processingStatus"],
  ): Promise<RefundInboxRecord> {
    const record = this.records.get(idempotencyKey);

    if (!record) {
      throw new Error(`Refund inbox record not found: ${idempotencyKey}`);
    }

    const updated = updateRecordState(record, processingStatus);
    this.records.set(updated.idempotencyKey, updated);

    return updated;
  }
}
