import {
  buildMockPaymentSignature,
  createMockChinaPaymentProviderContract,
} from "..";

const provider = createMockChinaPaymentProviderContract();
const secret = "mock_provider_contract_secret";

const paymentInput = {
  merchantOrderRef: "pay_mock_provider_001",
  amount: {
    value: 128560,
    currency: "CNY",
  },
  subject: "三门海鲜市场 mock 支付单",
  notifyUrl: "https://example.test/china/payment-webhooks/mock",
  returnUrl: "https://example.test/cn/payment/pending",
} as const;

describe("mock China payment provider contract", () => {
  it("creates a deterministic mock payment request without secrets", () => {
    const result = provider.createPayment(paymentInput);
    const second = provider.createPayment(paymentInput);

    expect(result.provider).toBe("mock_china_pay");
    expect(result.providerPaymentId).toBe(second.providerPaymentId);
    expect(result.paymentUrl).toMatch(/^mock:\/\/china-pay\/payments\//);
    expect(result.qrCodeUrl).toMatch(/^mock:\/\/china-pay\/qr\//);
    expect(result.rawPayloadDigest).toMatch(/^sha256:/);
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(result).not.toHaveProperty("paymentStateCommand");
    expect(result).not.toHaveProperty("orderStateCommand");
  });

  it("refuses non-CNY or invalid amounts", () => {
    expect(() =>
      provider.createPayment({
        ...paymentInput,
        amount: {
          value: 100,
          currency: "USD" as "CNY",
        },
      }),
    ).toThrow("MOCK_CHINA_PAYMENT_AMOUNT_INVALID");

    expect(() =>
      provider.createPayment({
        ...paymentInput,
        amount: {
          value: 0,
          currency: "CNY",
        },
      }),
    ).toThrow("MOCK_CHINA_PAYMENT_AMOUNT_INVALID");
  });

  it("queries payment as pending without mutating state", () => {
    const created = provider.createPayment(paymentInput);
    const queried = provider.queryPayment({
      merchantOrderRef: paymentInput.merchantOrderRef,
      providerPaymentId: created.providerPaymentId,
    });

    expect(queried).toMatchObject({
      provider: "mock_china_pay",
      providerPaymentId: created.providerPaymentId,
      merchantOrderRef: paymentInput.merchantOrderRef,
      status: "pending",
    });
    expect(queried.rawPayloadDigest).toMatch(/^sha256:/);
    expect(queried).not.toHaveProperty("workflowCommand");
  });

  it("closes a mock payment as a contract result only", () => {
    const created = provider.createPayment(paymentInput);
    const closed = provider.closePayment({
      merchantOrderRef: paymentInput.merchantOrderRef,
      providerPaymentId: created.providerPaymentId,
      reason: "operator_cancelled",
    });

    expect(closed).toMatchObject({
      provider: "mock_china_pay",
      providerPaymentId: created.providerPaymentId,
      merchantOrderRef: paymentInput.merchantOrderRef,
      closed: true,
    });
    expect(closed).not.toHaveProperty("paymentStateCommand");
  });

  it("verifies and normalizes fake signed notifications", () => {
    const rawBody = JSON.stringify({
      event_id: "evt_mock_provider_001",
      event_type: "payment.succeeded",
      merchant_order_ref: paymentInput.merchantOrderRef,
      payment_session_id: "payses_mock_provider_001",
      provider_transaction_id: "mock_txn_provider_001",
      amount: paymentInput.amount.value,
      currency: "CNY",
      occurred_at: "2026-05-08T05:00:00.000Z",
    });
    const signature = buildMockPaymentSignature(rawBody, secret);

    const verification = provider.verifyNotification({
      rawBody,
      secret,
      headers: {
        signature,
        eventId: "evt_mock_provider_001",
      },
    });
    const envelope = provider.normalizeNotification({
      rawBody,
      secret,
      headers: {
        signature,
        eventId: "evt_mock_provider_001",
      },
    });

    expect(verification.status).toBe("verified");
    expect(envelope).toMatchObject({
      provider: "mock_china_pay",
      eventId: "evt_mock_provider_001",
      eventType: "payment.succeeded",
      merchantOrderRef: paymentInput.merchantOrderRef,
      amount: paymentInput.amount,
      signature: {
        status: "verified",
      },
    });
    expect(envelope.idempotencyKey).toBe(
      "payment_notify:mock_china_pay:evt_mock_provider_001",
    );
  });
});
