import { ChinaPaymentNotificationEnvelope } from "./types";
import { RefundFakeNotificationBody } from "./refund-notification-test-vectors";
import { RefundNotificationVerifierContractResult } from "./refund-notification-verifier";

export type RefundNotificationNormalizerFailureCode =
  | "REFUND_NOTIFICATION_VERIFICATION_NOT_ACCEPTED"
  | "REFUND_NOTIFICATION_PROVIDER_MISMATCH"
  | "REFUND_NOTIFICATION_EVENT_ID_MISMATCH"
  | "REFUND_NOTIFICATION_EVENT_TYPE_UNSUPPORTED"
  | "REFUND_NOTIFICATION_IDEMPOTENCY_KEY_MISSING"
  | "REFUND_NOTIFICATION_IDEMPOTENCY_KEY_MISMATCH"
  | "REFUND_NOTIFICATION_REFERENCE_MISSING"
  | "REFUND_NOTIFICATION_PROVIDER_REFUND_ID_MISMATCH"
  | "REFUND_NOTIFICATION_MERCHANT_ORDER_MISMATCH"
  | "REFUND_NOTIFICATION_PAYMENT_SESSION_MISMATCH"
  | "REFUND_NOTIFICATION_PROVIDER_TRANSACTION_MISMATCH"
  | "REFUND_NOTIFICATION_CURRENCY_UNSUPPORTED"
  | "REFUND_NOTIFICATION_AMOUNT_INVALID"
  | "REFUND_NOTIFICATION_AMOUNT_MISMATCH";

export type RefundNotificationExpectedRequestContext = {
  provider: "mock_china_pay";
  refundRequestIdempotencyKey: string;
  merchantOrderRef: string;
  paymentSessionId: string;
  requestedAmountMinor: number;
  currency: "CNY";
  providerTransactionId?: string;
  providerRefundId: string;
};

export type RefundNotificationNormalizerContractInput = {
  verification: RefundNotificationVerifierContractResult;
  body: RefundFakeNotificationBody;
  expectedRequest: RefundNotificationExpectedRequestContext;
};

export type RefundNotificationNormalizerContractResult =
  | {
      normalized: true;
      envelope: ChinaPaymentNotificationEnvelope;
      refundRequestIdempotencyKey: string;
      fixtureOnly: true;
      executable: false;
    }
  | {
      normalized: false;
      provider: "mock_china_pay";
      failureCode: RefundNotificationNormalizerFailureCode;
      failureMessage: string;
      riskFlags: string[];
      fixtureOnly: true;
      executable: false;
    };

const supportedRefundEventTypes = ["refund.succeeded", "refund.failed"];

const buildRefundNotifyIdempotencyKey = (
  provider: "mock_china_pay",
  eventId: string,
): string => `refund_notify:${provider}:${eventId}`;

const failed = (
  failureCode: RefundNotificationNormalizerFailureCode,
  failureMessage: string,
  riskFlags: string[],
): RefundNotificationNormalizerContractResult => ({
  normalized: false,
  provider: "mock_china_pay",
  failureCode,
  failureMessage,
  riskFlags,
  fixtureOnly: true,
  executable: false,
});

