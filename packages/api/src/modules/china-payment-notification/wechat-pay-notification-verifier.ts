import { digestRawPayload } from "./idempotency";
import { ChinaPaymentNotificationSignatureStatus } from "./types";
import {
  WechatPayFakeNotificationBody,
  WechatPayFakeRawNotification,
} from "./wechat-pay-test-vectors";

export type WechatPayNotificationVerifierFailureCode =
  | "WECHAT_PAY_RAW_BODY_INVALID"
  | "WECHAT_PAY_SIGNATURE_MISSING"
  | "WECHAT_PAY_TIMESTAMP_MISSING"
  | "WECHAT_PAY_TIMESTAMP_INVALID"
  | "WECHAT_PAY_TIMESTAMP_OUTSIDE_TOLERANCE"
  | "WECHAT_PAY_NONCE_MISSING"
  | "WECHAT_PAY_SERIAL_MISSING"
  | "WECHAT_PAY_SERIAL_UNTRUSTED"
  | "WECHAT_PAY_SIGNATURE_INVALID"
  | "WECHAT_PAY_RESOURCE_ALGORITHM_UNSUPPORTED";

export type WechatPayNotificationVerifierContractInput = {
  rawNotification: WechatPayFakeRawNotification;
  trustedSerials: readonly string[];
  expectedFakeSignature: string;
  currentUnixSeconds: number;
  timestampToleranceSeconds?: number;
  expectedResourceAlgorithm?: "AEAD_AES_256_GCM";
};

export type WechatPayNotificationVerifierContractResult = {
  provider: "wechat_pay";
  signatureStatus: ChinaPaymentNotificationSignatureStatus;
  resourceStatus: "accepted" | "unsupported" | "unparsed";
  serial?: string;
  eventId?: string;
  eventType?: WechatPayFakeNotificationBody["event_type"];
  rawPayloadDigest: string;
  verifiedAt: string;
  failureCode?: WechatPayNotificationVerifierFailureCode;
  failureMessage?: string;
  fixtureOnly: true;
  executable: false;
};

const defaultTimestampToleranceSeconds = 300;

const failed = (
  input: WechatPayNotificationVerifierContractInput,
  status: ChinaPaymentNotificationSignatureStatus,
  resourceStatus: WechatPayNotificationVerifierContractResult["resourceStatus"],
  failureCode: WechatPayNotificationVerifierFailureCode,
  failureMessage: string,
  parsedBody?: WechatPayFakeNotificationBody,
): WechatPayNotificationVerifierContractResult => ({
  provider: "wechat_pay",
  signatureStatus: status,
  resourceStatus,
  serial: input.rawNotification.headers["wechatpay-serial"],
  eventId: parsedBody?.id,
  eventType: parsedBody?.event_type,
  rawPayloadDigest: digestRawPayload(input.rawNotification.rawBody),
  verifiedAt: input.rawNotification.receivedAt,
  failureCode,
  failureMessage,
  fixtureOnly: true,
  executable: false,
});

const parseRawBody = (
  rawBody: string,
): WechatPayFakeNotificationBody | undefined => {
  try {
    return JSON.parse(rawBody) as WechatPayFakeNotificationBody;
  } catch {
    return undefined;
  }
};

export const verifyWechatPayNotificationContract = (
  input: WechatPayNotificationVerifierContractInput,
): WechatPayNotificationVerifierContractResult => {
  const parsedBody = parseRawBody(input.rawNotification.rawBody);

  if (!parsedBody) {
    return failed(
      input,
      "invalid",
      "unparsed",
      "WECHAT_PAY_RAW_BODY_INVALID",
      "WeChat Pay notification raw body is not valid JSON.",
    );
  }

  const headers = input.rawNotification.headers;

  if (!headers["wechatpay-signature"]) {
    return failed(
      input,
      "missing",
      "accepted",
      "WECHAT_PAY_SIGNATURE_MISSING",
      "WeChat Pay signature header is missing.",
      parsedBody,
    );
  }

  if (!headers["wechatpay-timestamp"]) {
    return failed(
      input,
      "missing",
      "accepted",
      "WECHAT_PAY_TIMESTAMP_MISSING",
      "WeChat Pay timestamp header is missing.",
      parsedBody,
    );
  }

  const timestamp = Number(headers["wechatpay-timestamp"]);

  if (!Number.isSafeInteger(timestamp)) {
    return failed(
      input,
      "invalid",
      "accepted",
      "WECHAT_PAY_TIMESTAMP_INVALID",
      "WeChat Pay timestamp header is not a valid unix timestamp.",
      parsedBody,
    );
  }

  const tolerance =
    input.timestampToleranceSeconds ?? defaultTimestampToleranceSeconds;

  if (Math.abs(input.currentUnixSeconds - timestamp) > tolerance) {
    return failed(
      input,
      "invalid",
      "accepted",
      "WECHAT_PAY_TIMESTAMP_OUTSIDE_TOLERANCE",
      "WeChat Pay timestamp is outside the allowed verification window.",
      parsedBody,
    );
  }

  if (!headers["wechatpay-nonce"]) {
    return failed(
      input,
      "missing",
      "accepted",
      "WECHAT_PAY_NONCE_MISSING",
      "WeChat Pay nonce header is missing.",
      parsedBody,
    );
  }

  const serial = headers["wechatpay-serial"];

  if (!serial) {
    return failed(
      input,
      "missing",
      "accepted",
      "WECHAT_PAY_SERIAL_MISSING",
      "WeChat Pay serial header is missing.",
      parsedBody,
    );
  }

  if (!input.trustedSerials.includes(serial)) {
    return failed(
      input,
      "invalid",
      "accepted",
      "WECHAT_PAY_SERIAL_UNTRUSTED",
      "WeChat Pay serial header is not in the trusted fake serial list.",
      parsedBody,
    );
  }

  if (headers["wechatpay-signature"] !== input.expectedFakeSignature) {
    return failed(
      input,
      "invalid",
      "accepted",
      "WECHAT_PAY_SIGNATURE_INVALID",
      "WeChat Pay fake signature did not match the expected fake signature.",
      parsedBody,
    );
  }

  const expectedAlgorithm =
    input.expectedResourceAlgorithm ?? "AEAD_AES_256_GCM";

  if (parsedBody.resource.algorithm !== expectedAlgorithm) {
    return failed(
      input,
      "unsupported",
      "unsupported",
      "WECHAT_PAY_RESOURCE_ALGORITHM_UNSUPPORTED",
      "WeChat Pay encrypted resource algorithm is unsupported.",
      parsedBody,
    );
  }

  return {
    provider: "wechat_pay",
    signatureStatus: "verified",
    resourceStatus: "accepted",
    serial,
    eventId: parsedBody.id,
    eventType: parsedBody.event_type,
    rawPayloadDigest: digestRawPayload(input.rawNotification.rawBody),
    verifiedAt: input.rawNotification.receivedAt,
    fixtureOnly: true,
    executable: false,
  };
};
