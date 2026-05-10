import {
  normalizeRefundNotificationContract,
  refundFakeFailedNotifyVector,
  refundFakeSucceededNotifyVector,
  verifyRefundNotificationContract,
} from "..";

const verification = verifyRefundNotificationContract({
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
});

const failedVerification = verifyRefundNotificationContract({
  rawBody: refundFakeFailedNotifyVector.rawBody,
  headers: {
    signature: "signature_fake_refund_only_001",
    algorithm: "MOCK_SHA256",
    eventId: refundFakeFailedNotifyVector.eventId,
    provider: "mock_china_pay",
    keyId: "refund_fake_key_001",
  },
  expectedFakeSignature: "signature_fake_refund_only_001",
  receivedAt: "2026-05-10T13:05:00+08:00",
});

const expectedRequest = {
  provider: "mock_china_pay" as const,
  refundRequestIdempotencyKey: refundFakeSucceededNotifyVector.body
    .refund_request_key,
  merchantOrderRef: "pay_mock_001",
  paymentSessionId: "payses_001",
  requestedAmountMinor: 128560,
  currency: "CNY" as const,
  providerTransactionId: "mock_txn_001",
  providerRefundId: "refund_fake_001",
};

const baseInput = {
  verification,
  body: refundFakeSucceededNotifyVector.body,
  expectedRequest,
};

