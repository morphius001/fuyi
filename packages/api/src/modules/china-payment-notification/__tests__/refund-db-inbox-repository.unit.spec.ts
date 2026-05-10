import {
  DbRefundInboxRepository,
  RefundInboxDbEventLogRow,
  RefundInboxDbRow,
  RefundInboxDbTransaction,
  verifyRefundNotificationContract,
  normalizeRefundNotificationContract,
  refundFakeSucceededNotifyVector,
} from "..";

class MockRefundInboxDbTransaction implements RefundInboxDbTransaction {
  inboxRows = new Map<string, RefundInboxDbRow>();
  eventLogs: RefundInboxDbEventLogRow[] = [];

  constructor(private readonly failEventLog = false) {}

  async insertInbox(row: RefundInboxDbRow): Promise<void> {
    if (this.inboxRows.has(row.idempotencyKey)) {
      throw Object.assign(new Error("duplicate"), {
        code: "REFUND_DB_UNIQUE_CONFLICT",
      });
    }

    this.inboxRows.set(row.idempotencyKey, row);
  }

  async updateInbox(
    idempotencyKey: string,
    patch: Partial<RefundInboxDbRow>,
  ): Promise<RefundInboxDbRow> {
    const current = this.inboxRows.get(idempotencyKey);

    if (!current) {
      throw new Error("REFUND_INBOX_RECORD_NOT_FOUND");
    }

    const updated = {
      ...current,
      ...patch,
    };

    this.inboxRows.set(idempotencyKey, updated);

    return updated;
  }

  async findInboxByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<RefundInboxDbRow | null> {
    return this.inboxRows.get(idempotencyKey) ?? null;
  }

  async findInboxByProviderRefundId(
    provider: string,
    providerRefundId: string,
  ): Promise<RefundInboxDbRow[]> {
    return Array.from(this.inboxRows.values()).filter(
      (row) =>
        row.provider === provider && row.providerRefundId === providerRefundId,
    );
  }

  async insertEventLog(row: RefundInboxDbEventLogRow): Promise<void> {
    if (this.failEventLog) {
      throw new Error("REFUND_EVENT_LOG_INSERT_FAILED");
    }

    this.eventLogs.push(row);
  }
}

const createRepository = (
  transaction = new MockRefundInboxDbTransaction(),
) => {
  const client = {
    transaction: <T>(
      handler: (tx: RefundInboxDbTransaction) => Promise<T>,
    ) => handler(transaction),
  };

  return {
    transaction,
    repository: new DbRefundInboxRepository(client),
  };
};

const createReceiveInput = (overrides: Record<string, unknown> = {}) => {
  const rawBody = JSON.stringify({
    ...refundFakeSucceededNotifyVector.body,
    ...overrides,
  });
  const verification = verifyRefundNotificationContract({
    rawBody,
    expectedFakeSignature:
      "signature_fake_refund_only_001",
    receivedAt: "2026-05-10T00:01:00.000Z",
    headers: {
      signature: "signature_fake_refund_only_001",
      algorithm: "MOCK_SHA256",
      eventId: String(
        overrides.event_id ??
          refundFakeSucceededNotifyVector.body.event_id,
      ),
      provider: "mock_china_pay",
      keyId: "fake-key-001",
    },
  });
  const normalized = normalizeRefundNotificationContract({
    verification,
    body: {
      ...refundFakeSucceededNotifyVector.body,
      ...overrides,
    },
    expectedRequest: {
      provider: "mock_china_pay",
      refundRequestIdempotencyKey:
        refundFakeSucceededNotifyVector.body.refund_request_key,
      merchantOrderRef: "pay_mock_001",
      paymentSessionId: "payses_001",
      requestedAmountMinor: 128560,
      currency: "CNY",
      providerTransactionId: "mock_txn_001",
      providerRefundId: "refund_fake_001",
    },
  });

  if (!normalized.normalized) {
    throw new Error(normalized.failureCode);
  }

  return {
    envelope: normalized.envelope,
    receivedAt: "2026-05-10T00:01:00.000Z",
    sanitizedMetadata: {
      safeNote: "kept-for-audit",
      rawProviderPayload: "{raw-provider-payload}",
      privateKey: "BEGIN PRIVATE KEY",
      private_key: "BEGIN SNAKE PRIVATE KEY",
      raw_payload: "{snake-raw-payload}",
      RawPayload: "{case-raw-payload}",
      nested: {
        workflowCommand: {
          type: "refund_payment",
        },
        workflow_command: {
          type: "refund_payment_snake",
        },
        fullPhone: "13800000000",
        FULL_PHONE: "13900000000",
        safeNestedNote: "kept-nested",
      },
    },
  };
};

