import {
  buildMockPaymentSignature,
  DbPaymentNotificationInboxRepository,
  PaymentNotificationDbEventLogRow,
  PaymentNotificationDbInboxRow,
  PaymentNotificationDbTransaction,
  normalizeMockPaymentNotification,
} from "..";

const secret = "mock_test_secret";

class MockPaymentNotificationDbTransaction
  implements PaymentNotificationDbTransaction
{
  inboxRows = new Map<string, PaymentNotificationDbInboxRow>();
  eventLogs: PaymentNotificationDbEventLogRow[] = [];

  constructor(private readonly failEventLog = false) {}

  async insertInbox(row: PaymentNotificationDbInboxRow): Promise<void> {
    if (this.inboxRows.has(row.idempotencyKey)) {
      throw Object.assign(new Error("duplicate"), {
        code: "DB_UNIQUE_CONFLICT",
      });
    }

    this.inboxRows.set(row.idempotencyKey, row);
  }

  async updateInbox(
    idempotencyKey: string,
    patch: Partial<PaymentNotificationDbInboxRow>,
  ): Promise<PaymentNotificationDbInboxRow> {
    const current = this.inboxRows.get(idempotencyKey);

    if (!current) {
      throw new Error("PAYMENT_NOTIFICATION_INBOX_RECORD_NOT_FOUND");
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
  ): Promise<PaymentNotificationDbInboxRow | null> {
    return this.inboxRows.get(idempotencyKey) ?? null;
  }

  async insertEventLog(row: PaymentNotificationDbEventLogRow): Promise<void> {
    if (this.failEventLog) {
      throw new Error("EVENT_LOG_INSERT_FAILED");
    }

    this.eventLogs.push(row);
  }
}

const createRepository = (
  transaction = new MockPaymentNotificationDbTransaction(),
) => {
  const client = {
    transaction: <T>(
      handler: (tx: PaymentNotificationDbTransaction) => Promise<T>,
    ) => handler(transaction),
  };

  return {
    transaction,
    repository: new DbPaymentNotificationInboxRepository(client),
  };
};

const createEnvelope = (overrides: Record<string, unknown> = {}) => {
  const rawBody = JSON.stringify({
    event_id: "evt_mock_payment_succeeded_001",
    event_type: "payment.succeeded",
    merchant_order_ref: "pay_mock_001",
    payment_session_id: "payses_mock_001",
    provider_transaction_id: "mock_txn_001",
    amount: 128560,
    currency: "CNY",
    occurred_at: "2026-05-07T00:00:00.000Z",
    ...overrides,
  });

  return normalizeMockPaymentNotification({
    rawBody,
    secret,
    receivedAt: "2026-05-07T00:01:00.000Z",
    headers: {
      signature: buildMockPaymentSignature(rawBody, secret),
    },
  });
};

describe("DbPaymentNotificationInboxRepository", () => {
  it("receives verified notifications with inbox and event log writes", async () => {
    const { repository, transaction } = createRepository();
    const envelope = createEnvelope();
    const result = await repository.receive(envelope);

    expect(result.status).toBe("received");
    expect(result.record.processingStatus).toBe("verified");
    expect(transaction.inboxRows.size).toBe(1);
    expect(transaction.eventLogs.map((log) => log.action)).toEqual([
      "received",
      "verified",
    ]);
    expect(new Set(transaction.eventLogs.map((log) => log.id)).size).toBe(2);
    expect(transaction.eventLogs.every((log) => log.id.length < 80)).toBe(true);
    expect(transaction.eventLogs[0].metadata).not.toHaveProperty("rawPayload");
    expect(transaction.eventLogs[0].metadata).not.toHaveProperty("signature");
    expect(transaction.eventLogs[0].metadata).not.toHaveProperty("secret");
  });

  it("maps duplicate idempotency writes to duplicate results and dedupe logs", async () => {
    const { repository, transaction } = createRepository();
    const envelope = createEnvelope();

    await repository.receive(envelope);
    const duplicate = await repository.receive(envelope);

    expect(duplicate.status).toBe("duplicate");
    expect(duplicate.record.processingStatus).toBe("ignored_duplicate");
    expect(transaction.inboxRows.size).toBe(1);
    expect(transaction.eventLogs.map((log) => log.action)).toEqual([
      "received",
      "verified",
      "dedupe_hit",
    ]);
  });

  it("stores invalid signatures as terminal failures with failed event logs", async () => {
    const { repository, transaction } = createRepository();
    const rawBody = JSON.stringify({
      event_id: "evt_mock_invalid_001",
      event_type: "payment.failed",
      merchant_order_ref: "pay_mock_001",
      amount: 128560,
      currency: "CNY",
    });
    const envelope = normalizeMockPaymentNotification({
      rawBody,
      secret,
      headers: {
        signature: "sha256=invalid",
      },
    });

    const result = await repository.receive(envelope);

    expect(result.record.processingStatus).toBe("terminal_failed");
    expect(result.record.lastErrorCode).toBe("MOCK_SIGNATURE_INVALID");
    expect(transaction.eventLogs.map((log) => log.action)).toEqual([
      "received",
      "failed",
    ]);
  });

  it("marks retryable failures with retry counters and retry event logs", async () => {
    const { repository, transaction } = createRepository();
    const envelope = createEnvelope();

    await repository.receive(envelope);
    const failed = await repository.markRetryableFailed({
      idempotencyKey: envelope.idempotencyKey,
      errorCode: "DB_LOCK_TIMEOUT",
      errorMessage: "Mock lock timeout.",
    });

    expect(failed.processingStatus).toBe("retryable_failed");
    expect(failed.retryCount).toBe(1);
    expect(transaction.eventLogs.map((log) => log.action)).toContain(
      "retry_scheduled",
    );
  });

  it("does not hide event log write failures", async () => {
    const transaction = new MockPaymentNotificationDbTransaction(true);
    const repository = new DbPaymentNotificationInboxRepository({
      transaction: (handler) => handler(transaction),
    });

    await expect(repository.receive(createEnvelope())).rejects.toThrow(
      "EVENT_LOG_INSERT_FAILED",
    );
  });
});
