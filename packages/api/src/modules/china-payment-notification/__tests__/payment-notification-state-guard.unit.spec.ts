import {
  buildMockPaymentSignature,
  guardPaymentNotificationState,
  InMemoryPaymentNotificationInboxRepository,
  normalizeMockPaymentNotification,
} from "..";

const secret = "mock_test_secret";

const createGuardInput = (
  payloadOverrides: Record<string, unknown> = {},
  sessionOverrides: Record<string, unknown> = {},
  orderOverrides: Record<string, unknown> = {},
) => {
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
      sellerId: "seller_mock_001",
      marketId: "market_mock_001",
      amount: {
        value: 128560,
        currency: "CNY" as const,
      },
      status: "pending" as const,
      fetchedAt: "2026-05-07T00:01:01.000Z",
      ...sessionOverrides,
    },
    order: {
      id: "order_mock_001",
      sellerId: "seller_mock_001",
      marketId: "market_mock_001",
      status: "pending" as const,
      fetchedAt: "2026-05-07T00:01:01.000Z",
      ...orderOverrides,
    },
  };
};

describe("guardPaymentNotificationState", () => {
  it("allows a verified matching payment success notification to capture", () => {
    const result = guardPaymentNotificationState(createGuardInput());

    expect(result).toMatchObject({
      allowed: true,
      commandType: "capture_payment",
    });
    expect(result).not.toHaveProperty("paymentStateMutation");
    expect(result).not.toHaveProperty("orderStateMutation");
  });

  it("turns processed duplicate notifications into no-op commands", () => {
    const input = createGuardInput();
    const result = guardPaymentNotificationState({
      ...input,
      inboxRecord: {
        ...input.inboxRecord,
        processingStatus: "processed",
      },
    });

    expect(result).toMatchObject({
      allowed: true,
      commandType: "no_op",
    });
  });

  it("blocks invalid signatures", () => {
    const rawBody = JSON.stringify({
      event_id: "evt_mock_invalid_001",
      event_type: "payment.succeeded",
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
    const repository = new InMemoryPaymentNotificationInboxRepository();
    const { record } = repository.receive(envelope);
    const result = guardPaymentNotificationState({
      envelope,
      inboxRecord: record,
      paymentSession: createGuardInput().paymentSession,
      order: createGuardInput().order,
    });

    expect(result).toMatchObject({
      allowed: false,
      blockType: "invalid_signature",
      retryable: false,
    });
  });

  it("blocks provider mismatches", () => {
    const result = guardPaymentNotificationState(
      createGuardInput({}, { provider: "alipay" }),
    );

    expect(result).toMatchObject({
      allowed: false,
      blockType: "provider_mismatch",
      retryable: false,
    });
  });

  it("blocks amount mismatches", () => {
    const result = guardPaymentNotificationState(
      createGuardInput({}, { amount: { value: 100, currency: "CNY" } }),
    );

    expect(result).toMatchObject({
      allowed: false,
      blockType: "amount_mismatch",
      retryable: false,
    });
  });

  it("blocks unknown references as retryable", () => {
    const input = createGuardInput();
    const result = guardPaymentNotificationState({
      ...input,
      paymentSession: undefined,
    });

    expect(result).toMatchObject({
      allowed: false,
      blockType: "unknown_reference",
      retryable: true,
    });
  });

  it("blocks terminal order states", () => {
    const result = guardPaymentNotificationState(
      createGuardInput({}, {}, { status: "canceled" }),
    );

    expect(result).toMatchObject({
      allowed: false,
      blockType: "state_conflict",
      retryable: false,
    });
  });

  it("blocks seller and market ownership mismatches", () => {
    expect(
      guardPaymentNotificationState(
        createGuardInput({}, { sellerId: "seller_other" }),
      ),
    ).toMatchObject({
      allowed: false,
      blockType: "seller_ownership_mismatch",
      retryable: false,
    });

    expect(
      guardPaymentNotificationState(
        createGuardInput({}, {}, { marketId: "market_other" }),
      ),
    ).toMatchObject({
      allowed: false,
      blockType: "market_ownership_mismatch",
      retryable: false,
    });
  });

  it("blocks incomplete seller and market ownership context", () => {
    expect(
      guardPaymentNotificationState(
        createGuardInput({}, { sellerId: undefined }),
      ),
    ).toMatchObject({
      allowed: false,
      blockType: "seller_ownership_mismatch",
      retryable: false,
      auditMetadata: {
        ownershipContextComplete: false,
      },
    });

    expect(
      guardPaymentNotificationState(
        createGuardInput({}, {}, { sellerId: undefined }),
      ),
    ).toMatchObject({
      allowed: false,
      blockType: "seller_ownership_mismatch",
      retryable: false,
      auditMetadata: {
        ownershipContextComplete: false,
      },
    });

    expect(
      guardPaymentNotificationState(
        createGuardInput({}, { marketId: undefined }),
      ),
    ).toMatchObject({
      allowed: false,
      blockType: "market_ownership_mismatch",
      retryable: false,
      auditMetadata: {
        ownershipContextComplete: false,
      },
    });

    expect(
      guardPaymentNotificationState(
        createGuardInput({}, {}, { marketId: undefined }),
      ),
    ).toMatchObject({
      allowed: false,
      blockType: "market_ownership_mismatch",
      retryable: false,
      auditMetadata: {
        ownershipContextComplete: false,
      },
    });
  });
});
