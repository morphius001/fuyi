import {
  ChinaPaymentNotificationEnvelope,
  MockChinaPaymentNotificationPayload,
  NormalizeMockPaymentNotificationInput,
} from "./types";
import {
  buildPaymentNotificationIdempotencyKey,
  digestRawPayload,
} from "./idempotency";
import { verifyMockPaymentSignature } from "./mock-signature-verifier";

const PROVIDER = "mock_china_pay";

const parsePayload = (rawBody: string): MockChinaPaymentNotificationPayload => {
  const parsed = JSON.parse(rawBody) as Partial<MockChinaPaymentNotificationPayload>;

  if (!parsed.event_type || typeof parsed.amount !== "number" || parsed.currency !== "CNY") {
    throw new Error("MOCK_PAYMENT_PAYLOAD_INVALID");
  }

  return parsed as MockChinaPaymentNotificationPayload;
};

const collectRiskFlags = (
  payload: MockChinaPaymentNotificationPayload,
  input: NormalizeMockPaymentNotificationInput,
): string[] => {
  const flags: string[] = [];

  if (!payload.merchant_order_ref) {
    flags.push("unknown_merchant_order_ref");
  }

  if (
    input.expectedAmount &&
    (input.expectedAmount.value !== payload.amount ||
      input.expectedAmount.currency !== payload.currency)
  ) {
    flags.push("amount_mismatch");
  }

  if (!payload.event_id && !payload.provider_transaction_id) {
    flags.push("weak_idempotency_source");
  }

  return flags;
};

export const normalizeMockPaymentNotification = (
  input: NormalizeMockPaymentNotificationInput,
): ChinaPaymentNotificationEnvelope => {
  const receivedAt = input.receivedAt ?? new Date().toISOString();
  const payload = parsePayload(input.rawBody);
  const signature = verifyMockPaymentSignature({
    rawBody: input.rawBody,
    headers: input.headers,
    secret: input.secret,
    receivedAt,
  });

  return {
    provider: PROVIDER,
    eventId:
      payload.event_id ??
      input.headers.eventId ??
      payload.provider_transaction_id ??
      "missing_event_id",
    eventType: payload.event_type,
    providerTransactionId: payload.provider_transaction_id,
    providerRefundId: payload.provider_refund_id,
    merchantOrderRef: payload.merchant_order_ref ?? "unknown",
    paymentSessionId: payload.payment_session_id,
    amount: {
      value: payload.amount,
      currency: payload.currency,
    },
    occurredAt: payload.occurred_at,
    receivedAt,
    idempotencyKey: buildPaymentNotificationIdempotencyKey(PROVIDER, payload),
    signature,
    rawPayloadDigest: digestRawPayload(input.rawBody),
    riskFlags: collectRiskFlags(payload, input),
  };
};
