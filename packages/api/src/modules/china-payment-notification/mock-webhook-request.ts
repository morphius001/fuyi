import {
  ChinaPaymentNotificationMoney,
  MockSignatureHeaders,
  NormalizeMockPaymentNotificationInput,
} from "./types";
import { MockPaymentWebhookRejectedCode } from "./mock-webhook-response";

export type MockPaymentWebhookRequestHeaders = Record<
  string,
  string | string[] | undefined
>;

export type MockPaymentWebhookRequestInput = {
  rawBody?: string;
  headers?: MockPaymentWebhookRequestHeaders;
  secret?: string;
  receivedAt?: string;
  expectedAmount?: ChinaPaymentNotificationMoney;
};

export type MockPaymentWebhookRequestDecision =
  | {
      accepted: true;
      normalizeInput: NormalizeMockPaymentNotificationInput;
    }
  | {
      accepted: false;
      code: MockPaymentWebhookRejectedCode;
      reason: string;
      safeMetadata: {
        receivedAt?: string;
        headerNames: string[];
      };
    };

const headerAliases: Record<keyof MockSignatureHeaders, string[]> = {
  signature: ["x-mock-payment-signature", "signature"],
  eventId: ["x-mock-payment-event-id", "x-event-id", "event-id"],
  timestamp: [
    "x-mock-payment-timestamp",
    "x-payment-timestamp",
    "timestamp",
  ],
  keyId: ["x-mock-payment-key-id", "x-key-id", "key-id"],
};

const normalizeHeaders = (
  headers: MockPaymentWebhookRequestHeaders = {},
): MockPaymentWebhookRequestHeaders => {
  return Object.entries(headers).reduce<MockPaymentWebhookRequestHeaders>(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );
};

const firstHeaderValue = (
  headers: MockPaymentWebhookRequestHeaders,
  names: string[],
): string | undefined => {
  for (const name of names) {
    const value = headers[name];

    if (Array.isArray(value)) {
      const first = value.find((item) => item.trim().length > 0);

      if (first) {
        return first.trim();
      }
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const pickMockSignatureHeaders = (
  headers: MockPaymentWebhookRequestHeaders,
): MockSignatureHeaders => ({
  signature: firstHeaderValue(headers, headerAliases.signature),
  eventId: firstHeaderValue(headers, headerAliases.eventId),
  timestamp: firstHeaderValue(headers, headerAliases.timestamp),
  keyId: firstHeaderValue(headers, headerAliases.keyId),
});

const reject = (
  input: MockPaymentWebhookRequestInput,
  code: MockPaymentWebhookRejectedCode,
  reason: string,
): MockPaymentWebhookRequestDecision => ({
  accepted: false,
  code,
  reason,
  safeMetadata: {
    receivedAt: input.receivedAt,
    headerNames: Object.keys(input.headers ?? {}).sort(),
  },
});

export const mapMockPaymentWebhookRequestToNormalizeInput = (
  input: MockPaymentWebhookRequestInput,
): MockPaymentWebhookRequestDecision => {
  const rawBody = input.rawBody?.trim();

  if (!rawBody) {
    return reject(input, "PAYLOAD_INVALID", "Mock webhook raw body is missing.");
  }

  const secret = input.secret?.trim();

  if (!secret) {
    return reject(input, "PAYLOAD_INVALID", "Mock webhook secret is missing.");
  }

  const headers = pickMockSignatureHeaders(normalizeHeaders(input.headers));

  if (!headers.signature) {
    return reject(
      input,
      "SIGNATURE_MISSING",
      "Mock webhook signature header is missing.",
    );
  }

  return {
    accepted: true,
    normalizeInput: {
      rawBody,
      headers,
      secret,
      receivedAt: input.receivedAt,
      expectedAmount: input.expectedAmount,
    },
  };
};
