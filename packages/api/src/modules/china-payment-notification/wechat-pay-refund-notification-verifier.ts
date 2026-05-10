import { digestRawPayload } from "./idempotency";
import { ChinaPaymentNotificationSignatureStatus } from "./types";
import {
  WechatPayRefundDecryptedResource,
  WechatPayRefundEncryptedResource,
  WechatPayRefundNotificationBody,
  WechatPayRefundRawNotification,
} from "./wechat-pay-refund-notification-test-vectors";

export type WechatPayRefundVerifierFailureCode =
  | "WECHAT_REFUND_HEADER_MISSING"
  | "WECHAT_REFUND_TIMESTAMP_INVALID"
  | "WECHAT_REFUND_TIMESTAMP_OUT_OF_RANGE"
  | "WECHAT_REFUND_SERIAL_UNKNOWN"
  | "WECHAT_REFUND_CERT_EXPIRED"
  | "WECHAT_REFUND_SIGNATURE_FAILED"
  | "WECHAT_REFUND_BODY_MALFORMED"
  | "WECHAT_REFUND_RESOURCE_MISSING"
  | "WECHAT_REFUND_RESOURCE_ALGORITHM_UNSUPPORTED"
  | "WECHAT_REFUND_DECRYPT_FAILED"
  | "WECHAT_REFUND_MCH_MISMATCH"
  | "WECHAT_REFUND_APP_MISMATCH"
  | "WECHAT_REFUND_ORDER_MISMATCH"
  | "WECHAT_REFUND_REQUEST_MISMATCH"
  | "WECHAT_REFUND_AMOUNT_MISMATCH"
  | "WECHAT_REFUND_CURRENCY_MISMATCH"
  | "WECHAT_REFUND_EVENT_UNKNOWN";

export type WechatPayRefundTrustedCredential = {
  serial: string;
  publicKeyRef: string;
  notBefore?: string;
  notAfter?: string;
};

export type WechatPayRefundEventType =
  | "refund.succeeded"
  | "refund.abnormal"
  | "refund.closed"
  | "unknown";

export type WechatPayRefundVerifierContractInput = {
  rawNotification: WechatPayRefundRawNotification;
  currentUnixSeconds: number;
  timestampToleranceSeconds?: number;
  trustedPlatformCertificates: readonly WechatPayRefundTrustedCredential[];
  expectedSignature: string;
  expectedCiphertext: string;
  decryptedResource: WechatPayRefundDecryptedResource;
  expectedMchId: string;
  expectedAppId?: string;
  expectedOutTradeNo?: string;
  expectedOutRefundNo?: string;
  expectedAmountValue?: number;
  expectedCurrency?: "CNY";
};

export type WechatPayRefundVerifierContractResult = {
  provider: "wechat_pay";
  signatureStatus: ChinaPaymentNotificationSignatureStatus;
  decryptStatus: "decrypted" | "failed" | "not_attempted";
  serial?: string;
  eventId?: string;
  eventType?: WechatPayRefundEventType;
  providerRefundId?: string;
  merchantRefundRequestRef?: string;
  merchantOrderRef?: string;
  providerTransactionId?: string;
  amountValue?: number;
  currency?: "CNY";
  idempotencyKey?: string;
  rawPayloadDigest: string;
  decryptedPayloadDigest?: string;
  failureCode?: WechatPayRefundVerifierFailureCode;
  failureMessage?: string;
  receivedAt: string;
  fixtureOnly: true;
  executable: false;
};

const defaultTimestampToleranceSeconds = 300;

const headerValue = (
  rawNotification: WechatPayRefundRawNotification,
  header: string,
): string | undefined => {
  const exact = rawNotification.headers[header];

  if (exact) {
    return exact;
  }

  const lowerHeader = header.toLowerCase();
  const matchedKey = Object.keys(rawNotification.headers).find(
    (key) => key.toLowerCase() === lowerHeader,
  );

  return matchedKey ? rawNotification.headers[matchedKey] : undefined;
};

const parseRawBody = (
  rawBody: string,
): WechatPayRefundNotificationBody | undefined => {
  try {
    const parsed = JSON.parse(rawBody) as Partial<WechatPayRefundNotificationBody>;

    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }

    return parsed as WechatPayRefundNotificationBody;
  } catch {
    return undefined;
  }
};

