import { digestRawPayload } from "./idempotency";
import { ChinaPaymentNotificationMoney } from "./types";

export type WechatPayProviderName = "wechat_pay_sandbox" | "wechat_pay";

export type DisabledWechatPayProviderMode = "disabled";

export type WechatPayProviderSecretReferenceKeys = {
  appIdRef: "CHINA_PAYMENT_WECHAT_PAY_APP_ID_REF";
  mchIdRef: "CHINA_PAYMENT_WECHAT_PAY_MCH_ID_REF";
  privateKeyRef: "CHINA_PAYMENT_WECHAT_PAY_PRIVATE_KEY_REF";
  merchantCertSerialNoRef: "CHINA_PAYMENT_WECHAT_PAY_MERCHANT_CERT_SERIAL_NO_REF";
  apiV3KeyRef: "CHINA_PAYMENT_WECHAT_PAY_API_V3_KEY_REF";
  platformCertRef: "CHINA_PAYMENT_WECHAT_PAY_PLATFORM_CERT_REF";
  publicKeyIdRef: "CHINA_PAYMENT_WECHAT_PAY_PUBLIC_KEY_ID_REF";
};

export type DisabledWechatPayProviderConfig = {
  provider: Extract<WechatPayProviderName, "wechat_pay">;
  sandboxProvider: Extract<WechatPayProviderName, "wechat_pay_sandbox">;
  mode: DisabledWechatPayProviderMode;
  enabled: false;
  notifyUrlBaseKey: "CHINA_PAYMENT_WECHAT_PAY_NOTIFY_URL_BASE";
  returnUrlBaseKey: "CHINA_PAYMENT_WECHAT_PAY_RETURN_URL_BASE";
  secretReferenceKeys: WechatPayProviderSecretReferenceKeys;
};

export type WechatPayCreatePaymentInput = {
  merchantOrderRef: string;
  amount: ChinaPaymentNotificationMoney;
  description: string;
  notifyUrl: string;
  payerOpenId?: string;
  clientIp?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
};

export type WechatPayQueryPaymentInput = {
  merchantOrderRef: string;
  providerPaymentId: string;
};

export type WechatPayClosePaymentInput = {
  merchantOrderRef: string;
  providerPaymentId: string;
  reason: string;
};

export type WechatPayRawNotificationInput = {
  rawBody: string;
  headers: {
    "wechatpay-timestamp"?: string;
    "wechatpay-nonce"?: string;
    "wechatpay-signature"?: string;
    "wechatpay-serial"?: string;
    [key: string]: string | string[] | undefined;
  };
  receivedAt?: string;
};

export type DisabledWechatPayProviderOperation =
  | "create_payment"
  | "query_payment"
  | "close_payment"
  | "verify_and_decrypt_notification"
  | "normalize_notification";

export type DisabledWechatPayProviderDecision = {
  provider: Extract<WechatPayProviderName, "wechat_pay">;
  mode: DisabledWechatPayProviderMode;
  enabled: false;
  blocked: true;
  operation: DisabledWechatPayProviderOperation;
  reason: string;
  rawPayloadDigest?: string;
};

export type DisabledWechatPayProviderAdapter = {
  config: DisabledWechatPayProviderConfig;
  createPayment(input: WechatPayCreatePaymentInput): DisabledWechatPayProviderDecision;
  queryPayment(input: WechatPayQueryPaymentInput): DisabledWechatPayProviderDecision;
  closePayment(input: WechatPayClosePaymentInput): DisabledWechatPayProviderDecision;
  verifyAndDecryptNotification(
    input: WechatPayRawNotificationInput,
  ): DisabledWechatPayProviderDecision;
  normalizeNotification(
    input: WechatPayRawNotificationInput,
  ): DisabledWechatPayProviderDecision;
};

const provider: Extract<WechatPayProviderName, "wechat_pay"> = "wechat_pay";

const disabledReason =
  "WeChat Pay provider adapter is disabled by default and cannot be used before sandbox verification, DB-backed inbox rehearsal, and runtime gate approval.";

const secretReferenceKeys: WechatPayProviderSecretReferenceKeys = {
  appIdRef: "CHINA_PAYMENT_WECHAT_PAY_APP_ID_REF",
  mchIdRef: "CHINA_PAYMENT_WECHAT_PAY_MCH_ID_REF",
  privateKeyRef: "CHINA_PAYMENT_WECHAT_PAY_PRIVATE_KEY_REF",
  merchantCertSerialNoRef: "CHINA_PAYMENT_WECHAT_PAY_MERCHANT_CERT_SERIAL_NO_REF",
  apiV3KeyRef: "CHINA_PAYMENT_WECHAT_PAY_API_V3_KEY_REF",
  platformCertRef: "CHINA_PAYMENT_WECHAT_PAY_PLATFORM_CERT_REF",
  publicKeyIdRef: "CHINA_PAYMENT_WECHAT_PAY_PUBLIC_KEY_ID_REF",
};

const config: DisabledWechatPayProviderConfig = {
  provider,
  sandboxProvider: "wechat_pay_sandbox",
  mode: "disabled",
  enabled: false,
  notifyUrlBaseKey: "CHINA_PAYMENT_WECHAT_PAY_NOTIFY_URL_BASE",
  returnUrlBaseKey: "CHINA_PAYMENT_WECHAT_PAY_RETURN_URL_BASE",
  secretReferenceKeys,
};

const disabledDecision = (
  operation: DisabledWechatPayProviderOperation,
  payload?: Record<string, unknown>,
): DisabledWechatPayProviderDecision => ({
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

export const createDisabledWechatPayProviderAdapter =
  (): DisabledWechatPayProviderAdapter => ({
    config,

    createPayment(input) {
      return disabledDecision("create_payment", {
        merchantOrderRef: input.merchantOrderRef,
        amount: input.amount,
        description: input.description,
        notifyUrl: input.notifyUrl,
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

    verifyAndDecryptNotification(input) {
      return disabledDecision("verify_and_decrypt_notification", {
        rawBodyDigest: digestRawPayload(input.rawBody),
        serialPresent: Boolean(input.headers["wechatpay-serial"]),
        signaturePresent: Boolean(input.headers["wechatpay-signature"]),
      });
    },

    normalizeNotification(input) {
      return disabledDecision("normalize_notification", {
        rawBodyDigest: digestRawPayload(input.rawBody),
        serialPresent: Boolean(input.headers["wechatpay-serial"]),
      });
    },
  });
