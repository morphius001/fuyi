import {
  buildMockPaymentSignature,
  composeMockPaymentWebhookInboxOnly,
  AppendPaymentNotificationEventInput,
  PaymentNotificationInboxRecord,
  PaymentNotificationInboxRepositoryContract,
  PaymentNotificationInboxReceiveResult,
} from "..";

const secret = "mock_composition_secret";
const receivedAt = "2026-05-07T15:00:00.000Z";
const payload = {
  event_id: "evt_mock_composition_001",
  event_type: "payment.succeeded",
  merchant_order_ref: "pay_mock_composition_001",
  payment_session_id: "payses_mock_composition_001",
  provider_transaction_id: "mock_txn_composition_001",
  amount: 128560,
  currency: "CNY",
  occurred_at: "2026-05-07T14:59:00.000Z",
} as const;

const runtimeEnabled = {
  CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
  CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_inbox_only",
  CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
};

const runtimePrepareCommand = {
  ...runtimeEnabled,
  CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_prepare_command",
};

const rawBody = JSON.stringify(payload);

const signedRequest = () => ({
  rawBody,
  secret,
  receivedAt,
  headers: {
    "x-mock-payment-signature": buildMockPaymentSignature(rawBody, secret),
    "x-mock-payment-event-id": payload.event_id,
    "x-mock-payment-key-id": "mock_key_v1",
  },
});

const makeRecord = (): PaymentNotificationInboxRecord => ({
  id: "payment_notification_inbox_mock_001",
  envelope: expect.any(Object),
  processingStatus: "verified",
  retryCount: 0,
  createdAt: receivedAt,
  updatedAt: receivedAt,
});

type TestRepository = PaymentNotificationInboxRepositoryContract & {
  receive: jest.Mock<
    Promise<PaymentNotificationInboxReceiveResult>,
    [Parameters<PaymentNotificationInboxRepositoryContract["receive"]>[0]]
  >;
  appendEvent: jest.Mock<
    Promise<void>,
    [AppendPaymentNotificationEventInput]
  >;
};

const makeRepository = (
  receiveResult: "received" | "duplicate" = "received",
): TestRepository => {
  const record = makeRecord();

  return {
    receive: jest.fn(
      async (envelope): Promise<PaymentNotificationInboxReceiveResult> => {
      const updatedRecord: PaymentNotificationInboxRecord = {
        ...record,
        envelope,
        processingStatus:
          receiveResult === "duplicate" ? "ignored_duplicate" : "verified",
      };

      if (receiveResult === "duplicate") {
        return {
          status: "duplicate",
          record: updatedRecord,
        };
      }

      return {
        status: "received",
        record: updatedRecord,
      };
    }),
    appendEvent: jest.fn(async (_input) => undefined),
    markProcessing: jest.fn(),
    markProcessed: jest.fn(),
    markRetryableFailed: jest.fn(),
    markTerminalFailed: jest.fn(),
    getByIdempotencyKey: jest.fn(),
  };
};