const mapEventType = (
  eventType: string | undefined,
): WechatPayRefundEventType => {
  switch (eventType) {
    case "REFUND.SUCCESS":
      return "refund.succeeded";
    case "REFUND.ABNORMAL":
      return "refund.abnormal";
    case "REFUND.CLOSED":
      return "refund.closed";
    default:
      return "unknown";
  }
};

const buildIdempotencyKey = (eventId: string): string =>
  `refund_notify:wechat_pay:${eventId}`;

const failed = (
  input: WechatPayRefundVerifierContractInput,
  status: ChinaPaymentNotificationSignatureStatus,
  decryptStatus: WechatPayRefundVerifierContractResult["decryptStatus"],
  failureCode: WechatPayRefundVerifierFailureCode,
  failureMessage: string,
  parsedBody?: Partial<WechatPayRefundNotificationBody>,
): WechatPayRefundVerifierContractResult => ({
  provider: "wechat_pay",
  signatureStatus: status,
  decryptStatus,
  serial: headerValue(input.rawNotification, "wechatpay-serial"),
  eventId: parsedBody?.id,
  eventType: mapEventType(parsedBody?.event_type),
  rawPayloadDigest: digestRawPayload(input.rawNotification.rawBody),
  failureCode,
  failureMessage,
  receivedAt: input.rawNotification.receivedAt,
  fixtureOnly: true,
  executable: false,
});

const findTrustedCredential = (
  serial: string,
  credentials: readonly WechatPayRefundTrustedCredential[],
  receivedAt: string,
): WechatPayRefundTrustedCredential | WechatPayRefundVerifierFailureCode => {
  const credential = credentials.find((candidate) => candidate.serial === serial);

  if (!credential) {
    return "WECHAT_REFUND_SERIAL_UNKNOWN";
  }

  const receivedAtMs = Date.parse(receivedAt);

  if (
    (credential.notBefore && receivedAtMs < Date.parse(credential.notBefore)) ||
    (credential.notAfter && receivedAtMs > Date.parse(credential.notAfter))
  ) {
    return "WECHAT_REFUND_CERT_EXPIRED";
  }

  return credential;
};

const hasSupportedResource = (
  resource: WechatPayRefundEncryptedResource | undefined,
): resource is WechatPayRefundEncryptedResource =>
  Boolean(resource?.ciphertext && resource?.nonce && resource?.associated_data);

