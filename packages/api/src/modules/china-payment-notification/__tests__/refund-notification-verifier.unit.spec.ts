import {
  refundFakeFailedNotifyVector,
  refundFakeSucceededNotifyVector,
  verifyRefundNotificationContract,
} from "..";

const baseInput = {
  rawBody: refundFakeSucceededNotifyVector.rawBody,
  headers: {
    signature: "signature_fake_refund_only_001",
    algorithm: "MOCK_SHA256",
    eventId: refundFakeSucceededNotifyVector.eventId,
    provider: "mock_china_pay",
    keyId: "refund_fake_key_001",
  },
  expectedFakeSignature: "signature_fake_refund_only_001",
  receivedAt: "2026-05-10T13:00:00+08:00",
} as const;

describe("refund notification verifier contract", () => {
  it("verifies the fake succeeded refund notification without executable output", () => {
    const result = verifyRefundNotificationContract(baseInput);

    expect(result).toMatchObject({
      provider: "mock_china_pay",
      verified: true,
      signatureStatus: "verified",
      algorithm: "MOCK_SHA256",
      keyId: "refund_fake_key_001",
      eventId: "evt_refund_fake_succeeded_001",
      eventType: "refund.succeeded",
      providerRefundId: "refund_fake_001",
      idempotencyKey:
        "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
      rawPayloadDigest: refundFakeSucceededNotifyVector.rawPayloadDigest,
      fixtureOnly: true,
      executable: false,
    });
    expect(JSON.stringify(result)).not.toContain("refundStateMutation");
    expect(JSON.stringify(result)).not.toContain("providerRefundRequest");
    expect(result).not.toHaveProperty("envelope");
  });

  it("verifies the fake failed refund notification with the same fake-only boundary", () => {
    const result = verifyRefundNotificationContract({
      ...baseInput,
      rawBody: refundFakeFailedNotifyVector.rawBody,
      headers: {
        ...baseInput.headers,
        eventId: refundFakeFailedNotifyVector.eventId,
      },
    });

    expect(result).toMatchObject({
      verified: true,
      signatureStatus: "verified",
      eventId: "evt_refund_fake_failed_001",
      eventType: "refund.failed",
      providerRefundId: "refund_fake_failed_001",
      idempotencyKey:
        "refund_notify:mock_china_pay:evt_refund_fake_failed_001",
      fixtureOnly: true,
      executable: false,
    });
  });

  it("blocks missing signatures", () => {
    const result = verifyRefundNotificationContract({
      ...baseInput,
      headers: {
        ...baseInput.headers,
        signature: "",
      },
    });

    expect(result.verified).toBe(false);
    expect(result.signatureStatus).toBe("missing");
    expect(result.failureCode).toBe("REFUND_NOTIFICATION_SIGNATURE_MISSING");
    expect(result.executable).toBe(false);
  });

  it("blocks unsupported fake signature algorithms", () => {
    const result = verifyRefundNotificationContract({
      ...baseInput,
      headers: {
        ...baseInput.headers,
        algorithm: "RSA2",
      },
    });

    expect(result.signatureStatus).toBe("unsupported");
    expect(result.failureCode).toBe(
      "REFUND_NOTIFICATION_ALGORITHM_UNSUPPORTED",
    );
  });

  it("blocks fake signature mismatches", () => {
    const result = verifyRefundNotificationContract({
      ...baseInput,
      expectedFakeSignature: "signature_fake_refund_only_other",
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("REFUND_NOTIFICATION_SIGNATURE_INVALID");
  });

  it("blocks provider mismatches before any refund state mutation", () => {
    const result = verifyRefundNotificationContract({
      ...baseInput,
      headers: {
        ...baseInput.headers,
        provider: "alipay",
      },
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("REFUND_NOTIFICATION_PROVIDER_MISMATCH");
    expect(result).not.toHaveProperty("refundStateMutation");
  });

  it("blocks unsupported event types", () => {
    const result = verifyRefundNotificationContract({
      ...baseInput,
      rawBody: JSON.stringify({
        ...refundFakeSucceededNotifyVector.body,
        event_type: "payment.succeeded",
      }),
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe(
      "REFUND_NOTIFICATION_EVENT_TYPE_UNSUPPORTED",
    );
  });

  it("blocks missing provider refund ids", () => {
    const { provider_refund_id: _providerRefundId, ...body } =
      refundFakeSucceededNotifyVector.body;

    const result = verifyRefundNotificationContract({
      ...baseInput,
      rawBody: JSON.stringify(body),
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe(
      "REFUND_NOTIFICATION_PROVIDER_REFUND_ID_MISSING",
    );
  });

  it("blocks event id mismatches between fake header and body", () => {
    const result = verifyRefundNotificationContract({
      ...baseInput,
      headers: {
        ...baseInput.headers,
        eventId: "evt_refund_fake_other",
      },
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("REFUND_NOTIFICATION_EVENT_ID_MISMATCH");
  });

  it("blocks missing event ids before building idempotency keys", () => {
    const { event_id: _eventId, ...body } =
      refundFakeSucceededNotifyVector.body;

    const result = verifyRefundNotificationContract({
      ...baseInput,
      rawBody: JSON.stringify(body),
      headers: {
        ...baseInput.headers,
        eventId: undefined,
      },
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("REFUND_NOTIFICATION_EVENT_ID_MISSING");
    expect(result).not.toHaveProperty("idempotencyKey");
  });

  it("blocks non-CNY and invalid amount fixtures", () => {
    const nonCny = verifyRefundNotificationContract({
      ...baseInput,
      rawBody: JSON.stringify({
        ...refundFakeSucceededNotifyVector.body,
        currency: "USD",
      }),
    });
    const invalidAmount = verifyRefundNotificationContract({
      ...baseInput,
      rawBody: JSON.stringify({
        ...refundFakeSucceededNotifyVector.body,
        amount: 0,
      }),
    });

    expect(nonCny.failureCode).toBe(
      "REFUND_NOTIFICATION_CURRENCY_UNSUPPORTED",
    );
    expect(invalidAmount.failureCode).toBe(
      "REFUND_NOTIFICATION_AMOUNT_INVALID",
    );
  });

  it("blocks malformed raw bodies and never exposes secrets or provider API calls", () => {
    const result = verifyRefundNotificationContract({
      ...baseInput,
      rawBody: "{not-json",
    });
    const serialized = JSON.stringify(result);

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("REFUND_NOTIFICATION_RAW_BODY_INVALID");
    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN CERTIFICATE");
    expect(serialized).not.toContain("APIv3");
    expect(serialized).not.toContain("wechat_refund");
    expect(serialized).not.toContain("alipay_refund");
    expect(serialized).not.toContain("createRefund");
    expect(serialized).not.toContain("workflow_execution");
  });
});