describe("composeMockPaymentWebhookInboxOnly", () => {
  it("returns disabled responses without parsing payload or writing repository", async () => {
    const repository = makeRepository();
    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: {},
      request: signedRequest(),
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

  it("maps request rejections before payload normalization", async () => {
    const repository = makeRepository();
    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimeEnabled,
      request: {
        rawBody,
        secret,
        headers: {},
      },
      repository,
    });

    expect(result.response).toEqual({
      httpStatus: 400,
      body: {
        status: "rejected",
        code: "SIGNATURE_MISSING",
      },
    });
    expect(repository.receive).not.toHaveBeenCalled();
  });

  it("maps malformed payloads without writing repository", async () => {
    const malformedRawBody = "{not-json";
    const repository = makeRepository();
    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimeEnabled,
      request: {
        rawBody: malformedRawBody,
        secret,
        headers: {
          signature: buildMockPaymentSignature(malformedRawBody, secret),
        },
      },
      repository,
    });

    expect(result.response.body).toEqual({
      status: "rejected",
      code: "PAYLOAD_INVALID",
    });
    expect(repository.receive).not.toHaveBeenCalled();
  });

  it("rejects invalid signatures before inbox writes", async () => {
    const repository = makeRepository();
    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimeEnabled,
      request: {
        rawBody,
        secret,
        headers: {
          signature: "sha256=bad",
        },
      },
      repository,
    });

    expect(result.response.body).toEqual({
      status: "rejected",
      code: "SIGNATURE_INVALID",
    });
    expect(result.envelope?.signature.status).toBe("invalid");
    expect(repository.receive).not.toHaveBeenCalled();
  });

  it("maps duplicate inbox replays to stable duplicate responses", async () => {
    const repository = makeRepository("duplicate");
    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimeEnabled,
      request: signedRequest(),
      repository,
    });

    expect(result.response).toEqual({
      httpStatus: 200,
      body: {
        status: "duplicate",
        mode: "mock_inbox_only",
      },
    });
    expect(repository.receive).toHaveBeenCalledTimes(1);
  });

  it("maps repository unique conflicts to duplicate responses", async () => {
    const repository = makeRepository();
    repository.receive.mockRejectedValueOnce(new Error("DB_UNIQUE_CONFLICT"));

    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimeEnabled,
      request: signedRequest(),
      repository,
    });

    expect(result.response).toEqual({
      httpStatus: 200,
      body: {
        status: "duplicate",
        mode: "mock_inbox_only",
      },
    });
  });

  it("maps repository retryable receive failures without throwing", async () => {
    const repository = makeRepository();
    repository.receive.mockRejectedValueOnce(new Error("DB_LOCK_TIMEOUT"));

    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimeEnabled,
      request: signedRequest(),
      repository,
    });

    expect(result.response).toEqual({
      httpStatus: 503,
      body: {
        status: "rejected",
        code: "INBOX_RETRYABLE",
      },
    });
  });

  it("accepts verified inbox-only notifications without preparing commands", async () => {
    const repository = makeRepository();
    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimeEnabled,
      request: signedRequest(),
      repository,
    });

    expect(result.response).toEqual({
      httpStatus: 202,
      body: {
        status: "accepted",
        mode: "mock_inbox_only",
      },
    });
    expect(result.commandDecision).toBeUndefined();
    expect(repository.appendEvent).not.toHaveBeenCalled();
  });

  it("records blocked guard decisions without executing workflow", async () => {
    const repository = makeRepository();
    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimePrepareCommand,
      request: signedRequest(),
      repository,
    });

    expect(result.response.body).toEqual({
      status: "accepted",
      mode: "mock_inbox_only",
    });
    expect(result.commandDecision).toMatchObject({
      executable: false,
      blockType: "unknown_reference",
    });
    expect(result.runtimeAdapterDecision).toMatchObject({
      decision: "workflow_command_input_rejected",
      executable: false,
      workflowExecutionAllowed: false,
    });
    expect(result.auditEvent).toMatchObject({
      action: "command_blocked",
    });
    expect(repository.appendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "command_blocked",
      }),
    );
  });

  it("prepares command DTOs without executing workflows", async () => {
    const repository = makeRepository();
    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimePrepareCommand,
      request: signedRequest(),
      repository,
      paymentSession: {
        id: "payses_mock_composition_001",
        provider: "mock_china_pay",
        sellerId: "seller_mock_composition_001",
        marketId: "market_mock_composition_001",
        amount: {
          value: 128560,
          currency: "CNY",
        },
        status: "pending",
        fetchedAt: receivedAt,
      },
      order: {
        id: "order_mock_composition_001",
        sellerId: "seller_mock_composition_001",
        marketId: "market_mock_composition_001",
        status: "pending",
        fetchedAt: receivedAt,
      },
    });

    expect(result.commandDecision).toMatchObject({
      executable: true,
      command: {
        type: "capture_payment",
        paymentSessionId: "payses_mock_composition_001",
        orderId: "order_mock_composition_001",
      },
    });
    expect(result.runtimeAdapterDecision).toMatchObject({
      decision: "workflow_command_disabled_recorded",
      executable: false,
      workflowCommandPrepared: true,
      workflowDryRunOnly: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      paymentStateMutationAllowed: false,
      orderStateMutationAllowed: false,
      commandCandidate: {
        originalCommandType: "capture_payment",
        paymentSessionId: "payses_mock_composition_001",
        orderId: "order_mock_composition_001",
      },
    });
    expect(result.auditEvent).toMatchObject({
      action: "command_prepared",
      metadata: {
        commandType: "capture_payment",
      },
    });
    expect(result).not.toHaveProperty("workflowResult");
    expect(repository.appendEvent).toHaveBeenCalledTimes(1);
  });

  it("maps audit append failures after command preparation without executing workflows", async () => {
    const repository = makeRepository();
    repository.appendEvent.mockRejectedValueOnce(
      new Error("DB_CONNECTION_INTERRUPTED"),
    );

    const result = await composeMockPaymentWebhookInboxOnly({
      runtimeConfigInput: runtimePrepareCommand,
      request: signedRequest(),
      repository,
      paymentSession: {
        id: "payses_mock_composition_001",
        provider: "mock_china_pay",
        sellerId: "seller_mock_composition_001",
        marketId: "market_mock_composition_001",
        amount: {
          value: 128560,
          currency: "CNY",
        },
        status: "pending",
        fetchedAt: receivedAt,
      },
      order: {
        id: "order_mock_composition_001",
        sellerId: "seller_mock_composition_001",
        marketId: "market_mock_composition_001",
        status: "pending",
        fetchedAt: receivedAt,
      },
    });

    expect(result.response).toEqual({
      httpStatus: 503,
      body: {
        status: "rejected",
        code: "INBOX_RETRYABLE",
      },
    });
    expect(result.commandDecision).toMatchObject({
      executable: true,
      command: {
        type: "capture_payment",
      },
    });
    expect(result.runtimeAdapterDecision).toMatchObject({
      decision: "workflow_command_disabled_recorded",
      executable: false,
      workflowCommandPrepared: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      commandCandidate: {
        originalCommandType: "capture_payment",
      },
    });
    expect(result).not.toHaveProperty("workflowResult");
  });
});