export const verifyWechatPayRefundNotificationContract = (
  input: WechatPayRefundVerifierContractInput,
): WechatPayRefundVerifierContractResult => {
  const rawDigest = digestRawPayload(input.rawNotification.rawBody);
  const timestampHeader = headerValue(input.rawNotification, "wechatpay-timestamp");
  const nonce = headerValue(input.rawNotification, "wechatpay-nonce");
  const signature = headerValue(input.rawNotification, "wechatpay-signature");
  const serial = headerValue(input.rawNotification, "wechatpay-serial");

  if (!timestampHeader || !nonce || !signature || !serial) {
    return failed(
      input,
      "missing",
      "not_attempted",
      "WECHAT_REFUND_HEADER_MISSING",
      "WeChat Pay refund notification required signature headers are missing.",
    );
  }

  const timestamp = Number(timestampHeader);

  if (!Number.isSafeInteger(timestamp)) {
    return failed(
      input,
      "invalid",
      "not_attempted",
      "WECHAT_REFUND_TIMESTAMP_INVALID",
      "WeChat Pay refund notification timestamp is invalid.",
    );
  }

  const tolerance =
    input.timestampToleranceSeconds ?? defaultTimestampToleranceSeconds;

  if (Math.abs(input.currentUnixSeconds - timestamp) > tolerance) {
    return failed(
      input,
      "invalid",
      "not_attempted",
      "WECHAT_REFUND_TIMESTAMP_OUT_OF_RANGE",
      "WeChat Pay refund notification timestamp is outside the allowed window.",
    );
  }

  const credential = findTrustedCredential(
    serial,
    input.trustedPlatformCertificates,
    input.rawNotification.receivedAt,
  );

  if (typeof credential === "string") {
    return failed(
      input,
      "invalid",
      "not_attempted",
      credential,
      credential === "WECHAT_REFUND_SERIAL_UNKNOWN"
        ? "WeChat Pay refund notification serial is not trusted."
        : "WeChat Pay refund notification credential is outside its validity window.",
    );
  }

  if (signature !== input.expectedSignature) {
    return failed(
      input,
      "invalid",
      "not_attempted",
      "WECHAT_REFUND_SIGNATURE_FAILED",
      "WeChat Pay refund notification signature did not match the expected test verifier.",
    );
  }

  const parsedBody = parseRawBody(input.rawNotification.rawBody);

  if (!parsedBody) {
    return failed(
      input,
      "invalid",
      "not_attempted",
      "WECHAT_REFUND_BODY_MALFORMED",
      "WeChat Pay refund notification body is malformed.",
    );
  }

  if (!hasSupportedResource(parsedBody.resource)) {
    return failed(
      input,
      "invalid",
      "not_attempted",
      "WECHAT_REFUND_RESOURCE_MISSING",
      "WeChat Pay refund notification encrypted resource is missing.",
      parsedBody,
    );
  }

  if (parsedBody.resource.algorithm !== "AEAD_AES_256_GCM") {
    return failed(
      input,
      "unsupported",
      "not_attempted",
      "WECHAT_REFUND_RESOURCE_ALGORITHM_UNSUPPORTED",
      "WeChat Pay refund notification encrypted resource algorithm is unsupported.",
      parsedBody,
    );
  }

  if (parsedBody.resource.ciphertext !== input.expectedCiphertext) {
    return failed(
      input,
      "verified",
      "failed",
      "WECHAT_REFUND_DECRYPT_FAILED",
      "WeChat Pay refund notification deterministic test decryptor failed.",
      parsedBody,
    );
  }

  const decrypted = input.decryptedResource;

  if (decrypted.mchid !== input.expectedMchId) {
    return failed(
      input,
      "verified",
      "decrypted",
      "WECHAT_REFUND_MCH_MISMATCH",
      "WeChat Pay refund notification merchant id does not match.",
      parsedBody,
    );
  }

  if (input.expectedAppId && decrypted.appid !== input.expectedAppId) {
    return failed(
      input,
      "verified",
      "decrypted",
      "WECHAT_REFUND_APP_MISMATCH",
      "WeChat Pay refund notification app id does not match.",
      parsedBody,
    );
  }

  if (
    input.expectedOutTradeNo &&
    decrypted.out_trade_no !== input.expectedOutTradeNo
  ) {
    return failed(
      input,
      "verified",
      "decrypted",
      "WECHAT_REFUND_ORDER_MISMATCH",
      "WeChat Pay refund notification merchant order reference does not match.",
      parsedBody,
    );
  }

  if (
    input.expectedOutRefundNo &&
    decrypted.out_refund_no !== input.expectedOutRefundNo
  ) {
    return failed(
      input,
      "verified",
      "decrypted",
      "WECHAT_REFUND_REQUEST_MISMATCH",
      "WeChat Pay refund notification refund request reference does not match.",
      parsedBody,
    );
  }

  const expectedAmount = input.expectedAmountValue ?? decrypted.amount.refund;

  if (decrypted.amount.refund !== expectedAmount) {
    return failed(
      input,
      "verified",
      "decrypted",
      "WECHAT_REFUND_AMOUNT_MISMATCH",
      "WeChat Pay refund notification amount does not match.",
      parsedBody,
    );
  }

  const expectedCurrency = input.expectedCurrency ?? "CNY";

  if (decrypted.amount.currency !== expectedCurrency) {
    return failed(
      input,
      "verified",
      "decrypted",
      "WECHAT_REFUND_CURRENCY_MISMATCH",
      "WeChat Pay refund notification currency does not match.",
      parsedBody,
    );
  }

  const eventType = mapEventType(parsedBody.event_type);

  if (eventType === "unknown") {
    return failed(
      input,
      "verified",
      "decrypted",
      "WECHAT_REFUND_EVENT_UNKNOWN",
      "WeChat Pay refund notification event type is unknown.",
      parsedBody,
    );
  }

  return {
    provider: "wechat_pay",
    signatureStatus: "verified",
    decryptStatus: "decrypted",
    serial,
    eventId: parsedBody.id,
    eventType,
    providerRefundId: decrypted.refund_id,
    merchantRefundRequestRef: decrypted.out_refund_no,
    merchantOrderRef: decrypted.out_trade_no,
    providerTransactionId: decrypted.transaction_id,
    amountValue: decrypted.amount.refund,
    currency: decrypted.amount.currency,
    idempotencyKey: buildIdempotencyKey(parsedBody.id),
    rawPayloadDigest: rawDigest,
    decryptedPayloadDigest: digestRawPayload(JSON.stringify(decrypted)),
    receivedAt: input.rawNotification.receivedAt,
    fixtureOnly: true,
    executable: false,
  };
};