export const normalizeRefundNotificationContract = (
  input: RefundNotificationNormalizerContractInput,
): RefundNotificationNormalizerContractResult => {
  const { verification, body, expectedRequest } = input;

  if (!verification.verified || verification.signatureStatus !== "verified") {
    return failed(
      "REFUND_NOTIFICATION_VERIFICATION_NOT_ACCEPTED",
      "Refund notification verification result is not accepted.",
      ["invalid_signature"],
    );
  }

  if (
    body.provider !== expectedRequest.provider ||
    verification.provider !== expectedRequest.provider
  ) {
    return failed(
      "REFUND_NOTIFICATION_PROVIDER_MISMATCH",
      "Refund notification provider does not match the expected fake provider.",
      ["provider_mismatch"],
    );
  }

  if (!supportedRefundEventTypes.includes(body.event_type)) {
    return failed(
      "REFUND_NOTIFICATION_EVENT_TYPE_UNSUPPORTED",
      "Refund notification event type cannot be normalized as a refund event.",
      ["unsupported_refund_event_type"],
    );
  }

  if (verification.eventId !== body.event_id) {
    return failed(
      "REFUND_NOTIFICATION_EVENT_ID_MISMATCH",
      "Refund notification verification event id does not match the body.",
      ["event_id_mismatch"],
    );
  }

  if (verification.eventType !== body.event_type) {
    return failed(
      "REFUND_NOTIFICATION_EVENT_TYPE_UNSUPPORTED",
      "Refund notification verification event type does not match the body.",
      ["event_type_mismatch"],
    );
  }

  if (!verification.idempotencyKey) {
    return failed(
      "REFUND_NOTIFICATION_IDEMPOTENCY_KEY_MISSING",
      "Refund notification verification did not provide an idempotency key.",
      ["idempotency_key_missing"],
    );
  }

  const expectedIdempotencyKey = buildRefundNotifyIdempotencyKey(
    body.provider,
    body.event_id,
  );

  if (verification.idempotencyKey !== expectedIdempotencyKey) {
    return failed(
      "REFUND_NOTIFICATION_IDEMPOTENCY_KEY_MISMATCH",
      "Refund notification idempotency key does not match the body event id.",
      ["idempotency_key_mismatch"],
    );
  }

  if (
    !body.event_id ||
    !body.provider_refund_id ||
    !body.merchant_order_ref ||
    !body.payment_session_id
  ) {
    return failed(
      "REFUND_NOTIFICATION_REFERENCE_MISSING",
      "Refund notification is missing required refund references.",
      ["unknown_refund_reference"],
    );
  }

  if (
    body.provider_refund_id !== expectedRequest.providerRefundId ||
    verification.providerRefundId !== expectedRequest.providerRefundId
  ) {
    return failed(
      "REFUND_NOTIFICATION_PROVIDER_REFUND_ID_MISMATCH",
      "Refund notification provider refund id does not match the request.",
      ["provider_refund_id_mismatch"],
    );
  }

  if (body.merchant_order_ref !== expectedRequest.merchantOrderRef) {
    return failed(
      "REFUND_NOTIFICATION_MERCHANT_ORDER_MISMATCH",
      "Refund notification merchant order reference does not match the request.",
      ["merchant_order_mismatch"],
    );
  }

  if (body.payment_session_id !== expectedRequest.paymentSessionId) {
    return failed(
      "REFUND_NOTIFICATION_PAYMENT_SESSION_MISMATCH",
      "Refund notification payment session id does not match the request.",
      ["payment_session_mismatch"],
    );
  }

  if (
    expectedRequest.providerTransactionId &&
    body.provider_transaction_id !== expectedRequest.providerTransactionId
  ) {
    return failed(
      "REFUND_NOTIFICATION_PROVIDER_TRANSACTION_MISMATCH",
      "Refund notification provider transaction id does not match the request.",
      ["provider_transaction_mismatch"],
    );
  }

  if (body.currency !== "CNY" || expectedRequest.currency !== "CNY") {
    return failed(
      "REFUND_NOTIFICATION_CURRENCY_UNSUPPORTED",
      "Refund notification currency must be CNY.",
      ["currency_mismatch"],
    );
  }

  if (!Number.isSafeInteger(body.amount) || body.amount <= 0) {
    return failed(
      "REFUND_NOTIFICATION_AMOUNT_INVALID",
      "Refund notification amount must be a positive integer minor amount.",
      ["amount_invalid"],
    );
  }

  if (body.amount !== expectedRequest.requestedAmountMinor) {
    return failed(
      "REFUND_NOTIFICATION_AMOUNT_MISMATCH",
      "Refund notification amount does not match the expected refund request.",
      ["amount_mismatch"],
    );
  }

  const envelope: ChinaPaymentNotificationEnvelope = {
    provider: body.provider,
    eventId: body.event_id,
    eventType: body.event_type,
    providerTransactionId: body.provider_transaction_id,
    providerRefundId: body.provider_refund_id,
    merchantOrderRef: body.merchant_order_ref,
    paymentSessionId: body.payment_session_id,
    amount: {
      value: body.amount,
      currency: body.currency,
    },
    occurredAt: body.occurred_at,
    receivedAt: verification.verifiedAt,
    idempotencyKey: verification.idempotencyKey,
    signature: {
      status: verification.signatureStatus,
      algorithm: verification.algorithm,
      keyId: verification.keyId,
      verifiedAt: verification.verifiedAt,
    },
    rawPayloadDigest: verification.rawPayloadDigest,
    riskFlags: [],
  };

  return {
    normalized: true,
    envelope,
    refundRequestIdempotencyKey: expectedRequest.refundRequestIdempotencyKey,
    fixtureOnly: true,
    executable: false,
  };
};
