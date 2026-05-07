import {
  AppendPaymentNotificationEventInput,
  buildMockPaymentSignature,
  handleMockPaymentWebhookNotification,
  PaymentNotificationInboxRecord,
  PaymentNotificationInboxRepositoryContract,
  PaymentNotificationInboxReceiveResult,
} from "..";

const secret = "mock_handler_secret";
const receivedAt = "2026-05-07T16:00:00.000Z";
const payload = {
  event_id: "evt_mock_handler_001",
  event_type: "payment.succeeded",
  merchant_order_ref: "pay_mock_handler_001",
  payment_session_id: "payses_mock_handler_001",
  provider_transaction_id: "mock_txn_handler_001",
  amount: 128560,
  currency: "CNY",
} as const;
const rawBody = JSON.stringify(payload);

const runtimeEnabled = {
  CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
  CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_inbox_only",
  CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
};

const makeRecord = (): PaymentNotificationInboxRecord => ({
  id: "payment_notification_inbox_handler_001",
  envelope: expect.any(Object),
  processingStatus: "verified",
  retryCount: 0,
  createdAt: receivedAt,
  updatedAt: receivedAt,
});

const makeRepository = (): jest.Mocked<PaymentNotificationInboxRepositoryContract> => {
  return {
    receive: jest.fn(
      async (envelope): Promise<PaymentNotificationInboxReceiveResult> => ({
        status: "received",
        record: {
          ...makeRecord(),
          envelope,
        },
      }),
    ),
    appendEvent: jest.fn(
      async (_input: AppendPaymentNotificationEventInput) => undefined,
    ),
    markProcessing: jest.fn(),
    markProcessed: jest.fn(),
    markRetryableFailed: jest.fn(),
    markTerminalFailed: jest.fn(),
    getByIdempotencyKey: jest.fn(),
  };
};

const signedHeaders = () => ({
  "x-mock-payment-signature": buildMockPaymentSignature(rawBody, secret),
  "x-mock-payment-event-id": payload.event_id,
  "x-mock-payment-key-id": "mock_key_v1",
});

describe("handleMockPaymentWebhookNotification", () => {
  it("keeps disabled runtime from touching repository", async () => {
    const repository = makeRepository();
    const result = await handleMockPaymentWebhookNotification({
      runtimeConfigInput: {},
      rawBody,
      headers: signedHeaders(),
      secret,
      receivedAt,
      repository,
    });

    expect(result.response).toEqual({
      httpStatus: 503,
      body: {
        status: "disabled",
        code: "RUNTIME_DISABLED",
      },
    });
    expect(repository.receive).not.toHaveBeenCalled();
  });

  it("accepts mock inbox-only notifications through injected dependencies", async () => {
    const repository = makeRepository();
    const result = await handleMockPaymentWebhookNotification({
      runtimeConfigInput: runtimeEnabled,
      rawBody,
      headers: signedHeaders(),
      secret,
      receivedAt,
      repository,
    });

    expect(result.response).toEqual({
      httpStatus: 202,
      body: {
        status: "accepted",
        mode: "mock_inbox_only",
      },
    });
    expect(repository.receive).toHaveBeenCalledTimes(1);
    expect(result).not.toHaveProperty("workflowResult");
  });

  it("returns safe debug metadata without raw body, secret, or signature", async () => {
    const repository = makeRepository();
    const result = await handleMockPaymentWebhookNotification({
      runtimeConfigInput: runtimeEnabled,
      rawBody,
      headers: signedHeaders(),
      secret,
      receivedAt,
      repository,
    });

    expect(result.safeDebug).toEqual({
      receivedAt,
      hasRawBody: true,
      headerNames: [
        "x-mock-payment-event-id",
        "x-mock-payment-key-id",
        "x-mock-payment-signature",
      ],
      runtimeRequested: true,
    });
    expect(result.safeDebug).not.toHaveProperty("rawBody");
    expect(result.safeDebug).not.toHaveProperty("secret");
    expect(result.safeDebug).not.toHaveProperty("signature");
  });

  it("rejects missing signature before repository writes", async () => {
    const repository = makeRepository();
    const result = await handleMockPaymentWebhookNotification({
      runtimeConfigInput: runtimeEnabled,
      rawBody,
      headers: {},
      secret,
      receivedAt,
      repository,
    });

    expect(result.response.body).toEqual({
      status: "rejected",
      code: "SIGNATURE_MISSING",
    });
    expect(repository.receive).not.toHaveBeenCalled();
  });
});