describe("DbRefundInboxRepository", () => {
  it("receives refund notifications with inbox and event log writes", async () => {
    const { repository, transaction } = createRepository();
    const result = await repository.receiveNotification(createReceiveInput());

    expect(result).toMatchObject({
      status: "received",
      fixtureOnly: true,
      executable: false,
    });
    expect(result.record.processingStatus).toBe("received");
    expect(transaction.inboxRows.size).toBe(1);
    expect(transaction.eventLogs.map((log) => log.action)).toEqual([
      "refund_notification_received",
    ]);
    const serialized = JSON.stringify(transaction.eventLogs[0].metadata);

    expect(serialized).toContain("kept-for-audit");
    expect(serialized).toContain("kept-nested");
    expect(serialized).not.toContain("raw-provider-payload");
    expect(serialized).not.toContain("snake-raw-payload");
    expect(serialized).not.toContain("case-raw-payload");
    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN SNAKE PRIVATE KEY");
    expect(serialized).not.toContain("workflowCommand");
    expect(serialized).not.toContain("workflow_command");
    expect(serialized).not.toContain("13800000000");
    expect(serialized).not.toContain("13900000000");
  });

  it("maps duplicate idempotency and same digest to duplicate same digest", async () => {
    const { repository, transaction } = createRepository();
    const input = createReceiveInput();

    await repository.receiveNotification(input);
    const duplicate = await repository.receiveNotification(input);

    expect(duplicate).toMatchObject({
      status: "duplicate_same_digest",
      fixtureOnly: true,
      executable: false,
    });
    expect(duplicate.record.processingStatus).toBe("duplicate_seen");
    expect(transaction.inboxRows.size).toBe(1);
    expect(transaction.eventLogs.map((log) => log.action)).toEqual([
      "refund_notification_received",
      "refund_notification_duplicate_seen",
    ]);
  });

  it("maps duplicate idempotency and different digest to manual review conflict", async () => {
    const { repository, transaction } = createRepository();
    const input = createReceiveInput();

    await repository.receiveNotification(input);
    const existing = transaction.inboxRows.get(input.envelope.idempotencyKey);

    if (!existing) {
      throw new Error("missing existing row");
    }

    transaction.inboxRows.set(input.envelope.idempotencyKey, {
      ...existing,
      rawPayloadDigest: "sha256:different_digest",
    });

    const duplicate = await repository.receiveNotification(input);

    expect(duplicate).toMatchObject({
      status: "duplicate_digest_conflict",
      fixtureOnly: true,
      executable: false,
    });
    expect(duplicate.record.processingStatus).toBe(
      "digest_conflict_manual_review",
    );
    expect(transaction.eventLogs.map((log) => log.action)).toContain(
      "refund_notification_digest_conflict",
    );
  });

  it("marks verified, normalized, manual review, runtime blocked, and audit-only states", async () => {
    const { repository, transaction } = createRepository();
    const input = createReceiveInput();

    await repository.receiveNotification(input);
    await repository.markSignatureVerified(input.envelope.idempotencyKey);
    await repository.markNormalized(input.envelope.idempotencyKey);
    await repository.markManualReviewRequired({
      idempotencyKey: input.envelope.idempotencyKey,
      reasonCodes: ["duplicate_digest_conflict"],
      severity: "critical",
    });
    await repository.markRuntimeMutationBlocked({
      idempotencyKey: input.envelope.idempotencyKey,
      reason: "settlement_or_payout_locked",
    });
    const processed = await repository.markProcessedForAuditOnly(
      input.envelope.idempotencyKey,
    );

    expect(processed.processingStatus).toBe("processed_for_audit_only");
    expect(transaction.eventLogs.map((log) => log.action)).toEqual([
      "refund_notification_received",
      "refund_notification_verified",
      "refund_notification_normalized",
      "refund_guard_manual_review_required",
      "refund_runtime_mutation_blocked",
      "refund_runtime_mutation_blocked",
    ]);
    expect(JSON.stringify(processed)).not.toContain("refund_state_mutated");
    expect(JSON.stringify(processed)).not.toContain("providerRefundRequest");
  });

  it("marks guard checked and terminal rejected without refund state mutation", async () => {
    const { repository, transaction } = createRepository();
    const input = createReceiveInput();

    await repository.receiveNotification(input);
    await repository.markGuardChecked({
      idempotencyKey: input.envelope.idempotencyKey,
      guardDecisionType: "blocked",
      blockCode: "REFUND_AMOUNT_EXCEEDS_CAPTURED",
    });
    const rejected = await repository.markTerminalRejected({
      idempotencyKey: input.envelope.idempotencyKey,
      errorCode: "REFUND_DB_INVALID_STATE_TRANSITION",
      errorMessage: "Invalid refund inbox transition.",
    });

    expect(rejected.processingStatus).toBe("terminal_rejected");
    expect(transaction.eventLogs.map((log) => log.action)).toEqual([
      "refund_notification_received",
      "refund_runtime_mutation_blocked",
      "refund_runtime_mutation_blocked",
    ]);
    expect(JSON.stringify(transaction.eventLogs)).not.toContain(
      "refund_workflow_executed",
    );
  });

  it("queries by idempotency key and provider refund id", async () => {
    const { repository } = createRepository();
    const input = createReceiveInput();

    await repository.receiveNotification(input);

    await expect(
      repository.getByIdempotencyKey(input.envelope.idempotencyKey),
    ).resolves.toMatchObject({
      idempotencyKey: input.envelope.idempotencyKey,
    });
    await expect(
      repository.getByProviderRefundId(
        input.envelope.provider,
        input.envelope.providerRefundId as string,
      ),
    ).resolves.toHaveLength(1);
  });

  it("does not hide event log write failures", async () => {
    const transaction = new MockRefundInboxDbTransaction(true);
    const repository = new DbRefundInboxRepository({
      transaction: (handler) => handler(transaction),
    });

    await expect(
      repository.receiveNotification(createReceiveInput()),
    ).rejects.toThrow("REFUND_EVENT_LOG_INSERT_FAILED");
  });
});
