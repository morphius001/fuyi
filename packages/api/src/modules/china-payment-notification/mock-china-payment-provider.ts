import { createHash } from "crypto";

import { digestRawPayload } from "./idempotency";
import { normalizeMockPaymentNotification } from "./mock-payload-normalizer";
import { verifyMockPaymentSignature } from "./mock-signature-verifier";
import {
  ChinaPaymentNotificationEnvelope,
  ChinaPaymentNotificationMoney,
  ChinaPaymentNotificationSignatureResult,
  MockSignatureHeaders,
} from "./types";

export type MockChinaPaymentProviderName = "mock_china_pay";

export type MockChinaPaymentProviderConfig = {
  provider: MockChinaPaymentProviderName;
  mode: "contract_only";
  secretRef: "mock-only";
};

export type MockChinaCreatePaymentInput = {
  merchantOrderRef: string;
  amount: ChinaPaymentNotificationMoney;
  subject: string;
  notifyUrl: string;
  returnUrl?: string;
  clientIp?: string;
  metadata?: Record<string, unknown>;
};

export type MockChinaCreatePaymentResult = {
  provider: MockChinaPaymentProviderName;
  providerPaymentId: string;
  providerTransactionId?: string;
  paymentUrl: string;
  qrCodeUrl: string;
  expiresAt: string;
  clientPayload: {
    provider: MockChinaPaymentProviderName;
    merchantOrderRef: string;
    amount: ChinaPaymentNotificationMoney;
    subject: string;
    notifyUrl: string;
    returnUrl?: string;
    mockPaymentRequestId: string;
  };
  rawPayloadDigest: string;
};

export type MockChinaQueryPaymentInput = {
  merchantOrderRef: string;
  providerPaymentId: string;
};

export type MockChinaQueryPaymentResult = {
  provider: MockChinaPaymentProviderName;
  providerPaymentId: string;
  merchantOrderRef: string;
  status: "pending";
  rawPayloadDigest: string;
};

export type MockChinaClosePaymentInput = {
  merchantOrderRef: string;
  providerPaymentId: string;
  reason: string;
};

export type MockChinaClosePaymentResult = {
  provider: MockChinaPaymentProviderName;
  providerPaymentId: string;
  merchantOrderRef: string;
  closed: true;
  rawPayloadDigest: string;
};

export type MockChinaRawNotificationInput = {
  rawBody: string;
  headers: MockSignatureHeaders;
  secret: string;
  receivedAt?: string;
  expectedAmount?: ChinaPaymentNotificationMoney;
};

export type MockChinaPaymentProviderContract = {
  config: MockChinaPaymentProviderConfig;
  createPayment(input: MockChinaCreatePaymentInput): MockChinaCreatePaymentResult;
  queryPayment(input: MockChinaQueryPaymentInput): MockChinaQueryPaymentResult;
  closePayment(input: MockChinaClosePaymentInput): MockChinaClosePaymentResult;
  verifyNotification(
    input: MockChinaRawNotificationInput,
  ): ChinaPaymentNotificationSignatureResult;
  normalizeNotification(
    input: MockChinaRawNotificationInput,
  ): ChinaPaymentNotificationEnvelope;
};

const provider: MockChinaPaymentProviderName = "mock_china_pay";

const stableId = (prefix: string, payload: Record<string, unknown>): string => {
  const digest = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex")
    .slice(0, 24);

  return `${prefix}_${digest}`;
};

const assertCnyAmount = (amount: ChinaPaymentNotificationMoney): void => {
  if (amount.currency !== "CNY" || !Number.isInteger(amount.value) || amount.value <= 0) {
    throw new Error("MOCK_CHINA_PAYMENT_AMOUNT_INVALID");
  }
};

const assertCreateInput = (input: MockChinaCreatePaymentInput): void => {
  assertCnyAmount(input.amount);

  if (!input.merchantOrderRef) {
    throw new Error("MOCK_CHINA_PAYMENT_ORDER_REF_REQUIRED");
  }

  if (!input.subject) {
    throw new Error("MOCK_CHINA_PAYMENT_SUBJECT_REQUIRED");
  }

  if (!input.notifyUrl) {
    throw new Error("MOCK_CHINA_PAYMENT_NOTIFY_URL_REQUIRED");
  }
};

export const createMockChinaPaymentProviderContract =
  (): MockChinaPaymentProviderContract => ({
    config: {
      provider,
      mode: "contract_only",
      secretRef: "mock-only",
    },

    createPayment(input) {
      assertCreateInput(input);

      const mockPaymentRequestId = stableId("mock_payreq", {
        provider,
        merchantOrderRef: input.merchantOrderRef,
        amount: input.amount,
        subject: input.subject,
        notifyUrl: input.notifyUrl,
      });
      const providerPaymentId = stableId("mock_pay", {
        provider,
        merchantOrderRef: input.merchantOrderRef,
        mockPaymentRequestId,
      });
      const clientPayload = {
        provider,
        merchantOrderRef: input.merchantOrderRef,
        amount: input.amount,
        subject: input.subject,
        notifyUrl: input.notifyUrl,
        returnUrl: input.returnUrl,
        mockPaymentRequestId,
      };

      return {
        provider,
        providerPaymentId,
        paymentUrl: `mock://china-pay/payments/${providerPaymentId}`,
        qrCodeUrl: `mock://china-pay/qr/${providerPaymentId}`,
        expiresAt: new Date(Date.UTC(2026, 4, 8, 6, 0, 0)).toISOString(),
        clientPayload,
        rawPayloadDigest: digestRawPayload(JSON.stringify(clientPayload)),
      };
    },

    queryPayment(input) {
      const payload = {
        provider,
        providerPaymentId: input.providerPaymentId,
        merchantOrderRef: input.merchantOrderRef,
        status: "pending",
      };

      return {
        provider,
        providerPaymentId: input.providerPaymentId,
        merchantOrderRef: input.merchantOrderRef,
        status: "pending",
        rawPayloadDigest: digestRawPayload(JSON.stringify(payload)),
      };
    },

    closePayment(input) {
      const payload = {
        provider,
        providerPaymentId: input.providerPaymentId,
        merchantOrderRef: input.merchantOrderRef,
        reason: input.reason,
        closed: true,
      };

      return {
        provider,
        providerPaymentId: input.providerPaymentId,
        merchantOrderRef: input.merchantOrderRef,
        closed: true,
        rawPayloadDigest: digestRawPayload(JSON.stringify(payload)),
      };
    },

    verifyNotification(input) {
      return verifyMockPaymentSignature(input);
    },

    normalizeNotification(input) {
      return normalizeMockPaymentNotification(input);
    },
  });
