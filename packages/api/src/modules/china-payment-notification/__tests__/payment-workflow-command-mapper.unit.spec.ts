import {
  buildMockPaymentSignature,
  guardPaymentNotificationState,
  InMemoryPaymentNotificationInboxRepository,
  mapGuardResultToWorkflowCommand,
  normalizeMockPaymentNotification,
  PaymentNotificationStateGuardInput,
} from "..";

const secret = "mock_test_secret";

const createInput = (
  payloadOverrides: Record<string, unknown> = {},
  sessionOverrides: Record<string, unknown> = {},
): PaymentNotificationStateGuardInput => {
  const rawBody = JSON.stringify({
    event_id: "evt_mock_payment_succeeded_001",
    event_type: "payment.succeeded",
    merchant_order_ref: "pay_mock_001",
    payment_session_id: "payses_mock_001",
    provider_transaction_id: "mock_txn_001",
    amount: 128560,
    currency: "CNY",
    occurred_at: "2026-05-07T00:00:00.000Z",
    ...payloadOverrides,
  });
  const envelope = normalizeMockPaymentNotification({
    rawBody,
    secret,
    receivedAt: "2026-05-07T00:01:00.000Z",
    headers: {
      signature: buildMockPaymentSignature(rawBody, secret),
    },
  });
  const repository = new InMemoryPaymentNotificationInboxRepository();
  const { record } = repository.receive(envelope);

  return {
    envelope,
    inboxRecord: record,
    paymentSession: {
      id: "payses_mock_001",
      provider: "mock_china_pay",
      amount: {
        value: 128560,
        currency: "CNY",
      },
      status: "pending",
      fetchedAt: "2026-05-07T00:01:01.000Z",
      ...sessionOverrides,
    },
    order: {
      id: "order_mock_001",
      status: "pending",
      fetchedAt: "2026-05-07T00:01:01.000Z",
    },
  };
};

describe("mapGuardResultToWorkflowCommand", () => {
  it("maps allowed capture decisions to command DTOs without executing workflow", () => {
    const input = createInput();
    const guardResult = guardPaymentNotificationState(input);
    const decision = mapGuardResultToWorkflowCommand(guardResult, input);

    expect(decision).toMatchObject({
      executable: true,
      command: {
        type: "capture_payment",
        paymentSessionId: "payses_mock_001",
        orderId: "order_mock_001",
        amount: {
          value: 128560,
          currency: "CNY",
        },
      },
    });
    expect(decision).not.toHaveProperty("workflowResult");
    expect(decision).not.toHaveProperty("paymentStateMutation");
  });

  it("maps processed duplicate notifications to no-op commands", () => {
    const input = createInput();
    const guardResult = guardPaymentNotificationState({
      ...input,
      inboxRecord: {
        ...input.inboxRecord,
        processingStatus: "processed",
      },
    });
    const decision = mapGuardResultToWorkflowCommand(guardResult, input);

    expect(decision).toMatchObject({
      executable: true,
      command: {
        type: "no_op",
        idempotencyKey: input.envelope.idempotencyKey,
      },
    });
  });

  it("maps blocked guard results to audit-only decisions", () => {
    const input = createInput({}, { provider: "alipay" });
    const guardResult = guardPaymentNotificationState(input);
    const decision = mapGuardResultToWorkflowCommand(guardResult, input);

    expect(decision).toMatchObject({
      executable: false,
      blockType: "provider_mismatch",
      retryable: false,
      idempotencyKey: input.envelope.idempotencyKey,
      inboxId: input.inboxRecord.id,
    });
    expect(decision).not.toHaveProperty("command");
  });

  it("refuses executable workflow commands when snapshots are missing", () => {
    const input = createInput();
    const guardResult = guardPaymentNotificationState(input);
    const decision = mapGuardResultToWorkflowCommand(guardResult, {
      ...input,
      paymentSession: undefined,
    });

    expect(decision).toMatchObject({
      executable: false,
      blockType: "unknown_reference",
      retryable: true,
    });
  });
});
