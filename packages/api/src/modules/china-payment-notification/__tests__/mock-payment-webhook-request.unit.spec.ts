import {
  buildMockPaymentSignature,
  mapMockPaymentWebhookRequestToNormalizeInput,
} from "..";

const secret = "mock_webhook_secret";
const payload = {
  event_id: "evt_mock_request_001",
  event_type: "payment.succeeded",
  merchant_order_ref: "pay_mock_request_001",
  provider_transaction_id: "mock_txn_request_001",
  amount: 9900,
  currency: "CNY",
};

const rawBody = JSON.stringify(payload);

describe("mapMockPaymentWebhookRequestToNormalizeInput", () => {
  it("maps route-like raw body and headers into normalizer input", () => {
    const signature = buildMockPaymentSignature(rawBody, secret);

    const decision = mapMockPaymentWebhookRequestToNormalizeInput({
      rawBody,
      secret,
      receivedAt: "2026-05-07T12:00:00.000Z",
      expectedAmount: {
        value: 9900,
        currency: "CNY",
      },
      headers: {
        "x-mock-payment-signature": signature,
        "x-mock-payment-event-id": "evt_mock_request_001",
        "x-mock-payment-timestamp": "2026-05-07T11:59:59.000Z",
        "x-mock-payment-key-id": "mock_key_v1",
      },
    });

    expect(decision).toEqual({
      accepted: true,
      normalizeInput: {
        rawBody,
        secret,
        receivedAt: "2026-05-07T12:00:00.000Z",
        expectedAmount: {
          value: 9900,
          currency: "CNY",
        },
        headers: {
          signature,
          eventId: "evt_mock_request_001",
          timestamp: "2026-05-07T11:59:59.000Z",
          keyId: "mock_key_v1",
        },
      },
    });
  });

  it("handles mixed-case headers and array values by taking the first non-empty value", () => {
    const signature = buildMockPaymentSignature(rawBody, secret);
    const decision = mapMockPaymentWebhookRequestToNormalizeInput({
      rawBody,
      secret,
      headers: {
        "X-Mock-Payment-Signature": ["", signature, "sha256=ignored"],
        "X-Event-Id": ["evt_from_header"],
      },
    });

    expect(decision).toMatchObject({
      accepted: true,
      normalizeInput: {
        headers: {
          signature,
          eventId: "evt_from_header",
        },
      },
    });
  });

  it("rejects missing raw body without exposing provider payload fields", () => {
    const decision = mapMockPaymentWebhookRequestToNormalizeInput({
      rawBody: " ",
      secret,
      receivedAt: "2026-05-07T12:00:00.000Z",
      headers: {
        "x-mock-payment-signature": "sha256=not-used",
      },
    });

    expect(decision).toEqual({
      accepted: false,
      code: "PAYLOAD_INVALID",
      reason: "Mock webhook raw body is missing.",
      safeMetadata: {
        receivedAt: "2026-05-07T12:00:00.000Z",
        headerNames: ["x-mock-payment-signature"],
      },
    });
    expect(decision).not.toHaveProperty("rawBody");
    expect(decision).not.toHaveProperty("providerTransactionId");
    expect(decision).not.toHaveProperty("paymentStateCommand");
  });

  it("rejects missing mock secret before normalization", () => {
    const decision = mapMockPaymentWebhookRequestToNormalizeInput({
      rawBody,
      secret: "",
      headers: {
        "x-mock-payment-signature": "sha256=not-used",
      },
    });

    expect(decision).toMatchObject({
      accepted: false,
      code: "PAYLOAD_INVALID",
      reason: "Mock webhook secret is missing.",
    });
  });

  it("rejects missing signature before payload normalization", () => {
    const decision = mapMockPaymentWebhookRequestToNormalizeInput({
      rawBody,
      secret,
      headers: {
        "x-mock-payment-event-id": "evt_mock_request_001",
      },
    });

    expect(decision).toEqual({
      accepted: false,
      code: "SIGNATURE_MISSING",
      reason: "Mock webhook signature header is missing.",
      safeMetadata: {
        receivedAt: undefined,
        headerNames: ["x-mock-payment-event-id"],
      },
    });
  });

  it("does not parse malformed payloads in the request contract layer", () => {
    const malformedRawBody = "{not-json";
    const signature = buildMockPaymentSignature(malformedRawBody, secret);

    const decision = mapMockPaymentWebhookRequestToNormalizeInput({
      rawBody: malformedRawBody,
      secret,
      headers: {
        signature,
      },
    });

    expect(decision).toMatchObject({
      accepted: true,
      normalizeInput: {
        rawBody: malformedRawBody,
        secret,
      },
    });
  });
});
