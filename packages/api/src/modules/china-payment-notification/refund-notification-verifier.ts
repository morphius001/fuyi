import { digestRawPayload } from "./idempotency";
import {
  ChinaPaymentNotificationSignatureStatus,
  ChinaPaymentNotificationEventType,
} from "./types";
import { RefundFakeNotificationBody } from "./refund-notification-test-vectors";

export type RefundNotificationVerifierFailureCode =
  | "REFUND_NOTIFICATION_RAW_BODY_INVALID"
  | "REFUND_NOTIFICATION_SIGNATURE_MISSING"
  | "REFUND_NOTIFICATION_ALGORITHM_UNSUPPORTED"
  | "REFUND_NOTIFICATION_SIGNATURE_INVALID"
  | "REFUND_NOTIFICATION_PROVIDER_MISMATCH"
  | "REFUND_NOTIFICATION_EVENT_TYPE_UNSUPPORTED"
  | "REFUND_NOTIFICATION_EVENT_ID_MISSING"
  | "REFUND_NOTIFICATION_EVENT_ID_MISMATCH"
  | "REFUND_NOTIFICATION_PROVIDER_REFUND_ID_MISSING"
  | "REFUND_NOTIFICATION_CURRENCY_UNSUPPORTED"
  | "REFUND_NOTIFICATION_AMOUNT_INVALID";

export type RefundNotificationFakeHeaders = {
  signature?: string;
  algorithm?: "MOCK_SHA256" | string;
  eventId?: string;
  provider?: "mock_china_pay" | string;
  keyId?: string;
};

export type RefundNotificationVerifierContractInput = {
  rawBody: string;
  headers: RefundNotificationFakeHeaders;
  expectedFakeSignature: string;
  receivedAt: string;
  expectedProvider?: "mock_china_pay";
  expectedAlgorithm?: "MOCK_SHA256";
};

export type RefundNotificationVerifierContractResult = {
  provider: "mock_china_pay";
  verified: boolean;
  signatureStatus: ChinaPaymentNotificationSignatureStatus;
  algorithm?: string;
  keyId?: string;
  eventId?: string;
  eventType?: Extract<
    ChinaPaymentNotificationEventType,
    "refund.succeeded" | "refund.failed"
  >;
  providerRefundId?: string;
  idempotencyKey?: string;
  rawPayloadDigest: string;
  verifiedAt: string;
  failureCode?: RefundNotificationVerifierFailureCode;
  failureMessage?: string;
  fixtureOnly: true;
  executable: false;
};

const supportedRefundEventTypes = ["refund.succeeded", "refund.failed"];

const parseRawBody = (
  rawBody: string,
): Partial<RefundFakeNotificationBody> | undefined => {
  try {
    return JSON.parse(rawBody) as Partial<RefundFakeNotificationBody>;
  } catch {
    return undefined;
  }
};

const buildRefundNotifyIdempotencyKey = (
  provider: "mock_china_pay",
  eventId: string,
): string => `refund_notify:${provider}:${eventId}`;

const failed = (
  input: RefundNotificationVerifierContractInput,
  status: ChinaPaymentNotificationSignatureStatus,
  failureCode: RefundNotificationVerifierFailureCode,
  failureMessage: string,
  parsedBody?: Partial<RefundFakeNotificationBody>,
): RefundNotificationVerifierContractResult => ({
  provider: "mock_china_pay",
  verified: false,
  signatureStatus: status,
  algorithm: input.headers.algorithm,
  keyId: input.headers.keyId,
  eventId: parsedBody?.event_id,
  eventType: supportedRefundEventTypes.includes(parsedBody?.event_type ?? "")
    ? (parsedBody?.event_type as RefundNotificationVerifierContractResult["eventType"])
    : undefined,
  providerRefundId: parsedBody?.provider_refund_id,
  rawPayloadDigest: digestRawPayload(input.rawBody),
  verifiedAt: input.receivedAt,
  failureCode,
  failureMessage,
  fixtureOnly: true,
  executable: false,
});

