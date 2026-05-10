import { digestRawPayload } from "./idempotency";
import { ChinaPaymentNotificationMoney } from "./types";

export type AlipayProviderName = "alipay_sandbox" | "alipay";

export type DisabledAlipayProviderMode = "disabled";

export type AlipayProviderSecretReferenceKeys = {
  appIdRef: "CHINA_PAYMENT_ALIPAY_APP_ID_REF";
  merchantIdRef: "CHINA_PAYMENT_ALIPAY_MERCHANT_ID_REF";
  privateKeyRef: "CHINA_PAYMENT_ALIPAY_PRIVATE_KEY_REF";
  publicKeyRef: "CHINA_PAYMENT_ALIPAY_PUBLIC_KEY_REF";
  appCertSnRef: "CHINA_PAYMENT_ALIPAY_APP_CERT_SN_REF";
  rootCertSnRef: "CHINA_PAYMENT_ALIPAY_ROOT_CERT_SN_REF";
};

export type DisabledAlipayProviderConfig = {
  provider: Extract<AlipayProviderName, "alipay">;
  sandboxProvider: Extract<AlipayProviderName, "alipay_sandbox">;
  mode: DisabledAlipayProviderMode;
  enabled: false;
  notifyUrlBaseKey: "CHINA_PAYMENT_ALIPAY_NOTIFY_URL_BASE";
  returnUrlBaseKey: "CHINA_PAYMENT_ALIPAY_RETURN_URL_BASE";
  secretReferenceKeys: AlipayProviderSecretReferenceKeys;
};

export type AlipayCreatePaymentInput = {
  merchantOrderRef: string;
  amount: ChinaPaymentNotificationMoney;
  subject: string;
  notifyUrl: string;
  returnUrl?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
};

export type AlipayQueryPaymentInput = {
  merchantOrderRef: string;
  providerPaymentId: string;
};

export type AlipayClosePaymentInput = {
  merchantOrderRef: string;
  providerPaymentId: string;
  reason: string;
};

export type AlipayRawNotificationInput = {
  form: Record<string, string | undefined>;
  headers?: Record<string, string | string[] | undefined>;
  receivedAt?: string;
};

export type DisabledAlipayProviderOperation =
  | "create_payment"
  | "query_payment"
  | "close_payment"
  | "verify_notification"
  | "normalize_notification";

export type DisabledAlipayProviderDecision = {
  provider: Extract<AlipayProviderName, "alipay">;
  mode: DisabledAlipayProviderMode;
  enabled: false;
  blocked: true;
  operation: DisabledAlipayProviderOperation;
  reason: string;
  rawPayloadDigest?: string;
};

export type DisabledAlipayProviderAdapter = {
  config: DisabledAlipayProviderConfig;
  createPayment(input: AlipayCreatePaymentInput): DisabledAlipayProviderDecision;
  queryPayment(input: AlipayQueryPaymentInput): DisabledAlipayProviderDecision;
  closePayment(input: AlipayClosePaymentInput): DisabledAlipayProviderDecision;
  verifyNotification(input: AlipayRawNotificationInput): DisabledAlipayProviderDecision;
  normalizeNotification(input: AlipayRawNotificationInput): DisabledAlipayProviderDecision;
};

const provider: Extract<AlipayProviderName, "alipay"> = "alipay";

const disabledReason =
  "Alipay provider adapter is disabled by default and cannot be used before sandbox verification, DB-backed inbox rehearsal, and runtime gate approval.";

const secretReferenceKeys: AlipayProviderSecretReferenceKeys = {
  appIdRef: "CHINA_PAYMENT_ALIPAY_APP_ID_REF",
  merchantIdRef: "CHINA_PAYMENT_ALIPAY_MERCHANT_ID_REF",
  privateKeyRef: "CHINA_PAYMENT_ALIPAY_PRIVATE_KEY_REF",
  publicKeyRef: "CHINA_PAYMENT_ALIPAY_PUBLIC_KEY_REF",
  appCertSnRef: "CHINA_PAYMENT_ALIPAY_APP_CERT_SN_REF",
  rootCertSnRef: "CHINA_PAYMENT_ALIPAY_ROOT_CERT_SN_REF",
};

const config: DisabledAlipayProviderConfig = {
  provider,
  sandboxProvider: "alipay_sandbox",
  mode: "disabled",
  enabled: false,
  notifyUrlBaseKey: "CHINA_PAYMENT_ALIPAY_NOTIFY_URL_BASE",
  returnUrlBaseKey: "CHINA_PAYMENT_ALIPAY_RETURN_URL_BASE",
  secretReferenceKeys,
};

const disabledDecision = (
  operation: DisabledAlipayProviderOperation,
  payload?: Record<string, unknown>,
): DisabledAlipayProviderDecision => ({
  provider,
  mode: "disabled",
  enabled: false,
  blocked: true,
  operation,
  reason: disabledReason,
  rawPayloadDigest: payload
    ? digestRawPayload(JSON.stringify({ provider, operation, ...payload }))
    : undefined,
});

export const createDisabledAlipayProviderAdapter =
  (): DisabledAlipayProviderAdapter => ({
    config,

    createPayment(input) {
      return disabledDecision("create_payment", {
        merchantOrderRef: input.merchantOrderRef,
        amount: input.amount,
        subject: input.subject,
        notifyUrl: input.notifyUrl,
        returnUrlPresent: Boolean(input.returnUrl),
      });
    },

    queryPayment(input) {
      return disabledDecision("query_payment", {
        merchantOrderRef: input.merchantOrderRef,
        providerPaymentId: input.providerPaymentId,
      });
    },

    closePayment(input) {
      return disabledDecision("close_payment", {
        merchantOrderRef: input.merchantOrderRef,
        providerPaymentId: input.providerPaymentId,
        reason: input.reason,
      });
    },

    verifyNotification(input) {
      return disabledDecision("verify_notification", {
        formDigest: digestRawPayload(JSON.stringify(input.form)),
        signPresent: Boolean(input.form.sign),
        signTypePresent: Boolean(input.form.sign_type),
      });
    },

    normalizeNotification(input) {
      return disabledDecision("normalize_notification", {
        formDigest: digestRawPayload(JSON.stringify(input.form)),
        tradeNoPresent: Boolean(input.form.trade_no),
        outTradeNoPresent: Boolean(input.form.out_trade_no),
      });
    },
  });