describe("refund notification normalizer contract", () => {
  it("normalizes verified fake succeeded notifications without executing refund workflow", () => {
    const result = normalizeRefundNotificationContract(baseInput);

    expect(result).toMatchObject({
      normalized: true,
      refundRequestIdempotencyKey: refundFakeSucceededNotifyVector.body
        .refund_request_key,
      fixtureOnly: true,
      executable: false,
    });

    if (!result.normalized) {
      throw new Error("Expected normalized result");
    }

    expect(result.envelope).toMatchObject({
      provider: "mock_china_pay",
      eventId: "evt_refund_fake_succeeded_001",
      eventType: "refund.succeeded",
      providerTransactionId: "mock_txn_001",
      providerRefundId: "refund_fake_001",
      merchantOrderRef: "pay_mock_001",
      paymentSessionId: "payses_001",
      amount: {
        value: 128560,
        currency: "CNY",
      },
      idempotencyKey:
        "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
      rawPayloadDigest: refundFakeSucceededNotifyVector.rawPayloadDigest,
      riskFlags: [],
    });
    expect(result.envelope.signature.status).toBe("verified");
    expect(JSON.stringify(result)).not.toContain("refundStateMutation");
    expect(JSON.stringify(result)).not.toContain("createRefund");
    expect(result).not.toHaveProperty("providerRefundRequest");
  });

  it("normalizes verified fake failed notifications with the same non-executable boundary", () => {
    const result = normalizeRefundNotificationContract({
      verification: failedVerification,
      body: refundFakeFailedNotifyVector.body,
      expectedRequest: {
        ...expectedRequest,
        refundRequestIdempotencyKey: refundFakeFailedNotifyVector.body
          .refund_request_key,
        providerRefundId: "refund_fake_failed_001",
      },
    });

    expect(result).toMatchObject({
      normalized: true,
      fixtureOnly: true,
      executable: false,
    });

    if (!result.normalized) {
      throw new Error("Expected normalized failed refund notification");
    }

    expect(result.envelope).toMatchObject({
      eventId: "evt_refund_fake_failed_001",
      eventType: "refund.failed",
      providerRefundId: "refund_fake_failed_001",
      idempotencyKey:
        "refund_notify:mock_china_pay:evt_refund_fake_failed_001",
    });
  });

  it("blocks unverified notifications", () => {
    const result = normalizeRefundNotificationContract({
      ...baseInput,
      verification: {
        ...verification,
        verified: false,
        signatureStatus: "invalid",
        failureCode: "REFUND_NOTIFICATION_SIGNATURE_INVALID",
      },
    });

    expect(result).toMatchObject({
      normalized: false,
      failureCode: "REFUND_NOTIFICATION_VERIFICATION_NOT_ACCEPTED",
      riskFlags: ["invalid_signature"],
      fixtureOnly: true,
      executable: false,
    });
  });

  it("blocks unsupported event types", () => {
    const result = normalizeRefundNotificationContract({
      ...baseInput,
      body: {
        ...baseInput.body,
        event_type: "payment.succeeded" as "refund.succeeded",
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_EVENT_TYPE_UNSUPPORTED",
    );
  });

  it("blocks missing idempotency keys", () => {
    const { idempotencyKey: _idempotencyKey, ...withoutKey } = verification;
    const result = normalizeRefundNotificationContract({
      ...baseInput,
      verification: withoutKey,
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_IDEMPOTENCY_KEY_MISSING",
    );
  });

  it("blocks verifier event and idempotency keys that do not match the body", () => {
    const eventMismatch = normalizeRefundNotificationContract({
      ...baseInput,
      verification: {
        ...verification,
        eventId: "evt_refund_fake_other",
      },
    });
    const typeMismatch = normalizeRefundNotificationContract({
      ...baseInput,
      verification: {
        ...verification,
        eventType: "refund.failed",
      },
    });
    const keyMismatch = normalizeRefundNotificationContract({
      ...baseInput,
      verification: {
        ...verification,
        idempotencyKey: "refund_notify:mock_china_pay:evt_refund_fake_other",
      },
    });

    expect(eventMismatch).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_EVENT_ID_MISMATCH",
    );
    expect(typeMismatch).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_EVENT_TYPE_UNSUPPORTED",
    );
    expect(keyMismatch).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_IDEMPOTENCY_KEY_MISMATCH",
    );
  });

  it("blocks provider refund id mismatches", () => {
    const result = normalizeRefundNotificationContract({
      ...baseInput,
      expectedRequest: {
        ...expectedRequest,
        providerRefundId: "refund_fake_other",
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_PROVIDER_REFUND_ID_MISMATCH",
    );
  });

  it("blocks merchant order, payment session, and transaction mismatches", () => {
    const merchantOrderMismatch = normalizeRefundNotificationContract({
      ...baseInput,
      expectedRequest: {
        ...expectedRequest,
        merchantOrderRef: "pay_mock_other",
      },
    });
    const paymentSessionMismatch = normalizeRefundNotificationContract({
      ...baseInput,
      expectedRequest: {
        ...expectedRequest,
        paymentSessionId: "payses_other",
      },
    });
    const transactionMismatch = normalizeRefundNotificationContract({
      ...baseInput,
      expectedRequest: {
        ...expectedRequest,
        providerTransactionId: "mock_txn_other",
      },
    });

    expect(merchantOrderMismatch).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_MERCHANT_ORDER_MISMATCH",
    );
    expect(paymentSessionMismatch).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_PAYMENT_SESSION_MISMATCH",
    );
    expect(transactionMismatch).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_PROVIDER_TRANSACTION_MISMATCH",
    );
  });

  it("blocks non-CNY, invalid amount, and amount mismatches", () => {
    const nonCny = normalizeRefundNotificationContract({
      ...baseInput,
      body: {
        ...baseInput.body,
        currency: "USD" as "CNY",
      },
    });
    const invalidAmount = normalizeRefundNotificationContract({
      ...baseInput,
      body: {
        ...baseInput.body,
        amount: 0,
      },
    });
    const amountMismatch = normalizeRefundNotificationContract({
      ...baseInput,
      expectedRequest: {
        ...expectedRequest,
        requestedAmountMinor: 128561,
      },
    });

    expect(nonCny).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_CURRENCY_UNSUPPORTED",
    );
    expect(invalidAmount).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_AMOUNT_INVALID",
    );
    expect(amountMismatch).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_AMOUNT_MISMATCH",
    );
  });

  it("blocks missing required refund references", () => {
    const result = normalizeRefundNotificationContract({
      ...baseInput,
      body: {
        ...baseInput.body,
        provider_refund_id: "",
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty(
      "failureCode",
      "REFUND_NOTIFICATION_REFERENCE_MISSING",
    );
  });

  it("does not expose provider APIs, secrets, workflow calls, or refund state mutations", () => {
    const result = normalizeRefundNotificationContract(baseInput);
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN CERTIFICATE");
    expect(serialized).not.toContain("APIv3");
    expect(serialized).not.toContain("wechat_refund");
    expect(serialized).not.toContain("alipay_refund");
    expect(serialized).not.toContain("createRefund");
    expect(serialized).not.toContain("workflow_execution");
    expect(serialized).not.toContain("refundStateMutation");
    expect(result).not.toHaveProperty("providerRefundRequest");
  });
});
