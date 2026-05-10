import { ChinaPaymentNotificationEnvelope } from "./types";
import { AlipayNotificationVerifierContractResult } from "./alipay-notification-verifier";
import { AlipayFakeRawNotification } from "./alipay-test-vectors";

export type AlipayNotificationNormalizerFailureCode =
  | "ALIPAY_VERIFICATION_NOT_ACCEPTED"
  | "ALIPAY_APP_ID_MISMATCH"
  | "ALIPAY_SELLER_ID_MISMATCH"
  | "ALIPAY_TRADE_STATUS_UNSUPPORTED"
  | "ALIPAY_CURRENCY_UNSUPPORTED"
  | "ALIPAY_AMOUNT_INVALID"
  | "ALIPAY_AMOUNT_MISMATCH"
  | "ALIPAY_REFERENCE_MISSING";

export type AlipayNotificationNormalizerContractInput = {
  verification: AlipayNotificationVerifierContractResult;
  rawNotification: AlipayFakeRawNotification;
  expectedAppId: string;
  expectedSellerId: string;
  expectedAmount?: {
    value: number;
    currency: "CNY";
  };
};

export type AlipayNotificationNormalizerContractResult =
  | {
      normalized: true;
      envelope: ChinaPaymentNotificationEnvelope;
      fixtureOnly: true;
      executable: false;
    }
  | {
      normalized: false;
      provider: "alipay";
      failureCode: AlipayNotificationNormalizerFailureCode;
      failureMessage: string;
      riskFlags: string[];
      fixtureOnly: true;
      executable: false;
    };

const failed = (
  failureCode: AlipayNotificationNormalizerFailureCode,
  failureMessage: string,
  riskFlags: string[],
): AlipayNotificationNormalizerContractResult => ({
  normalized: false,
  provider: "alipay",
  failureCode,
  failureMessage,
  riskFlags,
  fixtureOnly: true,
  executable: false,
});

const mapTradeStatus = (
  tradeStatus: string,
): ChinaPaymentNotificationEnvelope["eventType"] | undefined => {
  if (tradeStatus === "TRADE_SUCCESS") {
    return "payment.succeeded";
  }

  if (tradeStatus === "TRADE_CLOSED") {
    return "payment.closed";
  }

  return undefined;
};

export const parseAlipayAmountToMinorUnitsContract = (
  amount: string,
): number | undefined => {
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    return undefined;
  }

  const [yuan, cents = ""] = amount.split(".");
  return Number(yuan) * 100 + Number(cents.padEnd(2, "0"));
};

export const normalizeAlipayNotificationContract = (
  input: AlipayNotificationNormalizerContractInput,
): AlipayNotificationNormalizerContractResult => {
  const { verification, rawNotification } = input;
  const { form } = rawNotification;

  if (verification.signatureStatus !== "verified") {
    return failed(
      "ALIPAY_VERIFICATION_NOT_ACCEPTED",
      "Alipay notification verification result is not accepted.",
      ["invalid_signature"],
    );
  }

  if (form.app_id !== input.expectedAppId) {
    return failed(
      "ALIPAY_APP_ID_MISMATCH",
      "Alipay notification app_id does not match the expected fake app id.",
      ["provider_app_mismatch"],
    );
  }

  if (form.seller_id !== input.expectedSellerId) {
    return failed(
      "ALIPAY_SELLER_ID_MISMATCH",
      "Alipay notification seller_id does not match the expected fake seller id.",
      ["provider_merchant_mismatch"],
    );
  }

  const eventType = mapTradeStatus(form.trade_status);

  if (!eventType) {
    return failed(
      "ALIPAY_TRADE_STATUS_UNSUPPORTED",
      "Alipay trade_status cannot be normalized to a payment event type.",
      ["unsupported_trade_status"],
    );
  }

  if (form.currency !== "CNY") {
    return failed(
      "ALIPAY_CURRENCY_UNSUPPORTED",
      "Alipay notification currency must be CNY.",
      ["currency_mismatch"],
    );
  }

  const amountValue = parseAlipayAmountToMinorUnitsContract(form.total_amount);

  if (amountValue === undefined) {
    return failed(
      "ALIPAY_AMOUNT_INVALID",
      "Alipay notification total_amount is invalid.",
      ["amount_invalid"],
    );
  }

  if (
    input.expectedAmount &&
    (input.expectedAmount.value !== amountValue ||
      input.expectedAmount.currency !== form.currency)
  ) {
    return failed(
      "ALIPAY_AMOUNT_MISMATCH",
      "Alipay notification amount does not match the expected amount.",
      ["amount_mismatch"],
    );
  }

  if (!form.out_trade_no || !form.trade_no || !form.notify_id) {
    return failed(
      "ALIPAY_REFERENCE_MISSING",
      "Alipay notification is missing order, trade, or notify reference.",
      ["unknown_merchant_order_ref"],
    );
  }

  const envelope: ChinaPaymentNotificationEnvelope = {
    provider: "alipay",
    eventId: form.notify_id,
    eventType,
    providerTransactionId: form.trade_no,
    merchantOrderRef: form.out_trade_no,
    amount: {
      value: amountValue,
      currency: "CNY",
    },
    occurredAt: form.notify_time,
    receivedAt: verification.verifiedAt,
    idempotencyKey: `payment_notify:alipay:${form.notify_id}`,
    signature: {
      status: verification.signatureStatus,
      algorithm: verification.signType,
      keyId: form.app_id,
      verifiedAt: verification.verifiedAt,
    },
    rawPayloadDigest: verification.rawPayloadDigest,
    riskFlags: [],
  };

  return {
    normalized: true,
    envelope,
    fixtureOnly: true,
    executable: false,
  };
};
