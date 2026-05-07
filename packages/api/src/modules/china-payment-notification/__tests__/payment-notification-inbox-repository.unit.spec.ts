import {
  buildMockPaymentSignature,
  InMemoryPaymentNotificationInboxRepository,
  normalizeMockPaymentNotification,
} from "..";

const secret = "mock_test_secret";

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

describe("InMemoryPaymentNotificationInboxRepository", () => {
  it("receives verified notifications and records audit logs", () => {
    const repository = new InMemoryPaymentNotificationInboxRepository();
    const envelope = createEnvelope();
    const received = repository.receive(envelope);
    const logs = repository.listEventLogs(received.record.id);

    expect(received.replayed).toBe(false);
    expect(received.record).toMatchObject({
      processingStatus: "verified",
      retryCount: 0,
    });
    expect(logs.map((log) => log.action)).toEqual(["received", "verified"]);
    expect(received.record).not.toHaveProperty("paymentStateCommand");
    expect(received.record).not.toHaveProperty("orderStateCommand");
  });

  it("replays duplicate idempotency keys without creating another record", () => {
    const repository = new InMemoryPaymentNotificationInboxRepository();
    const envelope = createEnvelope();
    const first = repository.receive(envelope);
    const second = repository.receive(envelope);
    const saved = repository.getByIdempotencyKey(envelope.idempotencyKey);
    const logs = repository.listEventLogs(first.record.id);

    expect(second.replayed).toBe(true);
    expect(second.record.id).toBe(first.record.id);
    expect(second.record.processingStatus).toBe("ignored_duplicate");
    expect(saved?.id).toBe(first.record.id);
    expect(logs.map((log) => log.action)).toEqual([
      "received",
      "verified",
      "dedupe_hit",
    ]);
  });

  it("records retryable failures without mutating payment or order state", () => {
    const repository = new InMemoryPaymentNotificationInboxRepository();
    const envelope = createEnvelope();
    repository.receive(envelope);
    repository.markProcessing(envelope.idempotencyKey);
    const failed = repository.markRetryableFailed(
      envelope.idempotencyKey,
      "TEMPORARY_PROVIDER_TIMEOUT",
      "Provider timeout during mock handler.",
    );
    const logs = repository.listEventLogs(failed.id);

    expect(failed).toMatchObject({
      processingStatus: "retryable_failed",
      retryCount: 1,
      lastErrorCode: "TEMPORARY_PROVIDER_TIMEOUT",
    });
    expect(logs.map((log) => log.action)).toEqual([
      "received",
      "verified",
      "handler_started",
      "retry_scheduled",
    ]);
    expect(failed).not.toHaveProperty("paymentStateCommand");
    expect(failed).not.toHaveProperty("orderStateCommand");
  });

  it("stores invalid signatures as terminal failures", () => {
    const repository = new InMemoryPaymentNotificationInboxRepository();
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
    const received = repository.receive(envelope);
    const logs = repository.listEventLogs(received.record.id);

    expect(received.record).toMatchObject({
      processingStatus: "terminal_failed",
      lastErrorCode: "MOCK_SIGNATURE_INVALID",
    });
    expect(logs.map((log) => log.action)).toEqual(["received", "failed"]);
  });
});