export const verifyRefundNotificationContract = (
  input: RefundNotificationVerifierContractInput,
): RefundNotificationVerifierContractResult => {
  const parsedBody = parseRawBody(input.rawBody);

  if (!parsedBody) {
    return failed(
      input,
      "invalid",
      "REFUND_NOTIFICATION_RAW_BODY_INVALID",
      "Refund notification raw body is not valid JSON.",
    );
  }

  if (!input.headers.signature) {
    return failed(
      input,
      "missing",
      "REFUND_NOTIFICATION_SIGNATURE_MISSING",
      "Refund notification fake signature is missing.",
      parsedBody,
    );
  }

  const expectedAlgorithm = input.expectedAlgorithm ?? "MOCK_SHA256";

  if (input.headers.algorithm !== expectedAlgorithm) {
    return failed(
      input,
      "unsupported",
      "REFUND_NOTIFICATION_ALGORITHM_UNSUPPORTED",
      "Refund notification fake signature algorithm is unsupported.",
      parsedBody,
    );
  }

  if (input.headers.signature !== input.expectedFakeSignature) {
    return failed(
      input,
      "invalid",
      "REFUND_NOTIFICATION_SIGNATURE_INVALID",
      "Refund notification fake signature did not match.",
      parsedBody,
    );
  }

  const expectedProvider = input.expectedProvider ?? "mock_china_pay";

  if (
    parsedBody.provider !== expectedProvider ||
    (input.headers.provider && input.headers.provider !== expectedProvider)
  ) {
    return failed(
      input,
      "invalid",
      "REFUND_NOTIFICATION_PROVIDER_MISMATCH",
      "Refund notification provider does not match the expected fake provider.",
      parsedBody,
    );
  }

  if (!supportedRefundEventTypes.includes(parsedBody.event_type ?? "")) {
    return failed(
      input,
      "invalid",
      "REFUND_NOTIFICATION_EVENT_TYPE_UNSUPPORTED",
      "Refund notification event type is unsupported.",
      parsedBody,
    );
  }

  if (!parsedBody.event_id) {
    return failed(
      input,
      "invalid",
      "REFUND_NOTIFICATION_EVENT_ID_MISSING",
      "Refund notification event id is missing.",
      parsedBody,
    );
  }

  if (input.headers.eventId && input.headers.eventId !== parsedBody.event_id) {
    return failed(
      input,
      "invalid",
      "REFUND_NOTIFICATION_EVENT_ID_MISMATCH",
      "Refund notification event id does not match the fake header.",
      parsedBody,
    );
  }

  if (!parsedBody.provider_refund_id) {
    return failed(
      input,
      "invalid",
      "REFUND_NOTIFICATION_PROVIDER_REFUND_ID_MISSING",
      "Refund notification provider refund id is missing.",
      parsedBody,
    );
  }

  if (parsedBody.currency !== "CNY") {
    return failed(
      input,
      "invalid",
      "REFUND_NOTIFICATION_CURRENCY_UNSUPPORTED",
      "Refund notification currency must be CNY.",
      parsedBody,
    );
  }

  if (
    !Number.isSafeInteger(parsedBody.amount) ||
    Number(parsedBody.amount) <= 0
  ) {
    return failed(
      input,
      "invalid",
      "REFUND_NOTIFICATION_AMOUNT_INVALID",
      "Refund notification amount must be a positive integer minor amount.",
      parsedBody,
    );
  }

  return {
    provider: "mock_china_pay",
    verified: true,
    signatureStatus: "verified",
    algorithm: input.headers.algorithm,
    keyId: input.headers.keyId,
    eventId: parsedBody.event_id,
    eventType:
      parsedBody.event_type as RefundNotificationVerifierContractResult["eventType"],
    providerRefundId: parsedBody.provider_refund_id,
    idempotencyKey: buildRefundNotifyIdempotencyKey(
      expectedProvider,
      parsedBody.event_id,
    ),
    rawPayloadDigest: digestRawPayload(input.rawBody),
    verifiedAt: input.receivedAt,
    fixtureOnly: true,
    executable: false,
  };
};
