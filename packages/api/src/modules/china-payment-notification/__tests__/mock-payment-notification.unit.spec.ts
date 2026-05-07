import {
  buildMockPaymentSignature,
  normalizeMockPaymentNotification,
} from "..";

const secret = "mock_test_secret";

const stringify = (payload: Record<string, unknown>): string =>
  JSON.stringify(payload);

const validPayload = {
  event_id: "evt_mock_payment_succeeded_001",
  event_type: "payment.succeeded",
  merchant_order_ref: "pay_mock_001",
  payment_session_id: "payses_mock_001",
  provider_transaction_id: "mock_txn_001",
  amount: 128560,
  currency: "CNY",
  occurred_at: "2026-05-07T00:00:00.000Z",
} as const;

describe("mock China payment notification skeleton", () => {
  it("normalizes a valid fake signed payment notification", () => {
    const rawBody = stringify(validPayload);
    const envelope = normalizeMockPaymentNotification({
      rawBody,
      secret,
      receivedAt: "2026-05-07T00:01:00.000Z",
      headers: {
        signature: buildMockPaymentSignature(rawBody, secret),
        eventId: validPayload.event_id,
        keyId: "mock_key_v1",
      },
    });

    expect(envelope).toMatchObject({
      provider: "mock_china_pay",
      eventId: "evt_mock_payment_succeeded_001",
      eventType: "payment.succeeded",
      merchantOrderRef: "pay_mock_001",
      paymentSessionId: "payses_mock_001",
      amount: {
        value: 128560,
        currency: "CNY",
      },
      idempotencyKey:
        "payment_notify:mock_china_pay:evt_mock_payment_succeeded_001",
      signature: {
        status: "verified",
        keyId: "mock_key_v1",
      },
      riskFlags: [],
    });
    expect(envelope.rawPayloadDigest).toMatch(/^sha256:/);
  });

  it("keeps invalid signatures out of verified status without throwing", () => {
    const rawBody = stringify(validPayload);
    const envelope = normalizeMockPaymentNotification({
      rawBody,
      secret,
      headers: {
        signature: "sha256=bad",
      },
    });

    expect(envelope.signature).toMatchObject({
      status: "invalid",
      failureCode: "MOCK_SIGNATURE_INVALID",
    });
    expect(envelope.eventType).toBe("payment.succeeded");
  });

  it("marks missing signatures without entering verified status", () => {
    const rawBody = stringify(validPayload);
    const envelope = normalizeMockPaymentNotification({
      rawBody,
      secret,
      headers: {},
    });

    expect(envelope.signature).toMatchObject({
      status: "missing",
      failureCode: "MOCK_SIGNATURE_MISSING",
    });
    expect(envelope).not.toHaveProperty("paymentStateCommand");
    expect(envelope).not.toHaveProperty("orderStateCommand");
  });

  it("builds stable idempotency keys for duplicate provider events", () => {
    const rawBody = stringify(validPayload);
    const signature = buildMockPaymentSignature(rawBody, secret);
    const first = normalizeMockPaymentNotification({
      rawBody,
      secret,
      headers: { signature },
    });
    const second = normalizeMockPaymentNotification({
      rawBody,
      secret,
      headers: { signature },
    });

    expect(first.idempotencyKey).toBe(second.idempotencyKey);
  });

  it("uses event type in fallback idempotency keys", () => {
    const succeededRawBody = stringify({
      ...validPayload,
      event_id: undefined,
      event_type: "payment.succeeded",
    });
    const closedRawBody = stringify({
      ...validPayload,
      event_id: undefined,
      event_type: "payment.closed",
    });
    const succeeded = normalizeMockPaymentNotification({
      rawBody: succeededRawBody,
      secret,
      headers: {
        signature: buildMockPaymentSignature(succeededRawBody, secret),
      },
    });
    const closed = normalizeMockPaymentNotification({
      rawBody: closedRawBody,
      secret,
      headers: {
        signature: buildMockPaymentSignature(closedRawBody, secret),
      },
    });

    expect(succeeded.idempotencyKey).not.toBe(closed.idempotencyKey);
    expect(succeeded.idempotencyKey).toContain("payment.succeeded");
    expect(closed.idempotencyKey).toContain("payment.closed");
  });

  it("flags amount mismatches without mutating payment or order state", () => {
    const rawBody = stringify(validPayload);
    const envelope = normalizeMockPaymentNotification({
      rawBody,
      secret,
      expectedAmount: {
        value: 100,
        currency: "CNY",
      },
      headers: {
        signature: buildMockPaymentSignature(rawBody, secret),
      },
    });

    expect(envelope.riskFlags).toContain("amount_mismatch");
    expect(envelope).not.toHaveProperty("paymentStateCommand");
    expect(envelope).not.toHaveProperty("orderStateCommand");
  });

  it("flags unknown merchant order references for later handler review", () => {
    const rawBody = stringify({
      ...validPayload,
      merchant_order_ref: undefined,
    });
    const envelope = normalizeMockPaymentNotification({
      rawBody,
      secret,
      headers: {
        signature: buildMockPaymentSignature(rawBody, secret),
      },
    });

    expect(envelope.merchantOrderRef).toBe("unknown");
    expect(envelope.riskFlags).toContain("unknown_merchant_order_ref");
  });

  it("rejects malformed JSON payloads before normalization", () => {
    expect(() =>
      normalizeMockPaymentNotification({
        rawBody: "{not-json",
        secret,
        headers: {
          signature: "sha256=bad",
        },
      }),
    ).toThrow();
  });

  it("rejects non-CNY payloads before building a trusted envelope", () => {
    const rawBody = stringify({
      ...validPayload,
      currency: "USD",
    });

    expect(() =>
      normalizeMockPaymentNotification({
        rawBody,
        secret,
        headers: {
          signature: buildMockPaymentSignature(rawBody, secret),
        },
      }),
    ).toThrow("MOCK_PAYMENT_PAYLOAD_INVALID");
  });

  it("flags weak idempotency sources when no event or transaction id exists", () => {
    const rawBody = stringify({
      ...validPayload,
      event_id: undefined,
      provider_transaction_id: undefined,
    });
    const envelope = normalizeMockPaymentNotification({
      rawBody,
      secret,
      headers: {
        signature: buildMockPaymentSignature(rawBody, secret),
      },
    });

    expect(envelope.eventId).toBe("missing_event_id");
    expect(envelope.idempotencyKey).toContain("missing_transaction");
    expect(envelope.riskFlags).toContain("weak_idempotency_source");
  });
});
